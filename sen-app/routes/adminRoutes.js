const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const tests = ['summer25', 'winter24', 'summer24'];

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

    // Get flash messages from session and clear them
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
      user,
      message,
      error,
      table: selectedTest,
      req,
    });
  });
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pics',
  }
});

const parser = multer({ storage: storage });

router.post("/admin/users/:id/update-picture", parser.single('croppedImage'), async (req, res) => {
  try {
    if (!req.file) {
      // Since this route returns JSON only, keep it consistent
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadedFileUrl = req.file.path;

    return res.status(200).json({
      success: true,
      url: uploadedFileUrl,
      message: "Profile picture updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during upload"
    });
  }
});

router.post('/admin/users/:id/edit', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { profile_pic_url /*, other fields */ } = req.body;

  console.log("Body is " + JSON.stringify(req.body));
  console.log("UserId: ", userId);

  const sql = 'UPDATE users SET profile_pic = ? WHERE id = ?';
  const params = [profile_pic_url, userId];

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Update error:', err);
      req.session.error = { type: 'danger', text: 'Failed to update user.' };
      return res.redirect(`/admin/users/${userId}/edit`);
    }

    req.session.message = { type: 'success', text: 'Profile updated successfully.' };
    res.redirect(`/admin/users/${userId}/edit`);
  });
});

module.exports = router;
