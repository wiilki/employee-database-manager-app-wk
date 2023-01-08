const inquirer = require('inquirer');
const action = require('./lib/action');

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
    .then(userInput  => {
      return action(userInput.actions); 
    })
    .catch(err => {
        console.log(err);
    })