const consoleTable = require('console.table');
const db = require('./db')

function employee(actions) { 
    if (`${actions}` === 'View All Employees') {
        db.query('SELECT * FROM employee;', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Employee') {
        console.log('ADD EMPLOYEE');
    } else if (`${actions}` === 'Update Employee Role') {
        console.log('UPDATE EMPLOYEE ROLE');
    }
}

module.exports = employee;