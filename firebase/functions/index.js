// Deploy in the same Firebase project. Only aggregate numbers leave the server.
import {initializeApp} from 'firebase-admin/app';
import {getDatabase,ServerValue} from 'firebase-admin/database';
import {onValueWritten} from 'firebase-functions/v2/database';
initializeApp();
export const cognilabStatistics=onValueWritten({ref:'/cognilab/{kind}/{uid}/{record}',instance:'hub-di-stimolazione-cognitiva-default-rtdb',region:'us-central1',maxInstances:1,concurrency:1},async event=>{
 if(!['presence','activity','feedback'].includes(event.params.kind))return;
 const database=getDatabase();
 const [presence,activity,feedback]=await Promise.all(['presence','activity','feedback'].map(name=>database.ref('cognilab/'+name).get()));
 const onlineUsers=Object.values(presence.val()||{}).filter(rows=>Object.values(rows||{}).some(value=>value===true)).length;
 const completedExercises=Object.values(activity.val()||{}).reduce((sum,rows)=>sum+Object.values(rows||{}).filter(value=>value===true).length,0);
 const validFeedback=Object.values(feedback.val()||{}).flatMap(rows=>Object.values(rows||{})).filter(row=>[row.q1,row.q2,row.q3].every(value=>Number.isInteger(value)&&value>=1&&value<=5));
 await database.ref('cognilab/stats').set({onlineUsers,completedExercises,feedbackCount:validFeedback.length,satisfactionAverage:validFeedback.length?validFeedback.reduce((sum,row)=>sum+row.q2,0)/validFeedback.length:null,updatedAt:ServerValue.TIMESTAMP});
});
