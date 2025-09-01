const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../config/db');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const db = getDb();
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)', [name, email.toLowerCase(), hash], function(err) {
    if (err) {
      db.close();
      return res.status(400).json({ message: 'User exists or DB error', error: err.message });
    }
    const user = { id: this.lastID, name, email: email.toLowerCase() };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    db.close();
    res.status(201).json({ user, token });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
  const db = getDb();
  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], (err, row) => {
    if (err || !row) {
      db.close();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = bcrypt.compareSync(password, row.password_hash);
    if (!valid) {
      db.close();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = { id: row.id, name: row.name, email: row.email };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [row.id]);
    db.close();
    res.json({ user, token });
  });
});

module.exports = router;
