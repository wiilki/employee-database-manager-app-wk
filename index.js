const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');
const banner = require('simple-banner').set("Employee Database Manager App");

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

// View employee's by managers
function viewByManager() {
    connection.query("SELECT CONCAT(m.first_name, ' ', m.last_name) AS manager, e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id WHERE e.manager_id IS NOT NULL ORDER BY e.manager_id;", function (err, results) {
        console.table(results);
        updateEmployee();
    });
};

// View employee's by departments
function viewByDepartment() {
    connection.query("SELECT d.name AS department, e.id, e.first_name, e.last_name, r.title, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id;", function (err, results) {
        console.log
        console.table(results);
        updateEmployee();
    });
};

// View utilized budget of departments
function viewBudget() {
    connection.query('SELECT d.name AS department, SUM(r.salary) AS budget FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id GROUP BY d.name;', function (err, results) {
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

// New role prompt
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
            const employees = results.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

            // Adds "None" to top of manager selection
            employees.unshift('None');

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
                    choices: employees
                }
            ])
                .then((response) => {
                    switch (response.manager) {
                        case 'None':
                            connection.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (0, '${response.first_name}', '${response.last_name}', '${response.role}', null);`, function (err, results) { });
                            break;
                        default:
                            connection.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (0, '${response.first_name}', '${response.last_name}', '${response.role}', '${response.manager}');`, function (err, results) { });
                            break;
                    }
                    start();
                });
        });
    });
};

// Update employee role prompt
function updateRole() {

    connection.query('SELECT * FROM employee', function (err, results) {
        // Returns all employees to an array
        const employees = results.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

        connection.query('SELECT * FROM role', function (err, results) {
            // Returns all roles to an array
            const roles = results.map(role => ({ name: role.title, value: role.id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's role do you want to update?",
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "Which role do you want to assign the selected employee?",
                    choices: roles
                }
            ])
                .then((response) => {
                    connection.query(`UPDATE employee SET role_id = '${response.role}' WHERE id = ${response.employee};`, function (err, results) { });
                    updateEmployee()
                });
        });
    })
};

// Update employee manager prompt
function updateManager() {

    connection.query('SELECT * FROM employee', function (err, results) {
        // Returns all employees to an array
        const employees = results.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

        // Adds "None" to top of manager selection
        const managers = results.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));
        managers.unshift('None');

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee's role do you want to update?",
                // Return id and name values from employee table
                choices: employees
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager",
                // Return id and name values from employee table
                choices: managers
            }
        ])
            .then((response) => {
                switch (response.employee) {
                    case 'None':
                        break;
                };
                switch (response.manager) {
                    case 'None':
                        connection.query(`UPDATE employee SET manager_id = null WHERE id = ${response.employee};`, function (err, results) { });
                        break;
                    default:
                        connection.query(`UPDATE employee SET manager_id = '${response.manager}' WHERE id = ${response.employee};`, function (err, results) { });
                }
                updateEmployee()
            });
    });
};

// Delete department prompt
function deleteDepartment() {

    connection.query('SELECT * FROM department', function (err, results) {
        // Returns all departments to an array
        const departments = results.map(department => ({ name: department.name, value: department.id }));

        // Adds "Cancel" option to department selection
        results.push('Cancel');

        inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: "Which department do you want to delete?",
                // Returns all values from department table
                choices: departments
            }
        ])
            .then((response) => {
                switch (response.department) {
                    case 'Cancel':
                        break;
                    default:
                        connection.query(`DELETE FROM department WHERE id = ${response.department};`, function (err, results) { });
                }
                start();
            });
    });
};

// Delete role prompt
function deleteRole() {

    connection.query('SELECT * FROM role', function (err, results) {
        // Returns all departments to an array
        const roles = results.map(role => ({ name: role.title, value: role.id }));

        // Adds "Cancel" option to role selection
        results.push('Cancel');

        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: "Which role do you want to delete?",
                // Returns all values from department table
                choices: roles
            }
        ])
            .then((response) => {
                switch (response.role) {
                    case 'Cancel':
                        break;
                    default:
                        connection.query(`DELETE FROM role WHERE id = ${response.role};`, function (err, results) { });
                }
                start();
            });
    });
};

// Delete employee prompt
function deleteEmployee() {

    connection.query('SELECT * FROM employee', function (err, results) {
        // Returns all employees to an array
        const employees = results.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }));

        // Adds "Cancel" option to employee selection
        employees.push('Cancel');

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee do you want to delete?",
                // Return id and name values from employee table
                choices: employees
            }
        ])
            .then((response) => {
                switch (response.employee) {
                    case 'Cancel':
                        break;
                    default:
                        connection.query(`DELETE FROM employee WHERE id = ${response.employee};`, function (err, results) { });
                }
                updateEmployee();
            });
    });
};


// Update employee promopt
function updateEmployee() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'actions',
            message: 'What would you like to do?',
            choices: ['Update Employee Role', 'Update Employee Manager', 'Delete Employee', 'View Employee By Manager', 'View Employee By Department', 'Go Back']
        }
    ]).then(response => {
        switch (response.actions) {
            case 'Update Employee Role':
                return updateRole(response);
                break;
            case 'Update Employee Manager':
                return updateManager(response);
                break;
            case 'Delete Employee':
                return deleteEmployee(response);
                break;
            case 'View Employee By Manager':
                return viewByManager(response);
                break;

            case 'View Employee By Department':
                return viewByDepartment(response);
                break;
            case 'Go Back':
                return start();
        };
    })
        .catch(err => {
            console.log(err);
        });
};

function start() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'actions',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee', 'View All Roles', 'Add Role', 'Delete Role', 'View All Departments', 'View Department Utilized Budget', 'Add Department', 'Delete Department', 'Quit']
        }
    ])
        .then(response => {
            switch (response.actions) {
                case 'View All Employees':
                    return viewEmployees(response);
                    break;
                case 'Add Employee':
                    return addEmployee(response);
                    break;
                case 'Update Employee':
                    return updateEmployee(response);
                    break;
                case 'View All Roles':
                    return viewRoles(response);
                    break;
                case 'Add Role':
                    return addRole(response);
                    break;
                case 'Delete Role':
                    return deleteRole(response);
                    break;
                case 'View All Departments':
                    return viewDepartments(response);
                    break;
                case 'View Department Utilized Budget':
                    return viewBudget(response);
                    break;
                case 'Add Department':
                    return addDepartment(response);
                    break;
                case 'Delete Department':
                    return deleteDepartment(response);
                    break;
                case 'None':
                    process.exit();
            }
        })
        .catch(err => {
            console.log(err);
        });
};

start();