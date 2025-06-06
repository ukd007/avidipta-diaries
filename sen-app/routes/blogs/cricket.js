const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware to check admin
function isAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).send('Forbidden');
}

// Unified route: show all cricket news (admin sees edit/add/delete, users see only read)
router.get('/cricket_news', (req, res) => {
  const q = 'SELECT * FROM news ORDER BY created_at DESC';
  db.query(q, (err, newsItems) => {
    if (err) return res.status(500).send('DB error');
    res.render('users/cricket', {
      layout: false,
      newsItems,
      isAdmin: req.session?.user?.role === 'admin',
      editingId: req.query.edit || null,
      user: req.session.user // ✅ passed here
    });
  });
});

// Optional: redirect /admin/cricket_news to /cricket_news
router.get('/admin/cricket_news', isAdmin, (req, res) => {
  res.redirect('/cricket_news');
});

// Create cricket news
router.post('/admin/cricket_news/new', isAdmin, (req, res) => {
  const { title, content, type } = req.body;
  const q = 'INSERT INTO news (title, content, type) VALUES (?, ?, ?)';
  db.query(q, [title, content, type], (err) => {
    if (err) return res.status(500).send('Error creating news');
    res.redirect('/cricket_news');
  });
});

// Edit cricket news
router.post('/admin/cricket_news/:id/edit', isAdmin, (req, res) => {
  const { title, content, type } = req.body;
  const q = 'UPDATE news SET title = ?, content = ?, type = ? WHERE id = ?';
  db.query(q, [title, content, type, req.params.id], (err) => {
    if (err) return res.status(500).send('Error updating news');
    res.redirect('/cricket_news');
  });
});

// Delete cricket news
router.post('/admin/cricket_news/:id/delete', isAdmin, (req, res) => {
  const q = 'DELETE FROM news WHERE id = ?';
  db.query(q, [req.params.id], (err) => {
    if (err) return res.status(500).send('Error deleting news');
    res.redirect('/cricket_news');
  });
});

module.exports = router;
