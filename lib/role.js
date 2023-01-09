const consoleTable = require('console.table');
const db = require('./db')

function role(actions) {
    if (`${actions}` === 'View All Roles') {
        db.query('SELECT r.id, r.title, d.name AS department, r.salary FROM role r JOIN department d ON r.department_id = d.id;', function (err, results) {
            console.table(results);
        });
    } else if (`${actions}` === 'Add Role') {
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'What is the name of the role?',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary of the role?',
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'What department does the role belong to?',
                    choices: []
                }
            ])
            .then((response) => {
                db.query(`INSERT INTO department (id, name) VALUES (0, '${response.department}');`, function (err, results) {
                });
                db.query('SELECT * FROM department;', function (err, results) {
                    console.table(results);
                });
            });
    };
};

module.exports = role;