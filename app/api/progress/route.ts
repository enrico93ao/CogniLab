import { database } from '@/db/raw';
import { z } from 'zod';
const sessionSchema = z.object({
  id: z.string().uuid(),
  exercise: z.enum(['stroop','memory','letters','intruder','calculation','opposite','search','logic']),
  level: z.number().int().min(1).max(3),
  correct: z.number().int().min(0).max(10),
  total: z.literal(10),
  seconds: z.number().int().min(0).max(86400),
});
const profileSchema = z.object({type:z.literal('profile'),name:z.string().trim().max(50),goal:z.number().int().min(1).max(7)});
export async function GET() {
  try {
    const db = database();
    const rows = await db.prepare('SELECT * FROM sessions ORDER BY created DESC').all();
    const profile = await db.prepare('SELECT name, goal FROM profile WHERE id=1').first();
    return Response.json({sessions:rows.results,profile:profile||{name:'',goal:3}},{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    console.error(error);
    return Response.json({error:'Impossibile caricare i progressi. Riprova tra poco.'},{status:503});
  }
}
export async function POST(req: Request) {
  if(req.headers.get('origin') !== new URL(req.url).origin) return Response.json({error:'Richiesta non valida.'},{status:403});
  let payload:unknown;
  try {payload=await req.json();}catch{return Response.json({error:'Dati non validi.'},{status:400});}
  const parsed=z.union([profileSchema,sessionSchema]).safeParse(payload);
  if(!parsed.success)return Response.json({error:'Controlla i dati e riprova.'},{status:400});
  const d=parsed.data;
  try {
    const db=database();
    if('type' in d) {
      await db.prepare('INSERT INTO profile (id,name,goal) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,goal=excluded.goal').bind(d.name,d.goal).run();
    } else {
      await db.prepare('INSERT INTO sessions (id,exercise,level,correct,total,seconds,created) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(d.id,d.exercise,d.level,d.correct,d.total,d.seconds,new Date().toISOString()).run();
    }
    return Response.json({ok:true});
  } catch(error) {
    console.error(error);
    return Response.json({error:'Salvataggio non riuscito. Il risultato rimane visibile: riprova.'},{status:503});
  }
}
