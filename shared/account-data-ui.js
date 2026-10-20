import {auth} from './firebase-client.js';
import {exportAccountData,prepareDataRequest} from './account-data.js?v=data32';
export function mountAccountData(host){
 const panel=document.createElement('details');panel.className='cl-account-data';
 panel.innerHTML='<summary>I miei dati</summary><p>Scarica il tuo profilo, lo storico personale, i programmi assegnati al tuo account e i risultati in attesa di sincronizzazione.</p><p class="cl-data-hint">Il file contiene dati personali: conservalo su un dispositivo riservato.</p><button type="button" class="btn" data-export>Scarica i miei dati (JSON)</button><p role="status" aria-live="polite" data-export-status></p><h3>Richiesta di cancellazione</h3><p>Prepara una richiesta per il gestore. Per i dati dei programmi assegnati sarà coinvolto anche il professionista.</p><label>Quali dati?<select data-request-scope><option value="">Scegli…</option value="account">Account e dati personali</option><option value="training">Storico degli allenamenti liberi</option><option value="clinical">Dati dei programmi assegnati</option></select></label><button type="button" class="btn" data-prepare>Prepara richiesta</button><div data-request-preview hidden><p>Destinatario: <strong>enrico.ao@gmail.com</strong></p><label>Bozza della richiesta<textarea readonly rows="8" data-request-body></textarea></label><a class="btn" data-request-mail>Apri app di posta</a><p>La richiesta viene inviata solo quando completi l’invio nella tua app di posta. Se non si apre, copia la bozza e inviala al destinatario indicato.</p></div><p role="status" aria-live="polite" data-request-status></p>';
 host.append(panel);
 const exportButton=panel.querySelector('[data-export]'),exportStatus=panel.querySelector('[data-export-status]'),requestStatus=panel.querySelector('[data-request-status]'),preview=panel.querySelector('[data-request-preview]'),body=panel.querySelector('[data-request-body]'),mail=panel.querySelector('[data-request-mail]');
 exportButton.onclick=async()=>{
  exportButton.disabled=true;exportStatus.textContent='Preparazione della copia dei dati…';
  try{const result=await exportAccountData();if(auth.currentUser?.uid!==result.account.uid)throw Error('Account cambiato. Riprova.');
   const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json;charset=utf-8'})),link=document.createElement('a');
   link.href=url;link.download='cognilab-dati-'+result.exportedAt.slice(0,10)+'.json';link.hidden=true;document.body.append(link);
   try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
   exportStatus.textContent=result.complete?'Download preparato. Controlla i download del browser.':'Download parziale preparato: alcune sezioni non sono state recuperate. Controlla l’elenco “unavailable” nel file e riprova con la connessione attiva.';
  }catch(error){exportStatus.textContent=error?.message||'Esportazione non disponibile. Riprova.';}finally{exportButton.disabled=false;}
 };
 function resetRequest(){preview.hidden=true;body.value='';mail.removeAttribute('href');requestStatus.textContent='';}
 panel.querySelector('[data-request-scope]').onchange=resetRequest;
 panel.querySelector('[data-prepare]').onclick=()=>{
  resetRequest();try{const request=prepareDataRequest(panel.querySelector('[data-request-scope]').value);body.value=request.body;mail.href=request.href;mail.dataset.accountUid=auth.currentUser.uid;preview.hidden=false;requestStatus.textContent='Bozza pronta. Rileggila, poi apri la tua app di posta per inviarla.';}catch(error){requestStatus.textContent=error.message;}
 };
 mail.onclick=event=>{if(mail.dataset.accountUid!==auth.currentUser?.uid){event.preventDefault();resetRequest();requestStatus.textContent='Account cambiato. Prepara nuovamente la richiesta.';}};
 return {reset(){resetRequest();panel.open=false;exportStatus.textContent='';}};
}
