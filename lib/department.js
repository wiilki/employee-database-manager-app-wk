const inquirer = require('inquirer');
const consoleTable = require('console.table');
const db = require('./db')

function department(actions) {
    // View all departments
    if (`${actions}` === 'View All Departments') {
        db.query('SELECT * FROM department;', function (err, results) {
            console.table(results);
        });
        // New department prompt
    } else if (`${actions}` === 'Add Department') {
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'department',
                    message: 'What is the name of the department?',
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
}

module.exports = department;