/* A task-local clock: Firebase and the browser keep their own real timers. */
(() => {
 class TaskClock {
  constructor(){this.jobs=new Map();this.nextId=0;this.offset=0;this.pausedAt=null;}
  get paused(){return this.pausedAt!==null;}
  now(){return (this.pausedAt??Date.now())-this.offset;}
  schedule(callback,delay=0,interval=0,frame=false){const id=++this.nextId;const job={callback,at:this.now()+Math.max(0,delay),interval,frame,handle:null};this.jobs.set(id,job);this.arm(id,job);return id;}
  arm(id,job){if(this.paused)return;const run=()=>{if(this.paused||!this.jobs.has(id))return;if(!job.interval)this.jobs.delete(id);else job.at=this.now()+job.interval;try{job.callback(this.now());}finally{if(job.interval&&this.jobs.has(id))this.arm(id,job);}};job.handle=job.frame?requestAnimationFrame(run):setTimeout(run,Math.max(0,job.at-this.now()));}
  setTimeout(callback,delay){return this.schedule(callback,delay);}
  setInterval(callback,delay){return this.schedule(callback,delay,Math.max(1,delay));}
  requestAnimationFrame(callback){return this.schedule(callback,0,0,true);}
  clear(id){const job=this.jobs.get(id);if(!job)return;if(job.frame)cancelAnimationFrame(job.handle);else clearTimeout(job.handle);this.jobs.delete(id);}
  clearTimeout(id){this.clear(id);}
  clearInterval(id){this.clear(id);}
  cancelAnimationFrame(id){this.clear(id);}
  pause(){if(this.paused)return;this.pausedAt=Date.now();for(const job of this.jobs.values()){if(job.frame)cancelAnimationFrame(job.handle);else clearTimeout(job.handle);}}
  resume(){if(!this.paused)return;this.offset+=Date.now()-this.pausedAt;this.pausedAt=null;for(const [id,job] of this.jobs)this.arm(id,job);}
  cancelAll(){for(const id of [...this.jobs.keys()])this.clear(id);}
  reset(){this.cancelAll();this.pausedAt=null;this.offset=0;}
 }
 window.CogniLabTaskClock=TaskClock;
})();
