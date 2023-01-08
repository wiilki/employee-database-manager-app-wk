const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '5758',
        database: 'staff_db'
    },
    console.log(`Connected to the staff_db database.`)
);

module.exports = db;