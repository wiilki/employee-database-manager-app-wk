const consoleTable = require('console.table');
const db = require('./db')

function department(actions) {
    if (`${actions}` === 'View All Departments') {
        db.query('SELECT * FROM department', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Department') {
        console.log('ADD DEPARTMENT');
    }
}

module.exports = department;