const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('data.db'); // SQLite file


app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create tables if they don't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    address TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    email TEXT
  )
`).run();

// POST - Register a company
app.post('/api/companies', (req, res) => {
  const { name, email, address } = req.body;
  if (!name || !email || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const stmt = db.prepare('INSERT INTO companies (name, email, address) VALUES (?, ?, ?)');
    stmt.run(name, email, address);
    res.status(201).json({ message: 'Company registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET - List all companies
app.get('/api/companies', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM companies').all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving companies' });
  }
});

// POST - Onboard an employee
app.post('/api/employees', (req, res) => {
  const { name, role, email } = req.body;
  if (!name || !role || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const stmt = db.prepare('INSERT INTO employees (name, role, email) VALUES (?, ?, ?)');
    stmt.run(name, role, email);
    res.status(201).json({ message: 'Employee onboarded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// ✅ FIXED: GET - List all employees
app.get('/api/employees', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM employees').all(); // ← fixed table name
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving employees' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
