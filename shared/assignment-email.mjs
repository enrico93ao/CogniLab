export function assignmentEmail(program,titles={}){
 const lines=['Ciao,','', 'Il tuo professionista ti ha assegnato un nuovo programma su CogniLab.','', 'PROGRAMMA: '+program.name,'Professionista: '+program.professionalName,'Sessioni previste: '+program.totalSessions,''];
 if(program.schedule?.length)lines.push('CALENDARIO',...program.schedule.map((date,i)=>'Sessione '+(i+1)+': '+date.split('-').reverse().join('/')),'');
 lines.push('PROVE DA SVOLGERE IN OGNI SESSIONE');
 let previous=null;
 for(let i=0;i<program.exercises.length;i++){
  const id=program.exercises[i];let configuration={};try{configuration=JSON.parse(program.configurations?.[i]||'{}');}catch{}
  const options=[...(configuration.controls||[]).filter(c=>c.type!=='radio'||c.checked).filter(c=>c.value!==undefined).map(c=>(c.key||'Opzione')+': '+(c.type==='checkbox'?(c.checked?'attivo':'disattivo'):c.value)),...(configuration.buttons||[]).map(b=>b.label).filter(Boolean)];
  lines.push((i+1)+'. '+(titles[id]||id)+(previous===id?' (ripetizione)':''));if(options.length)lines.push('   Impostazioni predisposte: '+options.join(' · '));previous=id;
 }
 if(program.instructions)lines.push('','INDICAZIONI DEL PROFESSIONISTA',program.instructions);
 lines.push('','COME INIZIARE, PASSAGGIO PER PASSAGGIO','1. Apri https://enrico93ao.github.io/CogniLab/accesso.html','2. Accedi con l’email e la password del tuo account personale.','3. Nella sezione “I programmi assegnati”, cerca “'+program.name+'”.','4. Premi “Inizia sessione” oppure “Riprendi la sessione”.','5. Troverai le impostazioni già predisposte: leggi le istruzioni e avvia l’esercizio.','6. Alla fine attendi la conferma del salvataggio e premi “Esercizio successivo”. Ripeti anche le prove previste più volte.','7. Completa tutte le prove per concludere la sessione. Se interrompi, potrai riprenderla dallo stesso punto.','8. Torna al programma nelle date indicate per svolgere le sessioni successive.','','Non rispondere con password o informazioni sanitarie. Per dubbi sul programma contatta il tuo professionista.');
 return {subject:'CogniLab: nuovo programma disponibile',body:lines.join('\n')};
}
