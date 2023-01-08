const department = require('./department');
const employee = require('./employee');
const role = require('./role');

function action(data) {
    if (`${data}` === 'View All Employees' || `${data}` === 'Add Employee' || `${data}` === 'Update Employee Role') {
        console.log(`TEST1`);
    } else if (`${data}` === 'View All Roles' ||`${data}` ===  'Add Role') {
        console.log(`TEST2`);
    } else if (`${data}` === 'View All Departments' || `${data}` === 'Add Department') {
        console.log(`TEST3`);
    }
}

module.exports = action;