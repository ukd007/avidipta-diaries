const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
    res.render('loginpage');
});

router.post('/', (req, res) => {
    const { uname: username, psw: password } = req.body;

    const q = 'SELECT * FROM users WHERE username=? AND password=?'

    db.query(q, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.render('loginpage', { error: "Invalid Credentials" });
        }

        const user = results[0];

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.username === 'admin' ? 'admin' : 'user',
            profile_pic: user.profile_pic
        }

        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard')
        } else {
            return res.redirect('/users/home');
        }
    })
});

router.get('/admin/dashboard', isAdmin, (req, res) => {
    return res.render('admin/dashboard', {
        layout: 'partials/bootstrap',
        title: 'Admin Dashboard',
    });
});

router.get('/users/home', (req, res) => {
    return res.render('home', { layout: false, user: req.session.user })
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('logout error: ', err);
            return res.status(500).send("Could not log out.");
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});
module.exports = router;