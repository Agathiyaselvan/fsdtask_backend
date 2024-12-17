const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());

// mysql
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',  
  database: process.env.DB_DATABASE || 'employee',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});


//adding emplyoee details 
app.post('/register', (req, res) => {
  const { name, employee_id, email, phone, department, date_of_joining, role } = req.body;

  if (!name || !employee_id || !email || !phone || !department || !date_of_joining || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkEmployeeQuery = 'SELECT * FROM employeesdetails WHERE employee_id = ? OR email = ?'; // Changed table name
  db.query(checkEmployeeQuery, [employee_id, email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error checking existing records' });
    }

    if (result.length > 0) {
      if (result.some(record => record.employee_id === employee_id)) {
        return res.status(409).json({ message: 'Employee ID already exists' });
      }
      if (result.some(record => record.email === email)) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    const query = `INSERT INTO employeesdetails (name, employee_id, email, phone, department, date_of_joining, role)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [name, employee_id, email, phone, department, date_of_joining, role], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error registering employee' });
      }
      res.status(201).json({ message: 'Employee registered successfully', employeeId: result.insertId });
    });
  });
});


app.get('/employees', (req, res) => {
  const query = 'SELECT * FROM employeesdetails'; 
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error retrieving employees' });
    }
    res.status(200).json(result);
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
