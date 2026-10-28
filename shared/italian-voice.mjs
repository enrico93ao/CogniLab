// Speech is produced by the device. No microphone, recording or external service.
export class ItalianVoice {
 constructor(host=window){this.host=host;this.token=0;this.utterance=null;this.timeout=null;}
 cancel(){this.token++;this.host.clearTimeout(this.timeout);if(this.utterance){this.utterance.onend=null;this.utterance.onerror=null;}this.utterance=null;this.host.speechSynthesis?.cancel();}
 speak(text,rate,{done=()=>{},error=()=>{}}={}){
  this.cancel();const token=this.token,h=this.host,synth=h.speechSynthesis;
  const fail=()=>{if(token!==this.token)return;this.cancel();error();};
  if(!synth||!h.SpeechSynthesisUtterance){fail();return;}
  const voices=synth.getVoices(),voice=voices.find(v=>/^it(?:-|_)/i.test(v.lang));if(voices.length&&!voice){fail();return;}
  const utterance=new h.SpeechSynthesisUtterance(text);this.utterance=utterance;utterance.lang='it-IT';utterance.rate=rate;if(voice)utterance.voice=voice;
  utterance.onend=()=>{if(token!==this.token)return;h.clearTimeout(this.timeout);this.utterance=null;done();};utterance.onerror=fail;
  // Long stories are allowed more time than single words.
  this.timeout=h.setTimeout(fail,Math.max(12000,text.length*180));try{synth.speak(utterance);}catch{fail();}
 }
}
