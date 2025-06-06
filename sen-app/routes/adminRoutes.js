const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Valid test names
const tests = ['summer25', 'winter24', 'summer24'];

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pics',
    format: 'jpg',
    public_id: (req) => `user_${req.params.id}_${Date.now()}`,
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

// Show all users
router.get('/admin/users', (req, res) => {
  const q = `SELECT * FROM users`;
  db.query(q, (err, users) => {
    if (err) {
      console.error(err);
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

// Show edit form for one user
router.get('/admin/users/:id/edit', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).send('Invalid User ID');
  }

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('User Not Found');
    }

    const user = results[0];

    const message = req.session.message || null;
    const error = req.session.error || null;

    // Clear messages
    req.session.message = null;
    req.session.error = null;

    // Validate selected test name
    let selectedTest = req.query.test;
    if (!tests.includes(selectedTest)) {
      selectedTest = 'summer25'; // fallback default
    }

    res.render('usereditform', {
      layout: 'partials/bootstrap',
      pageCSS: '/styles/usereditform.css',
      user,
      message,
      error,
      table: selectedTest,  // pass table for use in EJS
      req,
    });

  });
});

// POST - Upload cropped image and update DB
router.post('/admin/users/:id/edit', upload.single('croppedImage'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    req.session.error = 'Invalid User ID';
    return res.redirect(`/admin/users/${req.params.id}/edit`);
  }

  if (!req.file || (!req.file.path && !req.file.secure_url)) {
    req.session.error = 'No image uploaded';
    return res.redirect(`/admin/users/${req.params.id}/edit`);
  }

  const profilePicUrl = req.file.secure_url || req.file.path;

  const q = `
    UPDATE users
    SET profile_pic = ?
    WHERE id = ?
  `;

  db.query(q, [profilePicUrl, userId], (err) => {
    if (err) {
      console.error(err);
      req.session.error = 'Database Error';
      return res.redirect(`/admin/users/${req.params.id}/edit`);
    }

    const test = req.query.test && tests.includes(req.query.test) ? req.query.test : 'summer25';

    req.session.message = 'Image updated successfully';
    res.redirect(`/admin/users/${req.params.id}/edit?test=${test}`);
  });
});

module.exports = router;
