const consoleTable = require('console.table');
const db = require('./db')

function role(actions) {
    if (`${actions}` === 'View All Roles') {
        db.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id;', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Role') {
        console.log('ADD ROLE');
    }
}

module.exports = role;