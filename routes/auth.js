const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Simple register route: email + password
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
    res.json({ id: result.insertId, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  try {
    const [rows] = await pool.query('SELECT id, email, password FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
