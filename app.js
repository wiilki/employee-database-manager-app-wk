"use strict";

const STORAGE_KEY = "northstar-people-demo-v2";
const ALLOWED_VIEWS = ["overview", "employees", "departments", "roles", "analytics"];
const COLORS = ["#7965dc", "#56b6a2", "#efa765", "#599ad4", "#d781a9", "#718ad8", "#a8b05c"];
const ICON = (name, extra = "") => `<svg class="ico ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const html = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const usd = value => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(value)||0);
const compactMoney = value => Number(value) >= 1000000 ? "$" + (Number(value)/1000000).toFixed(2).replace(/0$/,"").replace(/\.$/,"") + "M" : "$" + Math.round(Number(value)/1000) + "K";
const formatDate = input => input ? new Date(input + "T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const initials = item => ((item.first_name || "").charAt(0) + (item.last_name || "").charAt(0)).toUpperCase();
const today = new Date().toISOString().slice(0,10);
const $ = selector => document.querySelector(selector);

function seedData() {
  return {
    version:2,
    departments:[
      {id:1,name:"Engineering",budget:1250000},{id:2,name:"Design",budget:680000},
      {id:3,name:"Marketing",budget:550000},{id:4,name:"Finance",budget:480000},
      {id:5,name:"People & Culture",budget:420000}
    ],
    roles:[
      {id:1,title:"Staff Engineer",salary:178000,departmentId:1},
      {id:2,title:"Software Engineer",salary:142000,departmentId:1},
      {id:3,title:"Engineering Manager",salary:196000,departmentId:1},
      {id:4,title:"Product Designer",salary:128000,departmentId:2},
      {id:5,title:"Design Lead",salary:165000,departmentId:2},
      {id:6,title:"Marketing Manager",salary:135000,departmentId:3},
      {id:7,title:"Growth Specialist",salary:95000,departmentId:3},
      {id:8,title:"Finance Lead",salary:157000,departmentId:4},
      {id:9,title:"Financial Analyst",salary:104000,departmentId:4},
      {id:10,title:"People Partner",salary:99000,departmentId:5},
      {id:11,title:"Head of People",salary:165000,departmentId:5}
    ],
    employees:[
      {id:1,first_name:"Olivia",last_name:"Bennett",email:"olivia.bennett@northstar.example",roleId:3,managerId:null,status:"Active",joined:"2022-04-12",location:"San Francisco"},
      {id:2,first_name:"Marcus",last_name:"Chen",email:"marcus.chen@northstar.example",roleId:1,managerId:1,status:"Active",joined:"2023-01-17",location:"San Francisco"},
      {id:3,first_name:"Ava",last_name:"Patel",email:"ava.patel@northstar.example",roleId:2,managerId:1,status:"Active",joined:"2024-06-10",location:"Remote"},
      {id:4,first_name:"Noah",last_name:"Williams",email:"noah.williams@northstar.example",roleId:2,managerId:1,status:"Active",joined:"2025-09-03",location:"Austin"},
      {id:5,first_name:"Sofia",last_name:"Rivera",email:"sofia.rivera@northstar.example",roleId:2,managerId:1,status:"On leave",joined:"2024-02-20",location:"New York"},
      {id:6,first_name:"Isabella",last_name:"Morgan",email:"isabella.morgan@northstar.example",roleId:5,managerId:null,status:"Active",joined:"2022-07-21",location:"New York"},
      {id:7,first_name:"Ethan",last_name:"Brooks",email:"ethan.brooks@northstar.example",roleId:4,managerId:6,status:"Active",joined:"2023-11-02",location:"Remote"},
      {id:8,first_name:"Mia",last_name:"Anderson",email:"mia.anderson@northstar.example",roleId:4,managerId:6,status:"Active",joined:"2025-05-15",location:"San Francisco"},
      {id:9,first_name:"Liam",last_name:"Foster",email:"liam.foster@northstar.example",roleId:4,managerId:6,status:"Active",joined:"2026-08-08",location:"Austin"},
      {id:10,first_name:"Charlotte",last_name:"Kim",email:"charlotte.kim@northstar.example",roleId:6,managerId:null,status:"Active",joined:"2023-02-14",location:"San Francisco"},
      {id:11,first_name:"Lucas",last_name:"Turner",email:"lucas.turner@northstar.example",roleId:7,managerId:10,status:"Active",joined:"2025-10-08",location:"Remote"},
      {id:12,first_name:"Amelia",last_name:"Johnson",email:"amelia.johnson@northstar.example",roleId:7,managerId:10,status:"Inactive",joined:"2024-04-08",location:"Austin"},
      {id:13,first_name:"James",last_name:"Davis",email:"james.davis@northstar.example",roleId:8,managerId:null,status:"Active",joined:"2022-09-13",location:"New York"},
      {id:14,first_name:"Harper",last_name:"Lee",email:"harper.lee@northstar.example",roleId:9,managerId:13,status:"Active",joined:"2024-12-09",location:"Remote"},
      {id:15,first_name:"Benjamin",last_name:"Clark",email:"benjamin.clark@northstar.example",roleId:9,managerId:13,status:"Active",joined:"2026-01-26",location:"Austin"},
      {id:16,first_name:"Grace",last_name:"Martinez",email:"grace.martinez@northstar.example",roleId:11,managerId:null,status:"Active",joined:"2023-04-16",location:"San Francisco"},
      {id:17,first_name:"Henry",last_name:"Scott",email:"henry.scott@northstar.example",roleId:10,managerId:16,status:"Active",joined:"2024-08-12",location:"Remote"},
      {id:18,first_name:"Ella",last_name:"Thompson",email:"ella.thompson@northstar.example",roleId:10,managerId:16,status:"Active",joined:"2026-10-05",location:"New York"}
    ]
  };
}
function loadData(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved && saved.version === 2 && Array.isArray(saved.employees) && Array.isArray(saved.roles) && Array.isArray(saved.departments)) return saved;
  }catch(error){ console.warn("Demo storage unavailable; using sample data."); }
  return seedData();
}
let data = loadData();
let view = ALLOWED_VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
let filters = {query:"",department:"all",status:"all",sort:"name"};
let editor = null;
let toastTimer;
const personById = id => data.employees.find(e => e.id === Number(id));
const roleById = id => data.roles.find(r => r.id === Number(id));
const departmentById = id => data.departments.find(d => d.id === Number(id));
const roleOf = employee => roleById(employee.roleId);
const departmentOf = employee => departmentById(roleOf(employee)?.departmentId);
const nameOf = employee => employee ? employee.first_name + " " + employee.last_name : "—";
const staffForDepartment = id => data.employees.filter(e => departmentOf(e)?.id === id);
const annualPayroll = staff => staff.filter(e => e.status !== "Inactive").reduce((sum,e)=>sum+(roleOf(e)?.salary||0),0);
const staffSalary = employee => roleOf(employee)?.salary || 0;
const colorFor = id => COLORS[(Number(id)-1+COLORS.length)%COLORS.length];
const avatar = employee => `<span class="avatar" style="background:${colorFor(employee.id)}18;color:${colorFor(employee.id)}">${html(initials(employee))}</span>`;

function persist(message){
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
  catch(error){notify("Change saved in memory, but browser storage is unavailable.");}
  render();
  if(message) notify(message);
}
function notify(message){
  clearTimeout(toastTimer);
  const el=$("#toast");
  el.textContent=message;el.hidden=false;
  toastTimer=setTimeout(()=>{el.hidden=true;},3600);
}
function labelStatus(status){
  const klass=status==="Active"?"active":status==="On leave"?"leave":"inactive";
  return `<span class="tag ${klass}">${html(status)}</span>`;
}
function metric(label,value,foot,icon,tint=""){
  return `<section class="metric-card"><div class="metric-head"><span class="metric-label">${html(label)}</span><span class="metric-icon ${tint}">${ICON(icon)}</span></div><div><div class="metric-number">${html(value)}</div><div class="metric-foot">${foot}</div></div></section>`;
}
function pageHeading(eyebrow,title,subtitle,right=""){
  return `<div class="page-heading"><div><div class="eyebrow">${html(eyebrow)}</div><h1>${html(title)}</h1><p>${html(subtitle)}</p></div>${right}</div>`;
}
function employeeTable(staff,compact=false){
  if(!staff.length) return `<div class="empty-state">${ICON("people")}<h3>No employees found</h3><p>Try different filters or add a new employee.</p><button type="button" class="button secondary" data-action="clear-filters">Clear filters</button></div>`;
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Status</th><th>${compact?"Joined":"Manager"}</th><th style="text-align:right">Actions</th></tr></thead><tbody>${staff.map(employee=>{
    const role=roleOf(employee), dept=departmentOf(employee), manager=personById(employee.managerId);
    return `<tr><td><div class="person-cell">${avatar(employee)}<span><strong>${html(nameOf(employee))}</strong><small>${html(employee.email||"No email")}</small></span></div></td><td>${html(role?.title||"Unassigned")}</td><td>${html(dept?.name||"Unassigned")}</td><td>${labelStatus(employee.status)}</td><td class="cell-muted">${html(compact?formatDate(employee.joined):nameOf(manager))}</td><td><div class="row-actions"><button class="small-icon-button" type="button" title="Edit employee" aria-label="Edit ${html(nameOf(employee))}" data-action="edit-employee" data-id="${employee.id}">${ICON("edit")}</button><button class="small-icon-button delete" type="button" title="Remove employee" aria-label="Remove ${html(nameOf(employee))}" data-action="delete-employee" data-id="${employee.id}">${ICON("trash")}</button></div></td></tr>`;
  }).join("")}</tbody></table></div>`;
}
function departmentDistribution(){
  const max=Math.max(1,...data.departments.map(d=>staffForDepartment(d.id).length));
  return `<div class="distribution-list">${data.departments.map(dept=>{
    const count=staffForDepartment(dept.id).length;
    return `<div class="distribution-item"><span class="distribution-name">${html(dept.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${count/max*100}%;background:${colorFor(dept.id)}"></div></div><span class="bar-value">${count}</span></div>`;
  }).join("")}</div>`;
}
function healthDonut(){
  const total=Math.max(1,data.employees.length);
  const active=data.employees.filter(e=>e.status==="Active").length;
  const leave=data.employees.filter(e=>e.status==="On leave").length;
  const inactive=data.employees.filter(e=>e.status==="Inactive").length;
  const p=active/total*100, q=(active+leave)/total*100;
  return `<div class="health-layout"><div class="donut" style="background:conic-gradient(#61c5a0 0% ${p}%,#f1b46e ${p}% ${q}%,#dce2ec ${q}% 100%)"><div class="donut-center"><strong>${Math.round(p)}%</strong><span>Active team</span></div></div><div class="health-legend"><div class="legend-line"><span class="legend-name"><span class="legend-dot" style="background:#61c5a0"></span>Active</span><strong>${active}</strong></div><div class="legend-line"><span class="legend-name"><span class="legend-dot" style="background:#f1b46e"></span>On leave</span><strong>${leave}</strong></div><div class="legend-line"><span class="legend-name"><span class="legend-dot" style="background:#dce2ec"></span>Inactive</span><strong>${inactive}</strong></div></div></div>`;
}
function renderOverview(){
  const recent=[...data.employees].sort((a,b)=>(b.joined||"").localeCompare(a.joined||"")).slice(0,5);
  const active=data.employees.filter(e=>e.status==="Active").length;
  return `<div class="page">${pageHeading("PEOPLE OVERVIEW","Your people, at a glance.","A clearer picture of your team, all in one place.",`<span class="heading-aside">${ICON("calendar")} ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>`)}
    <div class="metrics">
      ${metric("Total employees",String(data.employees.length),"Across all departments","people")}
      ${metric("Active employees",String(active),"<strong>Currently on the team</strong>","activity","green")}
      ${metric("Departments",String(data.departments.length),"Organized teams","building","orange")}
      ${metric("Annual payroll",compactMoney(annualPayroll(data.employees)),"Estimated from role salaries","wallet","blue")}
    </div>
    <div class="dashboard-grid">
      <section class="panel"><div class="section-head"><div><h2 class="section-title">Team distribution</h2><p class="section-subtitle">Headcount across departments</p></div><button type="button" class="text-link" data-nav="departments">All departments ${ICON("arrow")}</button></div>${departmentDistribution()}<div class="chart-footer"><span>Based on the current directory</span><strong>${data.employees.length} total people</strong></div></section>
      <section class="panel"><div class="section-head"><div><h2 class="section-title">Workforce status</h2><p class="section-subtitle">Employee availability overview</p></div></div>${healthDonut()}</section>
    </div>
    <section class="panel table-panel"><div class="section-head"><div><h2 class="section-title">Recently joined</h2><p class="section-subtitle">The latest additions to your team</p></div><button type="button" class="text-link" data-nav="employees">View all people ${ICON("arrow")}</button></div>${employeeTable(recent,true)}<div class="table-foot"><span>Showing the 5 most recent start dates</span><span>Sample data</span></div></section>
  </div>`;
}
function filteredEmployees(){
  const query=filters.query.toLowerCase().trim();
  const rows=data.employees.filter(e=>{
    const department=departmentOf(e), role=roleOf(e);
    const text=[nameOf(e),e.email,e.location,department?.name,role?.title].join(" ").toLowerCase();
    return (!query||text.includes(query))&&(filters.department==="all"||String(department?.id)===filters.department)&&(filters.status==="all"||e.status===filters.status);
  });
  rows.sort((a,b)=>filters.sort==="newest"?(b.joined||"").localeCompare(a.joined||""):filters.sort==="salary"?staffSalary(b)-staffSalary(a):nameOf(a).localeCompare(nameOf(b)));
  return rows;
}
function renderDirectory(){
  const rows=filteredEmployees();
  return `<div class="page">${pageHeading("TEAM DIRECTORY","People directory","Find teammates, manage records, and keep your organization in sync.",`<button class="button primary" data-action="add-employee">${ICON("plus")} Add employee</button>`)}
    <section class="panel table-panel"><div class="filters"><div class="filter-search">${ICON("search")}<input id="directory-search" aria-label="Search employees" placeholder="Search names, roles, emails..." value="${html(filters.query)}" autocomplete="off"></div><select class="filter-select" id="department-filter" aria-label="Filter department"><option value="all">All departments</option>${data.departments.map(d=>`<option value="${d.id}" ${filters.department===String(d.id)?"selected":""}>${html(d.name)}</option>`).join("")}</select><select class="filter-select" id="status-filter" aria-label="Filter status">${["all","Active","On leave","Inactive"].map(s=>`<option value="${html(s)}" ${filters.status===s?"selected":""}>${s==="all"?"All statuses":html(s)}</option>`).join("")}</select><select class="filter-select" id="sort-filter" aria-label="Sort employees"><option value="name" ${filters.sort==="name"?"selected":""}>Name A–Z</option><option value="newest" ${filters.sort==="newest"?"selected":""}>Newest first</option><option value="salary" ${filters.sort==="salary"?"selected":""}>Salary high–low</option></select></div><div id="directory-results">${employeeTable(rows)}</div><div class="table-foot"><span id="directory-count">Showing ${rows.length} of ${data.employees.length} employees</span><span>Data saved in your browser</span></div></section></div>`;
}
function renderDepartments(){
  return `<div class="page">${pageHeading("TEAM STRUCTURE","Departments","Stay on top of your teams and their allocated budgets.",`<button class="button primary" data-action="add-department">${ICON("plus")} Add department</button>`)}
    <div class="dept-grid">${data.departments.map(dept=>{
      const staff=staffForDepartment(dept.id), payroll=annualPayroll(staff), used=dept.budget ? payroll/dept.budget*100 : 0,color=colorFor(dept.id);
      return `<section class="dept-card"><div class="dept-card-top"><span class="dept-symbol" style="background:${color}">${html(dept.name.slice(0,2).toUpperCase())}</span><div class="dept-options"><button type="button" data-action="edit-department" data-id="${dept.id}" aria-label="Edit ${html(dept.name)}">${ICON("edit")}</button><button type="button" data-action="delete-department" data-id="${dept.id}" aria-label="Delete ${html(dept.name)}">${ICON("trash")}</button></div></div><div><h3>${html(dept.name)}</h3><p>${data.roles.filter(r=>r.departmentId===dept.id).length} job roles</p></div><div class="dept-stats"><div><strong>${staff.length}</strong><span>Employees</span></div><div class="mini-avatars">${staff.slice(0,3).map(e=>avatar(e)).join("")}</div></div><div><div class="dept-bottom"><span>Annual payroll</span><strong>${compactMoney(payroll)} / ${compactMoney(dept.budget)}</strong></div><div class="dept-progress" style="margin-top:10px"><span style="width:${Math.min(100,used)}%;background:${used>100?"#de6980":color}"></span></div><div class="dept-bottom" style="margin-top:7px"><span>${Math.round(used)}% of budget</span>${used>100?"<strong style='color:#d7546b'>Over budget</strong>":""}</div></div></section>`;
    }).join("")}</div>${!data.departments.length?`<div class="empty-state"><h3>No departments yet</h3><p>Create one to start organizing your team.</p></div>`:""}</div>`;
}
function renderRoles(){
  const salaries=data.roles.map(r=>Number(r.salary));
  const average=salaries.length?salaries.reduce((a,b)=>a+b,0)/salaries.length:0;
  return `<div class="page">${pageHeading("TEAM STRUCTURE","Job roles","Maintain consistent job titles, salary bands, and departments.",`<button class="button primary" data-action="add-role">${ICON("plus")} Add role</button>`)}
    <div class="role-stats"><div class="role-stat"><span>Total job roles</span><strong>${data.roles.length}</strong></div><div class="role-stat"><span>Average role salary</span><strong>${compactMoney(average)}</strong></div><div class="role-stat"><span>Departments represented</span><strong>${new Set(data.roles.map(r=>r.departmentId)).size}</strong></div></div><section class="panel table-panel"><div class="section-head"><div><h2 class="section-title">Role catalog</h2><p class="section-subtitle">Salary estimates are annual USD amounts</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Job title</th><th>Department</th><th>Base salary</th><th>Assigned people</th><th style="text-align:right">Actions</th></tr></thead><tbody>${data.roles.map(role=>`<tr><td><strong style="color:#2e3b55">${html(role.title)}</strong></td><td><span class="department-badge">${html(departmentById(role.departmentId)?.name||"Unassigned")}</span></td><td>${usd(role.salary)}</td><td>${data.employees.filter(e=>e.roleId===role.id).length}</td><td><div class="row-actions"><button class="small-icon-button" data-action="edit-role" data-id="${role.id}" aria-label="Edit ${html(role.title)}">${ICON("edit")}</button><button class="small-icon-button delete" data-action="delete-role" data-id="${role.id}" aria-label="Delete ${html(role.title)}">${ICON("trash")}</button></div></td></tr>`).join("")}</tbody></table></div><div class="table-foot"><span>${data.roles.length} roles · ${data.employees.length} people</span><span>Manage roles before assigning employees</span></div></section></div>`;
}
function renderAnalytics(){
  const payroll=annualPayroll(data.employees);
  const working=data.employees.filter(e=>e.status!=="Inactive").length;
  const rows=data.departments.map(dept=>({dept,staff:staffForDepartment(dept.id),payroll:annualPayroll(staffForDepartment(dept.id))})).sort((a,b)=>b.payroll-a.payroll);
  const max=Math.max(1,...rows.map(r=>r.payroll));
  return `<div class="page">${pageHeading("WORKFORCE INSIGHTS","People analytics","A practical snapshot of compensation, team size, and budget utilization.")}
    <div class="analytics-cards"><div class="analysis-highlight"><div><p>Estimated annual payroll</p><strong>${usd(payroll)}</strong></div>${ICON("wallet")}</div><div class="analysis-highlight soft"><div><p>Average employee salary</p><strong>${usd(working?payroll/working:0)}</strong></div>${ICON("chart")}</div><div class="analysis-highlight soft"><div><p>Employees on payroll</p><strong>${working}</strong></div>${ICON("people")}</div></div>
    <div class="dashboard-grid"><section class="panel"><div class="section-head"><div><h2 class="section-title">Payroll by department</h2><p class="section-subtitle">Annual compensation based on assigned roles</p></div></div><div class="analytics-list">${rows.map(row=>`<div class="analysis-row"><strong>${html(row.dept.name)}</strong><div class="bar-track"><div class="bar-fill" style="width:${row.payroll/max*100}%;background:${colorFor(row.dept.id)}"></div></div><span style="text-align:right">${compactMoney(row.payroll)}</span></div>`).join("")}</div><div class="chart-footer"><span>Excludes employees marked inactive</span><strong>${compactMoney(payroll)} total</strong></div></section><section class="panel"><div class="section-head"><div><h2 class="section-title">Workforce mix</h2><p class="section-subtitle">Status across all employees</p></div></div>${healthDonut()}</section></div>
    <section class="panel"><div class="section-head"><div><h2 class="section-title">Budget utilization</h2><p class="section-subtitle">Estimated payroll compared with team budgets</p></div></div><div class="analytics-list">${rows.map(row=>{const pct=row.dept.budget?row.payroll/row.dept.budget*100:0;return `<div class="analysis-row"><strong>${html(row.dept.name)}</strong><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,pct)}%;background:${pct>100?"#da7382":colorFor(row.dept.id)}"></div></div><span style="text-align:right;color:${pct>100?"#c75163":"#77869c"}">${Math.round(pct)}% used</span></div>`;}).join("")}</div><div class="chart-footer"><span>Budget numbers are illustrative and editable in Departments.</span><strong>${usd(data.departments.reduce((sum,d)=>sum+Number(d.budget),0))} allocated</strong></div></section></div>`;
}
function render(){
  const titles={overview:"Overview",employees:"People directory",departments:"Departments",roles:"Job roles",analytics:"Analytics"};
  $("#breadcrumb-current").textContent=titles[view];
  $("#nav-count").textContent=data.employees.length;
  document.querySelectorAll("[data-nav]").forEach(el=>el.classList.toggle("active",el.dataset.nav===view));
  const content=$("#content");
  content.innerHTML=({overview:renderOverview,employees:renderDirectory,departments:renderDepartments,roles:renderRoles,analytics:renderAnalytics}[view])();
  document.title=titles[view]+" · Northstar People";
}
function navigate(destination){
  if(!ALLOWED_VIEWS.includes(destination))return;
  view=destination;
  if(location.hash!=="#"+destination)location.hash=destination;
  $("#sidebar").classList.remove("open");
  render();
  window.scrollTo({top:0,behavior:"instant"});
}
function optionList(items,current,placeholder){
  return `<option value="">${html(placeholder)}</option>${items.map(item=>`<option value="${item.value}" ${String(current??"")===String(item.value)?"selected":""}>${html(item.name)}</option>`).join("")}`;
}
function field(label,name,value="",type="text",required=true,extra=""){
  return `<div class="form-field ${extra}"><label for="f-${name}">${html(label)}</label><input id="f-${name}" name="${name}" type="${type}" value="${html(value)}" ${required?"required":""} ${type==="number"?'min="0" step="1"':""} maxlength="${name==="email"?"120":"90"}"></div>`;
}
function selectField(label,name,options,current="",required=true,extra=""){
  return `<div class="form-field ${extra}"><label for="f-${name}">${html(label)}</label><select id="f-${name}" name="${name}" ${required?"required":""}>${optionList(options,current,"Select "+label.toLowerCase())}</select></div>`;
}
function dialogMarkup(type,id){
  const item=type==="employee"?personById(id):type==="department"?departmentById(id):type==="role"?roleById(id):null;
  if(type==="employee"){
    return `<form id="editor-form" class="dialog-body" novalidate><div class="form-grid">${field("First name","first_name",item?.first_name||"")}${field("Last name","last_name",item?.last_name||"")}${field("Work email","email",item?.email||"","email",false,"wide")}${selectField("Job role","roleId",data.roles.map(r=>({value:r.id,name:r.title+" · "+(departmentById(r.departmentId)?.name||"Unassigned")})),item?.roleId)}${selectField("Manager","managerId",[{value:"",name:"No manager"},...data.employees.filter(e=>e.id!==id).map(e=>({value:e.id,name:nameOf(e)}))],item?.managerId,false).replace('<option value="">Select manager</option>','')}${selectField("Employment status","status",["Active","On leave","Inactive"].map(s=>({value:s,name:s})),item?.status||"Active")}${field("Start date","joined",item?.joined||today,"date")}${field("Location","location",item?.location||"Remote","text",false,"wide")}</div><div class="form-hint">Department and salary follow the selected job role. This is a browser-local demonstration.</div><p class="form-error" id="form-error" role="alert"></p><div class="form-footer"><button type="button" class="button secondary" data-action="close">Cancel</button><button type="submit" class="button primary">${ICON("check")} ${item?"Save changes":"Add employee"}</button></div></form>`;
  }
  if(type==="department"){
    return `<form id="editor-form" class="dialog-body" novalidate><div class="form-grid">${field("Department name","name",item?.name||"","text",true,"wide")}${field("Annual budget (USD)","budget",item?.budget??500000,"number",true,"wide")}</div><p class="form-error" id="form-error" role="alert"></p><div class="form-footer"><button type="button" class="button secondary" data-action="close">Cancel</button><button type="submit" class="button primary">${ICON("check")} ${item?"Save changes":"Add department"}</button></div></form>`;
  }
  if(type==="role"){
    return `<form id="editor-form" class="dialog-body" novalidate><div class="form-grid">${field("Job title","title",item?.title||"","text",true,"wide")}${selectField("Department","departmentId",data.departments.map(d=>({value:d.id,name:d.name})),item?.departmentId,true,"wide")}${field("Annual salary (USD)","salary",item?.salary??80000,"number",true,"wide")}</div><p class="form-error" id="form-error" role="alert"></p><div class="form-footer"><button type="button" class="button secondary" data-action="close">Cancel</button><button type="submit" class="button primary">${ICON("check")} ${item?"Save changes":"Add role"}</button></div></form>`;
  }
  if(type==="delete"){
    const target=editor.target, targetName=target==="employee"?nameOf(personById(id)):target==="role"?roleById(id)?.title:departmentById(id)?.name;
    return `<form id="editor-form" class="dialog-body"><p class="danger-copy">Are you sure you want to remove <strong>${html(targetName||"this item")}</strong>? This action updates only your browser's sample data.</p><p class="form-error" id="form-error" role="alert"></p><div class="form-footer"><button type="button" class="button secondary" data-action="close">Cancel</button><button type="submit" class="button danger">${ICON("trash")} Remove</button></div></form>`;
  }
  if(type==="reset")return `<form id="editor-form" class="dialog-body"><p class="danger-copy">Restore the original sample workspace? Your browser-local changes will be replaced. This does not affect any external database.</p><div class="form-footer"><button type="button" class="button secondary" data-action="close">Cancel</button><button type="submit" class="button primary">${ICON("refresh")} Restore sample data</button></div></form>`;
  return "";
}
function openDialog(type,id=null,target=null){
  if(["employee","role","department"].includes(type)&&!id){
    if(type==="role"&&!data.departments.length){notify("Create a department first.");return;}
    if(type==="employee"&&!data.roles.length){notify("Create a job role first.");return;}
  }
  editor={type,id:id===null?null:Number(id),target};
  const display=type==="delete"?"Remove "+target:type==="reset"?"Reset sample workspace":(id?"Edit ":"Add ")+type;
  $("#dialog-title").textContent=display;
  $("#dialog-eyebrow").textContent=type==="delete"?"CONFIRM REMOVAL":"MANAGE WORKSPACE";
  $("#dialog-body").innerHTML=dialogMarkup(type,editor.id);
  $("#overlay").hidden=false;
  document.body.style.overflow="hidden";
  const focus=$("#dialog-body input, #dialog-body select, #dialog-body button");
  if(focus)focus.focus();
}
function closeDialog(){
  $("#overlay").hidden=true;
  $("#dialog-body").innerHTML="";
  document.body.style.overflow="";
  editor=null;
}
function formError(message){
  const target=$("#form-error");
  if(target)target.textContent=message;
}
function createCycle(employeeId,managerId){
  let current=Number(managerId);
  const seen=new Set();
  while(current){
    if(current===Number(employeeId)||seen.has(current))return true;
    seen.add(current);
    current=Number(personById(current)?.managerId||0);
  }
  return false;
}
function nextId(collection){return Math.max(0,...collection.map(item=>item.id))+1;}
function submitEditor(event){
  event.preventDefault();
  if(!editor)return;
  if(editor.type==="reset"){data=seedData();filters={query:"",department:"all",status:"all",sort:"name"};closeDialog();persist("Sample workspace restored.");return;}
  if(editor.type==="delete"){
    const {id,target}=editor;
    if(target==="employee"){
      data.employees=data.employees.filter(e=>e.id!==id);
      data.employees.forEach(e=>{if(e.managerId===id)e.managerId=null;});
    }else if(target==="role"){
      if(data.employees.some(e=>e.roleId===id)){formError("Reassign employees before removing this role.");return;}
      data.roles=data.roles.filter(r=>r.id!==id);
    }else if(target==="department"){
      if(data.roles.some(r=>r.departmentId===id)){formError("Move or remove job roles before deleting this department.");return;}
      data.departments=data.departments.filter(d=>d.id!==id);
    }
    closeDialog();persist("Item removed.");return;
  }
  const form=event.target;
  if(!form.reportValidity()){formError("Please complete the required fields correctly.");return;}
  const values=Object.fromEntries(new FormData(form).entries());
  if(editor.type==="employee"){
    const first=String(values.first_name||"").trim(),last=String(values.last_name||"").trim();
    const roleId=Number(values.roleId), managerId=values.managerId?Number(values.managerId):null;
    const email=String(values.email||"").trim(), joined=String(values.joined||"");
    const location=String(values.location||"").trim();
    if(!first||!last||!roleById(roleId)){formError("Enter a first and last name and select a valid role.");return;}
    if(email&&data.employees.some(e=>e.email?.toLowerCase()===email.toLowerCase()&&e.id!==editor.id)){formError("That work email is already in the directory.");return;}
    const id=editor.id||nextId(data.employees);
    if(managerId&&(!personById(managerId)||createCycle(id,managerId))){formError("Select a manager who does not create a reporting cycle.");return;}
    const record={id,first_name:first,last_name:last,email,roleId,managerId,status:values.status,joined,location};
    if(!["Active","On leave","Inactive"].includes(record.status)){formError("Invalid employment status.");return;}
    if(editor.id){const index=data.employees.findIndex(e=>e.id===id);if(index<0)return;data.employees[index]=record;}
    else data.employees.push(record);
  }else if(editor.type==="department"){
    const name=String(values.name||"").trim(),budget=Number(values.budget);
    if(!name||!Number.isFinite(budget)||budget<0){formError("Enter a department name and a valid budget.");return;}
    if(data.departments.some(d=>d.id!==editor.id&&d.name.toLowerCase()===name.toLowerCase())){formError("That department already exists.");return;}
    const record={id:editor.id||nextId(data.departments),name,budget};
    if(editor.id){data.departments[data.departments.findIndex(d=>d.id===editor.id)]=record;}else data.departments.push(record);
  }else if(editor.type==="role"){
    const title=String(values.title||"").trim(),salary=Number(values.salary),departmentId=Number(values.departmentId);
    if(!title||!Number.isFinite(salary)||salary<0||!departmentById(departmentId)){formError("Enter a title, valid salary, and department.");return;}
    if(data.roles.some(r=>r.id!==editor.id&&r.departmentId===departmentId&&r.title.toLowerCase()===title.toLowerCase())){formError("That role already exists in this department.");return;}
    const record={id:editor.id||nextId(data.roles),title,salary,departmentId};
    if(editor.id){data.roles[data.roles.findIndex(r=>r.id===editor.id)]=record;}else data.roles.push(record);
  }
  closeDialog();persist("Changes saved successfully.");
}
function csvValue(value){
  let text=String(value==null?"":value);
  if(/^[=+\-@\t\r]/.test(text))text="'"+text;
  return '"' + text.replace(/"/g,'""') + '"';
}
function exportCsv(){
  const header=["ID","First name","Last name","Email","Job title","Department","Manager","Status","Start date","Location","Annual salary (USD)"];
  const rows=data.employees.map(e=>[e.id,e.first_name,e.last_name,e.email,roleOf(e)?.title,departmentOf(e)?.name,nameOf(personById(e.managerId)),e.status,e.joined,e.location,staffSalary(e)]);
  const csv=[header,...rows].map(row=>row.map(csvValue).join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
  const anchor=document.createElement("a");anchor.href=url;anchor.download="northstar-people-demo.csv";document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);notify("CSV downloaded.");
}
document.addEventListener("click",event=>{
  const nav=event.target.closest("[data-nav]");
  if(nav){event.preventDefault();navigate(nav.dataset.nav);return;}
  const action=event.target.closest("[data-action]");
  if(!action)return;
  const name=action.dataset.action,id=action.dataset.id?Number(action.dataset.id):null;
  if(name==="close"){closeDialog();return;}
  if(name==="clear-filters"){filters={query:"",department:"all",status:"all",sort:"name"};render();return;}
  if(name==="add-employee")openDialog("employee");
  if(name==="edit-employee")openDialog("employee",id);
  if(name==="delete-employee")openDialog("delete",id,"employee");
  if(name==="add-department")openDialog("department");
  if(name==="edit-department")openDialog("department",id);
  if(name==="delete-department")openDialog("delete",id,"department");
  if(name==="add-role")openDialog("role");
  if(name==="edit-role")openDialog("role",id);
  if(name==="delete-role")openDialog("delete",id,"role");
});
document.addEventListener("submit",event=>{if(event.target.id==="editor-form")submitEditor(event);});
document.addEventListener("input",event=>{
  if(event.target.id==="directory-search"){
    filters.query=event.target.value;
    const rows=filteredEmployees();
    $("#directory-results").innerHTML=employeeTable(rows);
    $("#directory-count").textContent="Showing "+rows.length+" of "+data.employees.length+" employees";
  }
});
document.addEventListener("change",event=>{
  if(event.target.id==="department-filter"){filters.department=event.target.value;render();}
  if(event.target.id==="status-filter"){filters.status=event.target.value;render();}
  if(event.target.id==="sort-filter"){filters.sort=event.target.value;render();}
});
$("#close-dialog").addEventListener("click",closeDialog);
$("#overlay").addEventListener("click",event=>{if(event.target.id==="overlay")closeDialog();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!$("#overlay").hidden)closeDialog();});
$("#mobile-menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#reset-demo").addEventListener("click",()=>openDialog("reset"));
$("#export-csv").addEventListener("click",exportCsv);
$("#year").textContent=new Date().getFullYear();
window.addEventListener("hashchange",()=>{const dest=location.hash.slice(1);if(ALLOWED_VIEWS.includes(dest)&&dest!==view){view=dest;render();}});
window.addEventListener("storage",event=>{if(event.key===STORAGE_KEY){data=loadData();render();notify("Workspace refreshed from another tab.");}});
render();