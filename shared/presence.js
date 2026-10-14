import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {ref,onValue,onDisconnect,set,remove} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {auth,db} from './firebase-client.js';
let current=null,stop;
onAuthStateChanged(auth,user=>{stop?.();if(current)remove(current).catch(()=>{});current=null;if(!user)return;const target=ref(db,`cognilab/presence/${user.uid}/${crypto.randomUUID()}`);current=target;stop=onValue(ref(db,'.info/connected'),async snap=>{if(snap.val()!==true||auth.currentUser?.uid!==user.uid)return;try{await onDisconnect(target).remove();await set(target,true);}catch{}});});
export async function disconnectPresence(){stop?.();stop=null;const target=current;current=null;if(target){await remove(target);await onDisconnect(target).cancel();}}
