const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// --- API Endpoints ---

// Register Employee
app.post('/api/register', (req, res) => {
    const data = req.body;
    const query = `INSERT INTO employees (
        id, name, email, phoneNumber, altPhone, age, password, department, workMode, 
        salary, designation, joiningDate, workLocation, maritalStatus, bloodGroup, 
        address, nomineeName, nomineePhone, bankName, branchName, accountNumber, 
        ifscCode, upiId, employeeType, branchCode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const empId = data.id || `MEV/${Math.floor(Math.random() * 899) + 100}/${new Date().getFullYear()}`;

    const params = [
        empId, data.employeeName, data.employeeEmail, data.phoneNumber, data.alternativePhone,
        data.age, '2026', data.department || 'IT', data.workMode || 'Work From Office',
        data.salary, data.designation, data.joiningDate, data.workLocation,
        data.maritalStatus, data.bloodGroup, data.address, data.nomineeName,
        data.nomineePhone, data.bankName, data.branchName, data.accountNumber,
        data.ifscCode, data.upiId, data.employeeType, data.branchCode
    ];

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Employee registered successfully', id: empId });
    });
});

// Get All Employees
app.get('/api/employees', (req, res) => {
    db.all("SELECT * FROM employees", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Update Employee (e.g., Work Mode)
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { workMode, mailApproved, email } = req.body;

    let query = "UPDATE employees SET ";
    let params = [];

    if (workMode !== undefined) {
        query += "workMode = ?, ";
        params.push(workMode);
    }
    if (mailApproved !== undefined) {
        query += "mailApproved = ?, ";
        params.push(mailApproved ? 1 : 0);
    }
    if (email !== undefined) {
        query += "email = ?, ";
        params.push(email);
    }

    query = query.slice(0, -2); // Remove trailing comma
    query += " WHERE id = ?";
    params.push(id);

    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Employee updated successfully' });
    });
});

// Delete Employee
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM employees WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Employee deleted successfully' });
    });
});

// Attendance Endpoints
app.post('/api/attendance', (req, res) => {
    const { employeeId, employeeName, type, timestamp, displayTime, image, date } = req.body;
    const query = `INSERT INTO attendance (employeeId, employeeName, type, timestamp, displayTime, image, date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [employeeId, employeeName, type, timestamp, displayTime, image, date], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Attendance recorded', id: this.lastID });
    });
});

app.get('/api/attendance', (req, res) => {
    db.all("SELECT * FROM attendance ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT || PORT}`);
});
