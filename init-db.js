// init-db.js
const db = require('./db');
const bcrypt = require('bcrypt');

async function run() {
  db.serialize(async () => {
    // users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      is_admin INTEGER DEFAULT 0
    )`);

    // products
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      price INTEGER,
      category TEXT,
      image TEXT
    )`);

    // orders
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      items TEXT,
      total INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // seed admin and products if not exists
    const adminEmail = 'admin@flipkart.local';
    const adminPass = 'admin123';

    db.get("SELECT id FROM users WHERE email = ?", [adminEmail], async (err, row) => {
      if (err) return console.error(err);
      if (!row) {
        const hashed = await bcrypt.hash(adminPass, 10);
        db.run("INSERT INTO users (name,email,password,is_admin) VALUES (?,?,?,1)",
          ['Admin','admin@flipkart.local', hashed], function(err){
            if (err) console.error(err);
            else console.log('Seeded admin user ->', adminEmail, 'password:', adminPass);
          });
      } else {
        console.log('Admin user already exists:', adminEmail);
      }
    });

    db.get("SELECT COUNT(*) as cnt FROM products", (err, row) => {
      if (err) return console.error(err);
      if (row.cnt === 0) {
        const sample = [
          ['Red T-Shirt','Comfortable cotton t-shirt', 499, 'Clothing','https://via.placeholder.com/300x200?text=Red+T-Shirt'],
          ['Blue Jeans','Denim jeans', 1299, 'Clothing','https://via.placeholder.com/300x200?text=Blue+Jeans'],
          ['Running Shoes','Lightweight running shoes', 2499, 'Footwear','https://via.placeholder.com/300x200?text=Shoes'],
          ['Smart Watch','Fitness smart watch', 3999, 'Electronics','https://via.placeholder.com/300x200?text=Smart+Watch'],
          ['Wireless Earbuds','Bluetooth earbuds', 1999, 'Electronics','https://via.placeholder.com/300x200?text=Earbuds']
        ];
        const stmt = db.prepare("INSERT INTO products (title,description,price,category,image) VALUES (?,?,?,?,?)");
        sample.forEach(p => stmt.run(p, (err)=> err && console.error(err)));
        stmt.finalize(() => console.log('Seeded products.'));
      } else {
        console.log('Products already seeded.');
      }
    });
  });
}

run();

