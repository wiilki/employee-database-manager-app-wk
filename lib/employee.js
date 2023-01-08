function employee(actions) { 
    if (`${actions}` === 'View All Employees') {
        console.log('VIEW EMPLOYEES');
    } else if (`${actions}` === 'Add Employee') {
        console.log('ADD EMPLOYEE');
    } else if (`${actions}` === 'Update Employee Role') {
        console.log('UPDATE EMPLOYEE ROLE');
    }
}

module.exports = employee;