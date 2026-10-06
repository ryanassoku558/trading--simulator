import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = {'/':'index.html','/app.js':'app.js','/style.css':'style.css','/trading.js':'trading.js','/supabase.js':'supabase.js'};
const types={html:'text/html',js:'text/javascript',css:'text/css'};
http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);return res.end('Not found');}try {res.setHeader('Content-Type',types[file.split('.').pop()]);res.end(await readFile(new URL(file,import.meta.url)));}catch{res.writeHead(500);res.end('Unable to load application');}}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Trading simulator listening on port '+(process.env.PORT||3000)));
