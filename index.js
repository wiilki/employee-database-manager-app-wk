const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '5758',
        database: 'staff_db'
    },
    console.log(`Connected to the staff_db database.`)
);

// Main menu prompt
const mainMenu = [
    {
        type: 'list',
        name: 'actions',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department']
    }
];

// Call prompt
function start() {
    return userResponses = inquirer.prompt(mainMenu);
}

function department(actions) {
    connection.query('SELECT * FROM department;', function (err, results) {
        // View all departments
        if (`${actions}` === 'View All Departments') {
            console.table(results);
            // New department prompt
        } else if (`${actions}` === 'Add Department') {
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'What is the name of the department?',
                    }
                ])
                .then((response) => {
                    connection.query(`INSERT INTO department (id, name) VALUES (0, '${response.name}');`, function (err, results) {
                    });
                    connection.query('SELECT * FROM department;', function (err, results) {
                        console.table(results);
                    });
                });
        };
    });
}

function role(actions) {
    connection.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function (err, results) {
        if (`${actions}` === 'View All Roles') {
            console.table(results);
        } else if (`${actions}` === 'Add Role') {
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'What is the name of the role?',
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary of the role?',
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'What department does the role belong to?',
                        choices: []
                    }
                ])
                .then((response) => {
                    connection.query(`INSERT INTO department (id, name) VALUES (0, '${response.department}');`, function (err, results) {
                    });
                    connection.query('SELECT * FROM department;', function (err, results) {
                        console.table(results);
                    });
                });
        };
    });
};

function employee(userInput) {
    connection.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id;", function (err, results) {
        if (`${userInput}` === 'View All Employees') {
            console.table(results);
        } else if (`${userInput}` === 'Add Employee') {
            console.log('ADD EMPLOYEE');
        } else if (`${userInput}` === 'Update Employee Role') {
            console.log('UPDATE EMPLOYEE ROLE');
        }
    });
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