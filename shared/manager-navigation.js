import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import {auth} from './firebase-client.js';
import {requireProfessional} from './clinical-access.js';
// Patient access creation belongs only to the approved owner’s clinical workspace.
const ownerUid='eWoQhl1qwqVKRupDabTM6vfMyyI3';
const panel=document.getElementById('cl-tester-management');
let revision=0;
onAuthStateChanged(auth,async user=>{
 const current=++revision;
 if(panel){panel.hidden=true;panel.style.display='none';}
 document.getElementById('cl-create-patient-access')?.remove();
 if(user?.uid!==ownerUid||localStorage.getItem('hub_mode')!=='clinical')return;
 try{
  const professional=await requireProfessional();
  if(current!==revision||auth.currentUser?.uid!==professional.uid||professional.uid!==ownerUid)return;
  if(panel){panel.hidden=false;panel.style.display='block';}
  const link=document.createElement('a');link.id='cl-create-patient-access';link.className='btn';link.href='gestisci-tester.html';link.textContent='Crea accesso paziente';
  link.style.cssText='text-decoration:none;display:inline-flex;align-items:center;min-height:44px;padding:10px 14px;white-space:normal';
  document.querySelector('.nav-left-cluster')?.append(link);
 }catch{/* The management page explains role or account problems without granting access. */}
});
