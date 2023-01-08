function department(actions) { 
    if (`${actions}` === 'View All Departments') {
        console.log('VIEW DEPARTMENT');
    } else if (`${actions}` === 'Add Department') {
        console.log('ADD DEPARTMENT');
    }
}

module.exports = department;