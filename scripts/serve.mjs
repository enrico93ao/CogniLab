import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const port=Number(process.env.PORT||4173);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT deve essere un numero tra 1 e 65535.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname.startsWith('/CogniLab/'))pathname=pathname.slice('/CogniLab'.length);
 if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(part=>part.startsWith('.'))){res.writeHead(403);res.end();return;}
 let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
 }catch(error){res.writeHead(error instanceof URIError?400:404);res.end();}
});
server.listen(port,'127.0.0.1',()=>console.log(`CogniLab: http://127.0.0.1:${port}/ — interrompi con Ctrl+C`));
