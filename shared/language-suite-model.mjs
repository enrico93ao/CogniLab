import {words,shuffle} from './listen-picture-model.mjs';
export const extraWords=[['Albero','natura'],['Vaso','casa'],['Tavolo','casa'],['Cuccia','animali'],['Serratura','casa'],['Calzino','abbigliamento'],['Forchetta','cucina'],['Bicchiere','cucina'],['Cucchiaio','cucina'],['Carota','cibo']].map(([name,group])=>({name,group}));
export const pictureWords=[...words,...extraWords];
const phrases={Mela:'La mela rossa',Occhiali:'Un paio di occhiali',Telefono:'Il telefono',Chiave:'Una chiave',Scarpa:'Una scarpa marrone',Sedia:'Una sedia di legno',Auto:'La macchina rossa',Fiore:'Un fiore giallo',Gatto:'Il gatto',Casa:'Una casa',Palla:'Il pallone da calcio',Gelato:'Un cono gelato',Palloncino:'Un palloncino rosso',Cane:'Il cane',Razzo:'Un razzo',Pizza:'Una pizza',Elefante:'Un elefante'};
export const relations=[
 ['Mela','Albero','Su quale pianta cresce questo frutto?',['Cuccia','Vaso','Tavolo','Auto','Serratura']],
 ['Cane','Cuccia','Quale oggetto è una piccola casa per questo animale?',['Vaso','Tavolo','Albero','Scarpa','Bicchiere']],
 ['Chiave','Serratura','Dove si inserisce questo oggetto per aprire una porta?',['Vaso','Cuccia','Bicchiere','Forchetta','Calzino']],
 ['Fiore','Vaso','Quale contenitore puoi usare per mettere questo fiore?',['Tavolo','Cuccia','Serratura','Calzino','Auto']],
 ['Scarpa','Calzino','Quale indumento si mette sul piede prima di questa scarpa?',['Occhiali','Chiave','Forchetta','Telefono','Serratura']],
 ['Sedia','Tavolo','Quale mobile si usa insieme a questa sedia per mangiare?',['Cuccia','Vaso','Albero','Auto','Scarpa']],
 ['Gatto','Cane','Quale altro animale domestico vedi?',['Auto','Mela','Sedia','Razzo','Bicchiere']],
 ['Cane','Gatto','Quale altro animale domestico vedi?',['Casa','Palla','Scarpa','Pizza','Telefono']],
 ['Mela','Carota','Quale altro alimento di origine vegetale vedi?',['Chiave','Palla','Occhiali','Sedia','Telefono']],
 ['Pizza','Forchetta','Quale posata puoi usare per mangiare questo cibo?',['Chiave','Calzino','Occhiali','Bicchiere','Vaso']],
 ['Gelato','Cucchiaio','Quale posata puoi usare per mangiare il gelato?',['Chiave','Vaso','Telefono','Calzino','Occhiali']],
 ['Sedia','Casa','Quale edificio è un’abitazione per le persone?',['Auto','Razzo','Cuccia','Vaso','Albero']]
].map(([image,answer,prompt,distractors])=>({image,answer,prompt,distractors}));
export const functions=[
 ['Sedia','Quale oggetto usi per sederti?',['Tavolo','Vaso','Casa','Bicchiere','Albero']],
 ['Bicchiere','Quale oggetto usi per bere acqua?',['Forchetta','Cucchiaio','Vaso','Tavolo','Sedia']],
 ['Forchetta','Quale posata usi per infilzare un pezzo di cibo?',['Cucchiaio','Bicchiere','Chiave','Telefono','Vaso']],
 ['Cucchiaio','Quale posata usi per mangiare una minestra?',['Forchetta','Bicchiere','Chiave','Calzino','Telefono']],
 ['Chiave','Quale oggetto usi per aprire una serratura?',['Telefono','Forchetta','Occhiali','Scarpa','Vaso']],
 ['Telefono','Quale oggetto usi per chiamare una persona lontana?',['Occhiali','Chiave','Bicchiere','Forchetta','Calzino']],
 ['Occhiali','Quale oggetto indossi davanti agli occhi per vedere meglio?',['Scarpa','Calzino','Chiave','Telefono','Vaso']],
 ['Scarpa','Quale oggetto indossi ai piedi per camminare fuori casa?',['Calzino','Occhiali','Sedia','Chiave','Telefono']],
 ['Vaso','Quale contenitore usi per coltivare una pianta?',['Bicchiere','Sedia','Tavolo','Cuccia','Serratura']],
 ['Auto','Quale veicolo usi per viaggiare su strada?',['Razzo','Casa','Sedia','Cuccia','Tavolo']],
 ['Tavolo','Su quale mobile appoggi piatti e bicchieri per pranzare?',['Sedia','Vaso','Cuccia','Albero','Serratura']],
 ['Palla','Quale oggetto puoi calciare per giocare a calcio?',['Palloncino','Scarpa','Mela','Vaso','Bicchiere']]
].map(([answer,prompt,distractors])=>({answer,prompt,distractors}));
const story=(id,title,steps)=>({id,title,steps:steps.map(([caption,scene])=>({caption,scene}))});
export const stories=[
 story('fiore','Un fiore sul balcone',[['Anna prende un vaso vuoto.','pot-empty'],['Mette la terra nel vaso.','pot-soil'],['Mette un seme nella terra.','pot-seed'],['Anna annaffia la terra.','pot-water'],['Dopo alcuni giorni spunta un fiore.','pot-flower']]),
 story('mela','La merenda di Luca',[['Luca prende una mela dal tavolo.','apple-table'],['Lava la mela sotto l’acqua.','apple-wash'],['Asciuga la mela con un panno.','apple-dry'],['Taglia la mela a spicchi.','apple-cut'],['Mette gli spicchi nel piatto.','apple-plate']]),
 story('pizza','La pizza di Sara',[['Sara stende l’impasto sul tavolo.','pizza-dough'],['Aggiunge il pomodoro.','pizza-tomato'],['Mette la mozzarella sul pomodoro.','pizza-cheese'],['Cuoce la pizza nel forno.','pizza-oven'],['Porta la pizza cotta a tavola.','pizza-table']]),
 story('tavola','La tavola di Paolo',[['Paolo prepara il tavolo ancora vuoto.','table-empty'],['Stende una tovaglia sul tavolo.','table-cloth'],['Appoggia un piatto sulla tovaglia.','table-plate'],['Mette le posate accanto al piatto.','table-cutlery'],['Aggiunge un bicchiere e la tavola è pronta.','table-glass']]),
 story('fiore-regalo','Un piccolo regalo',[['Elena sceglie un fiore in un vaso.','gift-plant'],['Avvolge il vaso nella carta.','gift-paper'],['Lega un nastro intorno alla carta.','gift-ribbon'],['Aggiunge un biglietto al nastro.','gift-card'],['Porta il regalo a casa della nonna.','gift-home']])
];
export const sceneSteps=level=>level==='base'?[0,2,4]:level==='intermedio'?[0,1,3,4]:[0,1,2,3,4];
export function storyFor(item,level){const steps=sceneSteps(level).map(i=>item.steps[i]);return {...item,steps,text:steps.map(s=>s.caption).join(' ')};}
export function cycleDeck(bank,count,random=Math.random){if(!bank.length)throw Error('Banca vuota');const out=[];while(out.length<count){const batch=shuffle(bank,random);if(out.length&&batch.length>1&&batch[0]===out.at(-1))[batch[0],batch[1]]=[batch[1],batch[0]];out.push(...batch);}return out.slice(0,count);}
export function deckFor(mode,level,count,random=Math.random){
 if(mode==='story')return cycleDeck(stories,count,random).map(s=>storyFor(s,level));
 if(mode==='semantic')return cycleDeck(relations,count,random);
 if(mode==='function')return cycleDeck(functions,count,random);
 let bank=mode==='repeat'?words:pictureWords;
 if(mode==='repeat'&&level!=='avanzato')bank=bank.filter(w=>level==='base'?w.name.length<=5:w.name.length>=6);
 if(mode==='spell')bank=bank.filter(w=>level==='base'?w.name.length<=5:level==='intermedio'?w.name.length>=6&&w.name.length<=7:w.name.length>=8);
 return cycleDeck(bank,count,random).map(w=>({...w,text:mode==='repeat'&&level==='avanzato'?phrases[w.name]||w.name:w.name}));
}
export function optionsFor(item,level,random=Math.random){const count=level==='base'?2:level==='intermedio'?4:6;return shuffle([item.answer,...shuffle(item.distractors,random).slice(0,count-1)],random);}
export function letterTiles(word,level,random=Math.random){const letters=[...word.toUpperCase()];if(level==='avanzato'){const alphabet=[...'ABCDEFGILMNOPRSTUV'];const extras=shuffle(alphabet.filter(c=>!letters.includes(c)),random).slice(0,2);letters.push(...extras);}const tiles=shuffle(letters.map((letter,id)=>({letter,id})),random);if(tiles.map(t=>t.letter).join('')===word.toUpperCase()&&tiles.length>1){const j=tiles.findIndex(t=>t.letter!==tiles[0].letter);if(j>0)[tiles[0],tiles[j]]=[tiles[j],tiles[0]];}return tiles;}
export {shuffle};
