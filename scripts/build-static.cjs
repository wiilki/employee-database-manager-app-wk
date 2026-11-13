"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const dist = path.join(root,"dist");
fs.mkdirSync(dist,{recursive:true});
for(const file of ["index.html","styles.css","app.js"]){
  fs.copyFileSync(path.join(root,file),path.join(dist,file));
}
console.log("Built static demo in dist/");
