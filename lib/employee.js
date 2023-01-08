const consoleTable = require('console.table');
const db = require('./db')

function employee(userInput) { 
    if (`${userInput}` === 'View All Employees') {
        db.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id;", function (err, results) {
            console.table(results);
        });
    } else if (`${userInput}` === 'Add Employee') {
        console.log('ADD EMPLOYEE');
    } else if (`${userInput}` === 'Update Employee Role') {
        console.log('UPDATE EMPLOYEE ROLE');
    }
}

module.exports = employee;