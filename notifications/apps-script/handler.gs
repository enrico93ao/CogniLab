// Deploy as a web app, execute as the owner. No administrator Firebase credential.
const FIREBASE_API_KEY='AIzaSyBBChH3sFfhwE4waQTzERtKGytJrucYEFM';
const DATABASE_URL='https://hub-di-stimolazione-cognitiva-default-rtdb.firebaseio.com';
function jsonResponse(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return jsonResponse({ok:true,service:'CogniLab assignment notifications'});}
function firebaseRead(path,idToken){
 const response=UrlFetchApp.fetch(DATABASE_URL+'/'+path+'.json?auth='+encodeURIComponent(idToken),{muteHttpExceptions:true});
 if(response.getResponseCode()!==200)throw Error('permission-denied');return JSON.parse(response.getContentText());
}
function doPost(event){
 let lock;
 try{
  if(!event?.postData?.contents||event.postData.contents.length>12000)throw Error('invalid-request');
  const {idToken,patientUid,programId}=JSON.parse(event.postData.contents);
  if(typeof idToken!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(patientUid||'')||!/^[A-Za-z0-9_-]{1,128}$/.test(programId||''))throw Error('invalid-request');
  const response=UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+FIREBASE_API_KEY,{method:'post',contentType:'application/json',payload:JSON.stringify({idToken}),muteHttpExceptions:true});
  if(response.getResponseCode()!==200)throw Error('login-required');
  const user=JSON.parse(response.getContentText()).users?.[0];if(!user?.localId||user.disabled)throw Error('login-required');
  const uid=user.localId;if(firebaseRead('cognilab/professionals/'+uid,idToken)!==true)throw Error('professional-required');
  const program=firebaseRead('cognilab/carePrograms/'+patientUid+'/'+programId,idToken);
  if(!program||program.professionalId!==uid||program.status!=='active')throw Error('program-not-authorized');
  if(firebaseRead('cognilab/careLinks/'+patientUid+'/'+uid,idToken)!==true)throw Error('link-required');
  const record=firebaseRead('cognilab/users/'+uid+'/clinical/registeredPatients/'+patientUid,idToken);
  const recipient=record?.notificationEmail;
  if(typeof recipient!=='string'||recipient.length>254||!/^\S+@\S+\.\S+$/.test(recipient)||/[\r\n,;]/.test(recipient))throw Error('patient-email-missing');
  lock=LockService.getScriptLock();if(!lock.tryLock(5000))throw Error('busy-retry');
  const properties=PropertiesService.getScriptProperties(),key='assignment-'+patientUid+'-'+programId;
  const previous=properties.getProperty(key);if(previous==='sent')return jsonResponse({ok:true,state:'already-sent'});if(previous==='sending')throw Error('delivery-uncertain');
  if(MailApp.getRemainingDailyQuota()<1)throw Error('daily-quota');
  const email=assignmentEmail(program,EXERCISE_TITLES);
  properties.setProperty(key,'sending');
  // A pending marker is intentionally retained on an uncertain failure, avoiding automatic duplicates.
  MailApp.sendEmail({to:recipient,subject:email.subject,body:email.body,name:'CogniLab'});
  properties.setProperty(key,'sent');return jsonResponse({ok:true,state:'sent'});
 }catch(error){const allowed=['invalid-request','permission-denied','login-required','professional-required','program-not-authorized','link-required','patient-email-missing','busy-retry','delivery-uncertain','daily-quota'];return jsonResponse({ok:false,code:allowed.includes(error.message)?error.message:'send-failed'});}
 finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
function authorizeMailer(){return MailApp.getRemainingDailyQuota();}
