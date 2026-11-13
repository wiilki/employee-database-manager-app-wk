"use strict";
/**
 * Secure, parameterized MySQL command-line manager.
 * Run DB_PASSWORD=... DB_USER=... npm start after importing db/schema.sql and db/seeds.sql.
 * Never place credentials in source control.
 */
const inquirer = require("inquirer");
require("console.table");
const mysql = require("mysql2/promise");

function connectionOptions(){
  if(!Object.prototype.hasOwnProperty.call(process.env,"DB_PASSWORD")){
    throw new Error("Missing DB_PASSWORD. Set DB_PASSWORD (and optionally DB_USER, DB_HOST, DB_PORT, DB_NAME) before starting.");
  }
  const port=Number(process.env.DB_PORT||3306);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error("DB_PORT must be a valid TCP port.");
  return {host:process.env.DB_HOST||"127.0.0.1",port,user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD,database:process.env.DB_NAME||"staff_db",decimalNumbers:true};
}
const select=async(db,query,values=[])=>{const [rows]=await db.execute(query,values);return rows;};
const prompt=questions=>inquirer.prompt(questions);
const askText=async(label,max=30)=>{
  const response=await prompt([{type:"input",name:"value",message:label,validate:s=>String(s).trim().length>0&&String(s).trim().length<=max?true:"Enter between 1 and "+max+" characters."}]);
  return String(response.value).trim();
};
const askMoney=async label=>{
  const response=await prompt([{type:"input",name:"value",message:label,validate:s=>Number.isFinite(Number(s))&&Number(s)>=0&&String(s).trim()!==""?true:"Enter a non-negative amount."}]);
  return Math.round(Number(response.value)*100)/100;
};
async function chooseRow(db,table,label,formatter){
  const tables={employee:"employee",role:"role",department:"department"};
  if(!tables[table])throw new Error("Invalid list.");
  const rows=await select(db,"SELECT * FROM "+tables[table]+" ORDER BY id");
  if(!rows.length){console.log("No "+label+" records yet.");return null;}
  const {id}=await prompt([{type:"list",name:"id",message:"Choose "+label+":",choices:[...rows.map(r=>({name:formatter(r),value:r.id})),{name:"Cancel",value:null}]}]);
  return id;
}
const employeeLabel=e=>e.first_name+" "+e.last_name+" (#"+e.id+")";
const roleLabel=r=>r.title+" (#"+r.id+")";
const deptLabel=d=>d.name+" (#"+d.id+")";
async function show(db,type){
  const queries={
    employees:"SELECT e.id,e.first_name,e.last_name, r.title AS role,d.name AS department,r.salary,CONCAT(m.first_name,' ',m.last_name) AS manager FROM employee e LEFT JOIN role r ON r.id=e.role_id LEFT JOIN department d ON d.id=r.department_id LEFT JOIN employee m ON m.id=e.manager_id ORDER BY e.last_name,e.first_name",
    roles:"SELECT r.id,r.title,d.name AS department,r.salary FROM role r LEFT JOIN department d ON d.id=r.department_id ORDER BY r.title",
    departments:"SELECT id,name FROM department ORDER BY name",
    budgets:"SELECT d.name AS department,COUNT(e.id) AS headcount,COALESCE(SUM(r.salary),0) AS utilized_budget FROM department d LEFT JOIN role r ON r.department_id=d.id LEFT JOIN employee e ON e.role_id=r.id GROUP BY d.id,d.name ORDER BY d.name",
    byManager:"SELECT e.id,e.first_name,e.last_name,CONCAT(m.first_name,' ',m.last_name) AS manager,r.title AS role FROM employee e JOIN employee m ON m.id=e.manager_id LEFT JOIN role r ON r.id=e.role_id ORDER BY manager,e.last_name",
    byDepartment:"SELECT d.name AS department,e.id,e.first_name,e.last_name,r.title AS role FROM employee e LEFT JOIN role r ON r.id=e.role_id LEFT JOIN department d ON d.id=r.department_id ORDER BY d.name,e.last_name"
  };
  const rows=await select(db,queries[type]);console.table(rows.length?rows:[]);
}
async function addDepartment(db){
  const name=await askText("Department name:");
  await db.execute("INSERT INTO department (name) VALUES (?)",[name]);
  console.log("Department added.");
}
async function addRole(db){
  const id=await chooseRow(db,"department","department",deptLabel);if(id==null)return;
  const title=await askText("Role title:");
  const salary=await askMoney("Annual salary (USD):");
  await db.execute("INSERT INTO role (title,salary,department_id) VALUES (?,?,?)",[title,salary,id]);
  console.log("Role added.");
}
async function addEmployee(db){
  const roleId=await chooseRow(db,"role","role",roleLabel);if(roleId==null)return;
  const first=await askText("First name:"),last=await askText("Last name:");
  const employees=await select(db,"SELECT id,first_name,last_name FROM employee ORDER BY last_name");
  const {managerId}=await prompt([{type:"list",name:"managerId",message:"Manager:",choices:[{name:"No manager",value:null},...employees.map(e=>({name:employeeLabel(e),value:e.id}))]}]);
  await db.execute("INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)",[first,last,roleId,managerId]);
  console.log("Employee added.");
}
async function updateEmployeeRole(db){
  const employeeId=await chooseRow(db,"employee","employee",employeeLabel);if(employeeId==null)return;
  const roleId=await chooseRow(db,"role","role",roleLabel);if(roleId==null)return;
  await db.execute("UPDATE employee SET role_id=? WHERE id=?",[roleId,employeeId]);
  console.log("Employee role updated.");
}
async function updateEmployeeManager(db){
  const employeeId=await chooseRow(db,"employee","employee",employeeLabel);if(employeeId==null)return;
  const employees=await select(db,"SELECT id,first_name,last_name,manager_id FROM employee");
  const {managerId}=await prompt([{type:"list",name:"managerId",message:"New manager:",choices:[{name:"No manager",value:null},...employees.filter(e=>e.id!==employeeId).map(e=>({name:employeeLabel(e),value:e.id}))]}]);
  if(managerId!==null){
    const seen=new Set([employeeId]);const chain=new Map(employees.map(e=>[e.id,e.manager_id]));let cursor=managerId;
    while(cursor!==null){if(seen.has(cursor)){console.log("Cannot create a circular reporting chain.");return;}seen.add(cursor);cursor=chain.get(cursor)??null;}
  }
  await db.execute("UPDATE employee SET manager_id=? WHERE id=?",[managerId,employeeId]);console.log("Manager updated.");
}
async function removeRecord(db,table,formatter){
  const id=await chooseRow(db,table,table,formatter);if(id==null)return;
  const {confirmed}=await prompt([{type:"confirm",name:"confirmed",message:"Permanently delete this "+table+"?",default:false}]);if(!confirmed)return;
  const tables={employee:"employee",role:"role",department:"department"};
  // The table name is a fixed allowlisted literal; all values are bound parameters.
  await db.execute("DELETE FROM "+tables[table]+" WHERE id=?",[id]);console.log("Deleted.");
}
const ACTIONS=[
  ["View all employees",db=>show(db,"employees")],
  ["View employees by manager",db=>show(db,"byManager")],
  ["View employees by department",db=>show(db,"byDepartment")],
  ["View job roles",db=>show(db,"roles")],
  ["View departments",db=>show(db,"departments")],
  ["View department payroll budgets",db=>show(db,"budgets")],
  ["Add employee",addEmployee],
  ["Change employee role",updateEmployeeRole],
  ["Change employee manager",updateEmployeeManager],
  ["Delete employee",db=>removeRecord(db,"employee",employeeLabel)],
  ["Add job role",addRole],
  ["Delete job role",db=>removeRecord(db,"role",roleLabel)],
  ["Add department",addDepartment],
  ["Delete department",db=>removeRecord(db,"department",deptLabel)]
];
async function main(){
  let db;
  try{
    db=await mysql.createConnection(connectionOptions());
    console.log("\nNorthstar People | MySQL CLI\nConnected to "+(process.env.DB_NAME||"staff_db")+".\n");
    while(true){
      const {action}=await prompt([{type:"list",name:"action",message:"What would you like to do?",choices:[...ACTIONS.map((item,i)=>({name:item[0],value:i})),{name:"Quit",value:-1}]}]);
      if(action===-1)break;
      try{await ACTIONS[action][1](db);}
      catch(error){console.error("Operation failed:",error.code||error.message);console.log("Check foreign-key constraints and valid inputs, then retry.");}
    }
  }finally{if(db)await db.end();}
}
if(require.main===module){main().catch(error=>{console.error("Unable to start:",error.message);process.exitCode=1;});}
module.exports={connectionOptions};