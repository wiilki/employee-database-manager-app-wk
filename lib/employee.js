const consoleTable = require('console.table');
const db = require('./db')

function employee(actions) { 
    if (`${actions}` === 'View All Employees') {
        db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager FROM employee INNER JOIN role ON employee.id = role.id INNER JOIN department ON role.department_id = department.id;', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Employee') {
        console.log('ADD EMPLOYEE');
    } else if (`${actions}` === 'Update Employee Role') {
        console.log('UPDATE EMPLOYEE ROLE');
    }
}

module.exports = employee;