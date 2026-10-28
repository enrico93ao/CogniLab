// Fixed stimulus bank: every word has a corresponding image in the shared atlas.
export const words=[
 ['Mela','cibo'],['Occhiali','oggetti'],['Telefono','oggetti'],['Chiave','oggetti'],['Scarpa','oggetti'],['Sedia','casa'],['Auto','trasporti'],['Fiore','natura'],['Gatto','animali'],['Casa','casa'],['Palla','gioco'],['Gelato','cibo'],['Palloncino','gioco'],['Cane','animali'],['Razzo','trasporti'],['Pizza','cibo'],['Elefante','animali']
].map(([name,group])=>({name,group}));
export const levels={base:{count:2},intermedio:{count:4},avanzato:{count:6}};
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeDeck(count,random=Math.random){const deck=[];while(deck.length<count){const batch=shuffle(words,random);if(deck.length&&batch[0].name===deck.at(-1).name)[batch[0],batch[1]]=[batch[1],batch[0]];deck.push(...batch);}return deck.slice(0,count);}
export function choicesFor(target,level,random=Math.random){const count=(levels[level]||levels.base).count,others=words.filter(w=>w.name!==target.name);let distractors;
 if(level==='base')distractors=shuffle(others.filter(w=>w.group!==target.group),random);
 else distractors=[...shuffle(others.filter(w=>w.group===target.group),random),...shuffle(others.filter(w=>w.group!==target.group),random)];
 return shuffle([target,...distractors.slice(0,count-1)],random);
}
