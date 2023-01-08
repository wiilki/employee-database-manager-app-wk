const department = require('./department');
const employee = require('./employee');
const role = require('./role');

function action(data) {
    if (data === 'View All Employees' || 'Add Employee' || 'Update Employee Role') {
        console.log(data);
    } else if (data === 'View All Roles' || 'Add Role') {
        console.log(data);
    } else if (data === 'View All Departments' || 'Add Department') {
        console.log(data);
    }
}

module.exports = action;