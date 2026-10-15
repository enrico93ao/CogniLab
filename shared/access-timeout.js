// A stalled Firebase connection must leave the login form usable.
export function withAccessTimeout(promise,code='access-timeout',ms=12000){
 let timer;
 return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error(code),{code})),ms);})]).finally(()=>clearTimeout(timer));
}
