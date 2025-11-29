// routes/orders.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch(e) { return res.status(401).json({ error: 'Invalid token' }); }
}

// place order
router.post('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { items, total } = req.body;
  if (!items || !total) return res.status(400).json({ error: 'Items and total required' });

  db.run('INSERT INTO orders (user_id, items, total) VALUES (?,?,?)', [userId, JSON.stringify(items), total], function(err){
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ id: this.lastID });
  });
});

// get orders for current user
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    // parse items
    const out = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    res.json(out);
  });
});

module.exports = router;

