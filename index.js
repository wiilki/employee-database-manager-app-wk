const inquirer = require('inquirer');
const mysql = require('mysql2');
const promise = require('mysql2/promise');
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

function start() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'actions',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department']
            }
        ])
        .then(response => {
            if (response.actions === 'View All Employees') {
                return viewEmployees(response);
            } else if (response.actions === 'Add Employee') {
                return addEmployee(response);
            } else if (response.actions === 'Update Employee Role') {
                return updateRole(response);
            } else if (response.actions === 'View All Roles') {
                return viewRoles(response);
            } else if (response.actions === 'Add Role') {
                return addRole(response);
            } else if (response.actions === 'View All Departments') {
                return viewDepartments(response);
            } else if (response.actions === 'Add Department') {
                return addDepartment(response);
            };
        })
        .catch(err => {
            console.log(err);
        })
}

// View all departments
function viewDepartments(actions) {
    connection.query('SELECT * FROM department;', function (err, results) {
        console.table(results);
        start();
    });

}

// View all roles
function viewRoles(actions) {
    connection.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function (err, results) {
        console.table(results);
        start();
    })
};

// View all employees
function viewEmployees(userInput) {
    connection.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id;", function (err, results) {
        console.table(results);
        start();
    })
};

// New department prompt
function addDepartment(actions) {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the department?',
            }
        ])
        .then((response) => {
            connection.query(`INSERT INTO department (id, name) VALUES (0, '${response.name}');`, function (err, results) { });
            connection.query('SELECT * FROM department;', function (err, results) { });
            start();
        });

};

// Add role prompt
function addRole(actions) {
    connection.query('SELECT * FROM department', function (err, results) {
        let array = results;

        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
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
                    choices: array.map((department) => {
                        return {
                            name: department.name,
                            value: department.id
                        }
                    }),
                }
            ])
            .then((response) => {
                connection.query(`INSERT INTO role (id, title, salary, department_id) VALUES (0, '${response.title}', '${response.salary}', '${response.department}');`, function (err, results) { });
                connection.query('SELECT * FROM department;', function (err, results) { });
                start();
            });
    })

};

// Add employee prompt
function addEmployee(userInput) {
    console.log('ADD EMPLOYEE');
    start();
};

// Add employee role prompt
function updateRole(userInput) {
    console.log('UPDATE EMPLOYEE ROLE');
    start();
};

start()