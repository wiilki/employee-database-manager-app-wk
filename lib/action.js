const department = require('./department');
const employee = require('./employee');
const role = require('./role');

function action(data) {
    if (`${data}` === 'View All Employees' || `${data}` === 'Add Employee' || `${data}` === 'Update Employee Role') {
        return employee(data);
    } else if (`${data}` === 'View All Roles' ||`${data}` ===  'Add Role') {
        return role(data);
    } else if (`${data}` === 'View All Departments' || `${data}` === 'Add Department') {
        return department(data);
    }
}

module.exports = action;