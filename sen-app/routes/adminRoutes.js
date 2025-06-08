const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const tests = ['summer25', 'winter24', 'summer24'];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params:{
    folder:'profile_pics',
  }
});

const parser = multer({ storage: storage });

router.get('/admin/users', (req, res) => {
  const q = `SELECT * FROM users`;
  db.query(q, (err, users) => {
    if (err) {
      console.error('DB error fetching users:', err);
      return res.status(500).send('Database error');
    }
    res.render('userslist.ejs', {
      users,
      layout: 'partials/bootstrap',
      title: 'Users List',
      pageCSS: '/styles/userslist.css',
    });
  });
});

router.get('/admin/users/:id/edit', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).send('Invalid User ID');
  }

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('DB error fetching user:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('User Not Found');
    }

    const user = results[0];
    const message = req.session.message || null;
    const error = req.session.error || null;

    req.session.message = null;
    req.session.error = null;

    let selectedTest = req.query.test;
    if (!tests.includes(selectedTest)) {
      selectedTest = 'summer25';
    }

    res.render('usereditform', {
      layout: 'partials/bootstrap',
      pageCSS: '/styles/usereditform.css',
      user,
      message,
      error,
      table: selectedTest,
      req,
    });
  });
});

router.post('/admin/users/:id/edit', parser.single('croppedImage'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  res.json(req.file);
})

module.exports = router;
