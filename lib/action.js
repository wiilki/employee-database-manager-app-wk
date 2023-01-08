const department = require('./department');
const employee = require('./employee');
const role = require('./role');

function action(actions) {
    if (actions === 'View All Employees' || 'Add Employee' || 'Update Employee Role') {
       console.log('TEST1');
    } else if (actions === 'View All Roles' || 'Add Role') {
        role();
    } else if (actions === 'View All Departments' || 'Add Department') {
        department();
    }
}

module.exports = action;