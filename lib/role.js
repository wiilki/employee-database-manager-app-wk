const consoleTable = require('console.table');
const db = require('./db')

function role(actions) {
    if (`${actions}` === 'View All Roles') {
        db.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Role') {
        console.log('ADD ROLE');
    }
}

module.exports = role;