const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

const mainMenu = [
    {
        type: 'list',
        name: 'actions',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department']
    }
];

function init() {
    return userResponses = inquirer.prompt(mainMenu);
}

init()