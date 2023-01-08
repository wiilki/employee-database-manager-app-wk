const consoleTable = require('console.table');
const db = require('./db')

function role(actions) {
    if (`${actions}` === 'View All Roles') {
        db.query('SELECT * FROM role', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Role') {
        console.log('ADD ROLE');
    }
}

module.exports = role;