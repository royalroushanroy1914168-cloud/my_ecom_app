// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function authAdmin(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (!user.is_admin) return res.status(403).json({ error: 'Admin only' });
    req.user = user;
    next();
  } catch(e) { return res.status(401).json({ error: 'Invalid token' }); }
}

// create product
router.post('/products', authAdmin, (req, res) => {
  const { title, description, price, category, image } = req.body;
  db.run('INSERT INTO products (title,description,price,category,image) VALUES (?,?,?,?,?)',
    [title, description, price, category, image], function(err){
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID });
    });
});

// update product
router.put('/products/:id', authAdmin, (req, res) => {
  const { title, description, price, category, image } = req.body;
  db.run('UPDATE products SET title=?,description=?,price=?,category=?,image=? WHERE id=?',
    [title, description, price, category, image, req.params.id], function(err){
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ changed: this.changes });
    });
});

// delete product
router.delete('/products/:id', authAdmin, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err){
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;

