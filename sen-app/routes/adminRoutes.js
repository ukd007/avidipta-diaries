const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Use memory storage for multer since we process the image in memory
const upload = multer({ storage: multer.memoryStorage() });

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
            pageCSS: '/styles/userslist.css'
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
            user
        });
    });
});

// Save the cropped image as public/profilepics/<username>.jpg
router.post('/admin/users/:id/edit', upload.single('croppedImage'), (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        return res.status(400).send('Invalid User ID');
    }

    if (!req.file) {
        return res.status(400).send('No cropped image uploaded');
    }

    // First fetch the username from the DB
    const getUserQuery = 'SELECT username FROM users WHERE id = ?';
    db.query(getUserQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const username = results[0].username;
        const filename = `${username}.jpg`;
        const destPath = path.join(__dirname, '../public/profilepics', filename);

        // Save the image
        fs.writeFile(destPath, req.file.buffer, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving image');
            }

            // Optionally update profile_pic column in DB if you store the filename
            const updateQuery = `
                UPDATE users
                SET profile_pic = ?
                WHERE id = ?
            `;

            db.query(updateQuery, [filename, userId], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database error');
                }

                res.redirect('/admin/users');
            });
        });
    });
});

module.exports = router;
