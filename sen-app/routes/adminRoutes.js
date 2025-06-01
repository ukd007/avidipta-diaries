const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/admin/users', (req, res) => {
    const q = `SELECT * from users`
    db.query(q, (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        return res.render('userslist.ejs', {
            users,
            layout: 'partials/bootstrap',
            title: 'Users List',
            pageCSS: '/styles/userslist.css'
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
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(404).send('User Not Found');
        }

        const user = results[0];

        res.render('usereditform', {
            pageCSS: '/styles/usereditform.css',
            layout: 'partials/bootstrap',
            user: {
                ...user,
                picOffsetX: user.profile_pic_offset_x || 0,
                picOffsetY: user.profile_pic_offset_y || 0
            }
        });
    });
});

router.post('/admin/users/:id/edit', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        return res.status(400).send('Invalid User ID');
    }

    const offsetX = parseFloat(req.body.picOffsetX) || 0;
    const offsetY = parseFloat(req.body.picOffsetY) || 0;

    const q = `
    UPDATE users
    SET profile_pic_offset_x = ?, profile_pic_offset_y = ?
    WHERE id = ?
    `;

    db.query(q, [offsetX, offsetY, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database Error');
        }
        res.redirect('/admin/users');
    });
});

module.exports = router;
