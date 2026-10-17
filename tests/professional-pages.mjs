import fs from 'node:fs';import assert from 'node:assert/strict';const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');const profile=read('dott-enrico-dalessandro.html'),guide=read('valutazione-neuropsicologica.html');
assert.doesNotMatch(profile,/\b(?:data di nascita|residenza|cellulare)\b/i);
assert.doesNotMatch(profile,/\b\d{2}\/\d{2}\/\d{4}\b|\b\d{10}\b|\b\d{2,3}\/110\b/);
assert.ok(!profile.includes('Curriculum Vitae'));
for(const item of ['CBT-I','Crocetta','San Camillo','Beauregard','265','enrico-dalessandro.jpg'])assert.ok(profile.includes(item));
for(const item of ['neurologo','geriatra','Stimolazione','Riabilitazione','fonte-7'])assert.ok(guide.includes(item));
assert.ok(fs.statSync(new URL('../assets/professionista/enrico-dalessandro.jpg',import.meta.url)).size<250000);
for(const file of ['index.html','progetto-enrico-dalessandro.html']){const html=read(file);assert.ok(html.includes('dott-enrico-dalessandro.html'));assert.ok(html.includes('valutazione-neuropsicologica.html'));}
assert.ok(profile.includes('Sono Enrico D’Alessandro'));assert.ok(profile.includes('Prima di tutto, dare spazio alla tua storia'));assert.ok(!profile.includes('Nel CV')&&!profile.includes('il CV')&&!profile.includes('documentato nel curriculum'));
console.log('PASS: sourced professional facts; private CV details excluded; compact portrait; medical stages, sources and navigation.');
