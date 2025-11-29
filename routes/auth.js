// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (row) return res.status(400).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hash], function(err){
      if (err) return res.status(500).json({ error: 'Could not create user' });
      const user = { id: this.lastID, name, email, is_admin: 0 };
      const token = jwt.sign(user, JWT_SECRET);
      res.json({ token, user });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id,name,email,password,is_admin FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const user = { id: row.id, name: row.name, email: row.email, is_admin: row.is_admin };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ token, user });
  });
});

module.exports = router;

