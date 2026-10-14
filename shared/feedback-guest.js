import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import {getAuth,setPersistence,inMemoryPersistence,signInAnonymously} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {getDatabase} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
import {firebaseConfig} from './firebase-client.js';
let guestPromise;
export async function guestFeedbackClient(){
  if(!guestPromise) guestPromise=(async()=>{
    const app=getApps().find(item=>item.name==='cognilab-feedback')||initializeApp(firebaseConfig,'cognilab-feedback');
    const auth=getAuth(app);
    await setPersistence(auth,inMemoryPersistence);
    try{
      const user=auth.currentUser||(await signInAnonymously(auth)).user;
      return {user,db:getDatabase(app)};
    }catch(error){
      if(error.code==='auth/operation-not-allowed')throw Object.assign(new Error('Guest feedback disabled'),{code:'guest-feedback-disabled'});
      throw error;
    }
  })();
  try{return await guestPromise;}catch(error){guestPromise=null;throw error;}
}
