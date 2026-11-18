"use strict";
const $=id=>document.getElementById(id), tabs=document.querySelectorAll(".tab");
let cipher="caesar";
const configs={caesar:["Caesar Cipher","Shift letters by a fixed amount.","HELLO","SHIFT KEY"],hill:["Hill Cipher","Encrypt letter pairs using a 2 × 2 matrix over the alphabet.","HELP","FIXED MATRIX KEY [[3,3],[2,5]]"],playfair:["Playfair Cipher","Encrypt letter pairs using a keyed 5 × 5 letter square.","INSTRUMENTS","KEY WORD"],rsa:["RSA Demonstration","Generate keys, then encrypt or decrypt an integer.","42","MESSAGE"]};
const mod=(n,m)=>(n%m+m)%m;
function inv(a,m){for(let x=1;x<m;x++)if(mod(a*x,m)===1)return x;return null}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function prime(n){if(!Number.isSafeInteger(n)||n<2)return false;for(let i=2;i<=Math.sqrt(n);i++)if(n%i===0)return false;return true}
function pow(a,e,n){let r=1;while(e){if(e%2)r=r*a%n;a=a*a%n;e=Math.floor(e/2)}return r}
function cleanLetters(s){if(!s.trim()||!/^[a-z]+$/i.test(s.trim()))throw Error("Enter letters only for this cipher.");return s.toUpperCase()}
function operate(dir){
 $("error-message").textContent="";
 try{
 let raw=$("message").value.trim();if(!raw)throw Error("Enter a message first.");
 let out="",steps=[];
 if(cipher==="caesar"){
  let k=$("key").value;if(!/^(0|[1-9]\d*)$/.test(k)||+k>25)throw Error("Shift key must be a whole number from 0 to 25.");
  k=+k;out=[...raw.toUpperCase()].map(c=>/[A-Z]/.test(c)?String.fromCharCode(mod(c.charCodeAt(0)-65+(dir==="encrypt"?k:-k),26)+65):c).join("");
  let letterSteps=[...raw.toUpperCase()].map(ch=>{if(!/[A-Z]/.test(ch))return ch+" stays unchanged";let from=ch.charCodeAt(0)-65,sign=dir==="encrypt"?1:-1,to=mod(from+sign*k,26);return ch+" ("+from+") "+(sign>0?"+":"−")+" "+k+" → "+to+" = "+String.fromCharCode(to+65)});steps=["Use A=0, B=1, …, Z=25.",(dir==="encrypt"?"Encrypt with (letter number + key) mod 26.":"Decrypt with (letter number − key) mod 26."),"Letter-by-letter: "+letterSteps.join("; ")+".","Result: "+out];
 }else if(cipher==="hill"){
  let s=cleanLetters(raw);if(s.length%2)s+="X";let det=9,di=inv(det,26),m=dir==="encrypt"?[[3,3],[2,5]]:[[mod(5*di,26),mod(-3*di,26)],[mod(-2*di,26),mod(3*di,26)]],pairSteps=[];
  for(let i=0;i<s.length;i+=2){let a=s.charCodeAt(i)-65,b=s.charCodeAt(i+1)-65,x=mod(m[0][0]*a+m[0][1]*b,26),y=mod(m[1][0]*a+m[1][1]*b,26);out+=String.fromCharCode(x+65)+String.fromCharCode(y+65);pairSteps.push(s.slice(i,i+2)+" ("+a+", "+b+") → [("+m[0][0]+"×"+a+" + "+m[0][1]+"×"+b+"), ("+m[1][0]+"×"+a+" + "+m[1][1]+"×"+b+")] mod 26 → "+String.fromCharCode(x+65)+String.fromCharCode(y+65))}
  steps=["Use A=0…Z=25 and matrix [[3,3],[2,5]].","Determinant = 9; its modular inverse mod 26 is 3. "+(dir==="encrypt"?"Multiply pairs by the key matrix.":"Use inverse matrix [[15,17],[20,9]]."),"Transform each pair: "+pairSteps.join("; ")+".","Result: "+out+(s.length!==raw.length?" (X padded the last pair).":"")];
 }else if(cipher==="playfair"){
  let key=cleanLetters($("key").value).replace(/J/g,"I"),alphabet="ABCDEFGHIKLMNOPQRSTUVWXYZ",letters=[...new Set(key+alphabet)],sq=Array.from({length:5},(_,r)=>letters.slice(r*5,r*5+5)),pos={};
  sq.forEach((row,r)=>row.forEach((c,col)=>pos[c]=[r,col]));
  let s=cleanLetters(raw).replace(/J/g,"I"),pairs=[];
  if(dir==="encrypt"){for(let i=0;i<s.length;){let a=s[i],b=s[i+1];if(!b||a===b){pairs.push(a+(a==="X"?"Q":"X"));i++}else{pairs.push(a+b);i+=2}}}else{if(s.length%2)throw Error("Playfair ciphertext must have an even number of letters.");pairs=s.match(/.{2}/g)||[]}
  let ps=[];pairs.forEach(pair=>{let [a,b]=pair,[r,c]=pos[a],[u,v]=pos[b],x,y;if(r===u){x=sq[r][mod(c+(dir==="encrypt"?1:-1),5)];y=sq[u][mod(v+(dir==="encrypt"?1:-1),5)]}else if(c===v){x=sq[mod(r+(dir==="encrypt"?1:-1),5)][c];y=sq[mod(u+(dir==="encrypt"?1:-1),5)][v]}else{x=sq[r][v];y=sq[u][c]}out+=x+y;let rule=r===u?"same row; move "+(dir==="encrypt"?"right":"left"):c===v?"same column; move "+(dir==="encrypt"?"down":"up"):"rectangle; swap columns";ps.push(pair+" at ("+(r+1)+","+(c+1)+") and ("+(u+1)+","+(v+1)+"): "+rule+" → "+x+y)});
  steps=["Make a 5×5 square from keyword "+key+" (I/J share one cell): "+sq.map(r=>r.join(" ")).join(" / ")+".","Prepare letter pairs"+(dir==="encrypt"?" (insert X between repeats; pad a final letter).":"."),...ps,"Result: "+out+". Fillers may need interpretation after decryption."];
 }else{
  let p=+$("prime-p").value,q=+$("prime-q").value;if(!prime(p)||!prime(q)||p===q)throw Error("Enter two distinct prime numbers.");let n=p*q,phi=(p-1)*(q-1);if(n>1000000000)throw Error("Choose smaller primes for this educational demo.");let e=3;while(e<phi&&gcd(e,phi)!==1)e++;let d=inv(e,phi),m;if(!/^\d+$/.test(raw))throw Error("RSA message must be a non-negative whole number.");m=+raw;if(!Number.isSafeInteger(m)||m>=n)throw Error("Message must be an integer from 0 to "+(n-1)+".");out=String(pow(m,dir==="encrypt"?e:d,n));steps=["Choose primes p="+p+" and q="+q+".","Calculate n=p×q="+n+" and φ(n)=(p−1)(q−1)="+phi+".","Choose e="+e+" with gcd(e, φ(n))=1. Find d so e×d mod φ(n)=1: "+e+"×"+d+" mod "+phi+" = 1.","Public key ("+e+", "+n+"); private key ("+d+", "+n+").",dir==="encrypt"?"Encrypt C=Mᵉ mod n = "+m+"^"+e+" mod "+n+" = "+out+".":"Decrypt M=Cᵈ mod n = "+m+"^"+d+" mod "+n+" = "+out+".","Educational only: real RSA needs huge keys and secure padding. This toy example is not secure."];
 }
 $("result").textContent=out;$("process").innerHTML="<ol>"+steps.map(s=>"<li>"+s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</li>").join("")+"</ol>";
 }catch(e){$("error-message").textContent=e.message}
}
function choose(name){cipher=name;let c=configs[name];$("cipher-title").textContent=c[0];$("cipher-description").textContent=c[1];$("message").value="";$("message").placeholder=c[2];$("key-label").textContent=c[3];$("key-wrap").classList.toggle("hidden",name==="rsa");$("rsa-wrap").classList.toggle("hidden",name!=="rsa");$("key").type=name==="playfair"?"text":name==="hill"?"text":"number";$("key").value=name==="playfair"?"MONARCHY":name==="hill"?"[[3, 3], [2, 5]]":"3";$("result").textContent="Your result will appear here";$("process").textContent="Your encryption or decryption steps will show up here.";tabs.forEach(t=>t.classList.toggle("active",t.dataset.tab===name))}
tabs.forEach(t=>t.addEventListener("click",()=>choose(t.dataset.tab)));
$("encrypt-button").addEventListener("click",()=>operate("encrypt"));$("decrypt-button").addEventListener("click",()=>operate("decrypt"));
$("cipher-form").addEventListener("submit",e=>{e.preventDefault();operate("encrypt")});
$("copy-button").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("result").textContent);$("copy-button").textContent="Copied!";setTimeout(()=>$("copy-button").textContent="Copy",1200)}catch{$("error-message").textContent="Clipboard unavailable; select the output to copy."}});
choose("caesar");


