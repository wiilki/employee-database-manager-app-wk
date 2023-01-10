const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '5758',
        database: 'staff_db'
    }
);

// View all departments
function viewDepartments() {
    connection.query('SELECT * FROM department;', function (err, results) {
        console.table(results);
        start();
    });
};

// View all roles
function viewRoles() {
    connection.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function (err, results) {
        console.table(results);
        start();
    });
};

// View all employees
function viewEmployees() {
    connection.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id;", function (err, results) {
        console.table(results);
        start();
    });
};

// New department prompt
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?',
        }
    ])
        .then((response) => {
            connection.query(`INSERT INTO department (id, name) VALUES (0, '${response.name}');`, function (err, results) { });
            start();
        });
};

// Add role prompt
function addRole() {
    connection.query('SELECT * FROM department', function (err, results) {

        // Returns all departments to an array
        const departments = results.map(department => ({ name: department.name, value: department.id }));

        inquirer.prompt([
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
                choices: departments
            }
        ])
            .then((response) => {
                connection.query(`INSERT INTO role (id, title, salary, department_id) VALUES (0, '${response.title}', '${response.salary}', '${response.department}');`, function (err, results) { });
                start();
            });
    });
};

// Add employee prompt
function addEmployee() {
    connection.query('SELECT * FROM role', function (err, results) {

        // Returns all roles to an array
        const roles = results.map(role => ({ name: role.title, value: role.id }));
        connection.query(`SELECT * FROM employee;`, function (err, results) {

            // Returns all employees to an array
            const employee = results.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

            // Adds "None" to top of manager selection
            employee.unshift('None');

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: "What is the employee's first name?",
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "What is the employee's last name?",
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    // Return id and name values from role table
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager",
                    // Return id and name values from employee table
                    choices: employee
                }
            ])
                .then((response) => {
                    if (`${response.manager}` === "None") {
                        connection.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (0, '${response.first_name}', '${response.last_name}', '${response.role}', null);`, function (err, results) { });
                    } else {
                        connection.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (0, '${response.first_name}', '${response.last_name}', '${response.role}', '${response.manager}');`, function (err, results) { });
                    };
                    start();
                });
        });
    });
};

// Add employee role prompt
function updateRole() {
    console.log('UPDATE EMPLOYEE ROLE');
    start();
};

function start() {
    inquirer.prompt([
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

start();