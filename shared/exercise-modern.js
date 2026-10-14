// Await the existing save bridge before leaving a completed exercise.
document.addEventListener('click',async event=>{
 const link=event.target.closest('a[href="esercizi.html"]');
 const button=event.target.closest('button');
 const completed=document.getElementById('result-screen');
 const repeat=button?.getAttribute('onclick')==='location.reload()'&&completed&&!completed.classList.contains('hidden');
 if(!link&&!repeat)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(button)button.disabled=true;
 await window.CogniLabRun?.waitForSave?.();
 if(repeat){location.reload();return;}
 if(parent!==window)parent.postMessage({type:'cognilab-exit-v3'},location.origin);
 else location.href='esercizi.html';
},true);
