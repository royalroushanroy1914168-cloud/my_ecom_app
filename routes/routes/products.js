// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// list products with optional search & category
router.get('/', (req, res) => {
  const q = req.query.q || '';
  const category = req.query.category || '';
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (q) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push('%' + q + '%', '%'+ q + '%');
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// product by id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

module.exports = router;

