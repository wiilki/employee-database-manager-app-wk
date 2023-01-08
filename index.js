const inquirer = require('inquirer');
const department = require('./lib/department');
const employee = require('./lib/employee');
const role = require('./lib/role');

const mainMenu = [
    {
        type: 'list',
        name: 'actions',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department']
    }
];

function start() {
    return userResponses = inquirer.prompt(mainMenu);
}

start()
    .then(mainMenu => {
        if (mainMenu.actions === 'View All Employees' || mainMenu.actions === 'Add Employee' || mainMenu.actions === 'Update Employee Role') {
            return employee(mainMenu.actions);
        } else if (mainMenu.actions === 'View All Roles' || mainMenu.actions === 'Add Role') {
            return role(mainMenu.actions);
        } else if (mainMenu.actions === 'View All Departments' || mainMenu.actions === 'Add Department') {
            return department(mainMenu.actions);
        };
    })
    .catch(err => {
        console.log(err);
    })