const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
    res.render('loginpage', { error: null });
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
            return res.render('loginpage', { error: "Invalid Credentials",layout:false });
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
  const loggedInUsername = req.session.user.username;
const q =`SELECT id, username, profile_pic FROM users WHERE username NOT IN ('admin')`
  db.query(q, (err, allUsers) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }

    // Move the logged-in user to the end of the array
    const filteredUsers = allUsers.filter(user => user.username !== loggedInUsername);
    const currentUser = allUsers.find(user => user.username === loggedInUsername);

    if (currentUser) {
      filteredUsers.push(currentUser); // push logged-in user at the end
    }

    res.render('home', {
      user: req.session.user,
      allUsers: filteredUsers,
      layout:false
    });
  });
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