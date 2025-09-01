const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../../config/db');
const { encrypt, decrypt } = require('../../utils/crypto');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Public shared password retrieval BEFORE auth middleware
router.get('/shared/:token', (req, res) => {
  const db = getDb();
  db.get('SELECT password_encrypted, expires_at FROM share_tokens WHERE token = ?', [req.params.token], (err, row) => {
    if (err || !row) { db.close(); return res.status(404).json({ message: 'Invalid token' }); }
    if (Date.now() > row.expires_at) { db.close(); return res.status(410).json({ message: 'Expired' }); }
    const pw = decrypt(row.password_encrypted);
    db.close();
    res.json({ password: pw });
  });
});

router.use(authMiddleware);

function calcStrength(pw) {
  let score = 0;
  if (!pw) return 0;
  score += Math.min(25, pw.length * 2);
  if (/[a-z]/.test(pw)) score += 15;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  if (pw.length >= 12) score += 10;
  if (pw.length < 8) score -= 20;
  return Math.min(100, Math.max(0, score));
}

router.post('/', (req, res) => {
  const { password, title = 'Generated Password', website = '', username = '', notes = '', category = 'generated' } = req.body || {};
  if (!password) return res.status(400).json({ message: 'Password required' });
  const enc = encrypt(password);
  const db = getDb();
  db.run(`INSERT INTO saved_passwords (user_id, title, website, username, password_encrypted, notes, category) VALUES (?,?,?,?,?,?,?)`,
    [req.user.id, title, website, username, enc, notes, category], function(err) {
      if (err) { db.close(); return res.status(500).json({ message: 'DB error', error: err.message }); }
      const id = this.lastID;
      db.get('SELECT created_at FROM saved_passwords WHERE id = ?', [id], (e, row) => {
        db.close();
        if (e) return res.status(500).json({ message: 'Fetch error' });
        res.status(201).json({ id, title, website, username, category, created_at: row.created_at, strength_score: calcStrength(password) });
      });
    });
});

router.get('/', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM saved_passwords WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ message: 'DB error' });
    const now = Date.now();
    const ROTATE_TARGET_DAYS = 90; // threshold for recommendation
    const data = rows.map(r => {
      const pw = decrypt(r.password_encrypted);
      const createdTs = Date.parse(r.created_at + 'Z') || Date.parse(r.created_at) || now;
      let ageDays = Math.floor((now - createdTs) / (1000 * 60 * 60 * 24));
      if (ageDays < 0 || Number.isNaN(ageDays)) ageDays = 0;
      const pct = Math.min(ageDays / ROTATE_TARGET_DAYS, 1);
      let age_stage = 'fresh';
      if (ageDays >= 90) age_stage = 'stale'; else if (ageDays >= 30) age_stage = 'aging';
      return {
        id: r.id,
        title: r.title,
        website: r.website,
        username: r.username,
        category: r.category,
        created_at: r.created_at,
        strength_score: calcStrength(pw),
        age_days: ageDays,
        age_percent: pct,
        age_stage,
        rotate_recommended: age_stage === 'stale'
      };
    });
    res.json({ passwords: data, rotate_after_days: ROTATE_TARGET_DAYS });
  });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM saved_passwords WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    db.close();
    if (err) return res.status(500).json({ message: 'DB error' });
    if (this.changes === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  });
});

router.post('/:id/share', (req, res) => {
  const db = getDb();
  db.get('SELECT password_encrypted FROM saved_passwords WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, row) => {
    if (err || !row) { db.close(); return res.status(404).json({ message: 'Not found' }); }
    const token = crypto.randomBytes(16).toString('hex');
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    db.run('INSERT INTO share_tokens (token, password_encrypted, expires_at, user_id) VALUES (?,?,?,?)', [token, row.password_encrypted, expires, req.user.id], (e) => {
      db.close();
      if (e) return res.status(500).json({ message: 'DB error' });
      res.json({ share_url: `/api/passwords/shared/${token}` });
    });
  });
});

module.exports = router;
