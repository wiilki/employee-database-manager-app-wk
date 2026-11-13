"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const routes = {
  "/": ["index.html","text/html; charset=utf-8"],
  "/index.html": ["index.html","text/html; charset=utf-8"],
  "/styles.css": ["styles.css","text/css; charset=utf-8"],
  "/app.js": ["app.js","application/javascript; charset=utf-8"]
};
const port = Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,"http://localhost").pathname;
  if(!["GET","HEAD"].includes(req.method)){res.writeHead(405,{Allow:"GET, HEAD"});res.end();return;}
  const match=Object.prototype.hasOwnProperty.call(routes,pathname)?routes[pathname]:null;
  if(!match){res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});res.end("Not found");return;}
  const file=path.join(root,match[0]);
  res.writeHead(200,{"Content-Type":match[1],"X-Content-Type-Options":"nosniff"});
  if(req.method==="HEAD"){res.end();return;}
  fs.createReadStream(file).pipe(res);
});
server.listen(port,()=>console.log("Northstar People preview: http://localhost:"+port));
