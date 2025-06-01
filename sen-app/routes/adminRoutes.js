const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profilepics',
    format: 'jpg',
    public_id: (req) => `user_${req.params.id}_${Date.now()}`, // unique public_id
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

    res.render('usereditform.ejs', {
      layout: 'partials/bootstrap',
      pageCSS: '/styles/usereditform.css',
      user,
    });
  });
});

// POST - Upload & save cropped image to Cloudinary & update DB
router.post('/admin/users/:id/edit', upload.single('croppedImage'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).send('Invalid User ID');
  }

  if (!req.file || !req.file.path) {
    return res.status(400).send('No image uploaded');
  }

  const profilePicUrl = req.file.path; // Cloudinary image URL

  const q = `
    UPDATE users
    SET profile_pic = ?
    WHERE id = ?
  `;

  db.query(q, [profilePicUrl, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database Error');
    }
    res.status(200).json({ success: true, message: 'Image updated', url: profilePicUrl });
  });
});


module.exports = router;
