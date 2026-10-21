export const feedbackQuestions=[
 {key:'q1',label:'Chiarezza degli esercizi'},
 {key:'q2',label:'Gradimento e coinvolgimento'},
 {key:'q3',label:'Utilità percepita'}
];
export function summarizeFeedback(collection){
 const sums={q1:0,q2:0,q3:0};let count=0,latestAt=null;
 for(const entries of Object.values(collection&&typeof collection==='object'?collection:{})){
  if(!entries||typeof entries!=='object')continue;
  for(const row of Object.values(entries)){
   if(!row||!feedbackQuestions.every(({key})=>Number.isInteger(row[key])&&row[key]>=1&&row[key]<=5))continue;
   count++;for(const {key} of feedbackQuestions)sums[key]+=row[key];
   if(Number.isFinite(row.submittedAt)&&row.submittedAt>0)latestAt=Math.max(latestAt||0,row.submittedAt);
  }
 }
 return {count,overall:count?(sums.q1+sums.q2+sums.q3)/(count*3):null,averages:Object.fromEntries(feedbackQuestions.map(({key})=>[key,count?sums[key]/count:null])),latestAt};
}
