const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Employees Table
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phoneNumber TEXT,
        altPhone TEXT,
        age INTEGER,
        dob TEXT,
        password TEXT,
        department TEXT,
        workMode TEXT,
        mailApproved INTEGER DEFAULT 0,
        salary REAL,
        designation TEXT,
        joiningDate TEXT,
        workLocation TEXT,
        maritalStatus TEXT,
        bloodGroup TEXT,
        address TEXT,
        nomineeName TEXT,
        nomineePhone TEXT,
        bankName TEXT,
        branchName TEXT,
        accountNumber TEXT,
        ifscCode TEXT,
        upiId TEXT,
        employeeType TEXT,
        branchCode TEXT
    )`);

    // Attendance Table
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeId TEXT,
        employeeName TEXT,
        type TEXT,
        timestamp TEXT,
        displayTime TEXT,
        image TEXT,
        date TEXT,
        FOREIGN KEY(employeeId) REFERENCES employees(id)
    )`);


    console.log('Database initialized.');

    // Migration for existing tables
    const columns = [
        ['phoneNumber', 'TEXT'],
        ['altPhone', 'TEXT'],
        ['age', 'INTEGER'],
        ['dob', 'TEXT'],
        ['upiId', 'TEXT'],
        ['employeeType', 'TEXT'],
        ['branchCode', 'TEXT']
    ];

    columns.forEach(([col, type]) => {
        db.run(`ALTER TABLE employees ADD COLUMN ${col} ${type}`, (err) => {
            // Error is expected if column already exists
            if (err && !err.message.includes('duplicate column name')) {
                console.error(`Error adding column ${col}:`, err.message);
            }
        });
    });
});

module.exports = db;
