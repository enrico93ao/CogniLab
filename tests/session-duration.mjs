import assert from 'node:assert/strict';
import {exerciseDuration,sessionDuration,durationLabel} from '../shared/session-duration.mjs';
const config=(controls=[],buttons=[])=>JSON.stringify({format:1,controls,buttons});
const piano=min=>config([{key:'music-duration',type:'select-one',value:String(min)}]);
assert.equal(exerciseDuration('il-pianoforte',piano(4)).minSeconds,240);
assert.equal(exerciseDuration('esplorazione-visuospaziale',config([],[{label:'1.5m'}])).minSeconds,90);
assert.equal(exerciseDuration('inibizione-memoria',config([],[{label:'5m'}])).minSeconds,300);
assert.equal(exerciseDuration('cifrario',config([],[{label:'180 Secondi'}])).minSeconds,180);
assert.equal(exerciseDuration('riordina-lettere',config([{key:'duration',type:'radio',value:'60',checked:false},{key:'duration',type:'radio',value:'300',checked:true}])).minSeconds,300);
for(const id of ['silhouette','n-back-semantico','conta-numeri-lettere']){const value=exerciseDuration(id,config([{key:'exposure-time',value:'4'}],[{label:'20 Prove'}]));assert.equal(value.variable,1);assert.equal(value.minSeconds,120);assert.equal(value.maxSeconds,300);}
const sum=sessionDuration({exercises:['il-pianoforte','il-pianoforte','orientamento'],configurations:[piano(2),piano(6),config()]});assert.equal(sum.minSeconds,600);assert.equal(sum.maxSeconds,780);assert.match(durationLabel(sum),/10–13 min/);
assert.equal(sessionDuration({exercises:[]}).trials,0);assert.match(durationLabel(sessionDuration()),/Aggiungi/);assert.equal(exerciseDuration('il-pianoforte','invalid').unconfigured,1);
console.log('PASS: duration units, independent variants, selected radio only, totals, incomplete presets and variable tasks; exposure times/trial counts are not session timers.');
