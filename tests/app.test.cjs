"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("browser app JavaScript parses without a bundler",()=>{
  assert.doesNotThrow(()=>new vm.Script(read("app.js"),{filename:"app.js"}));
});
test("dashboard has navigation, employee editor, and accessible dialog",()=>{
  const html=read("index.html");
  for(const marker of ['data-nav="overview"','data-nav="employees"','data-nav="departments"','data-nav="roles"','data-nav="analytics"','id="overlay"','aria-modal="true"','id="content"']){
    assert.ok(html.includes(marker),marker);
  }
});
test("public website contains only a browser-local demo",()=>{
  const html=read("index.html");
  const app=read("app.js");
  assert.ok(app.includes("localStorage"));
  assert.ok(app.includes("northstar.example"));
  assert.ok(!html.includes("DB_PASSWORD"));
  assert.ok(!app.includes("mysql2"));
});
test("CLI has no embedded password and uses bound parameters",()=>{
  const cli=read("index.js");
  assert.ok(cli.includes("process.env.DB_PASSWORD"));
  assert.ok(cli.includes("VALUES (?,?,?,?)"));
  assert.ok(!cli.includes("password: '5758'"));
});
test("production output contains only explicitly public assets",()=>{
  const build=read("scripts/build-static.cjs");
  assert.ok(build.includes('["index.html","styles.css","app.js"]'));
  const config=JSON.parse(read("vercel.json"));
  assert.equal(config.outputDirectory,"dist");
  assert.equal(config.headers[0].headers.find(item=>item.key==="X-Content-Type-Options").value,"nosniff");
});
