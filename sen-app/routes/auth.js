const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

// Render login page
router.get('/', (req, res) => {
  res.render('loginpage', { error: null });
});

// Handle login POST
router.post('/', (req, res) => {
  const { uname: username, psw: password } = req.body;
  const q = 'SELECT * FROM users WHERE username=? AND password=?';

  db.query(q, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    if (results.length === 0) {
      return res.render('loginpage', { error: "Invalid Credentials", layout: false });
    }

    const user = results[0];

    // Set user session with role based on username === 'admin'
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.username === 'admin' ? 'admin' : 'user',
      profile_pic: user.profile_pic
    };
  
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/users/home');
    }
  });
});

// Admin dashboard - protected route
router.get('/admin/dashboard', isAdmin, (req, res) => {
  return res.render('admin/dashboard', {
    layout: 'partials/bootstrap',
    title: 'Admin Dashboard',
  });
});

// User home page
router.get('/users/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/?error=not_logged_in');
  }

  const loggedInUsername = req.session.user.username;
  const q = `SELECT id, username, profile_pic FROM users WHERE username NOT IN ('admin')`;

  db.query(q, (err, allUsers) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }

    // Move the logged-in user to the end of the array
    const filteredUsers = allUsers.filter(user => user.username !== loggedInUsername);
    const currentUser = allUsers.find(user => user.username === loggedInUsername);

    if (currentUser) {
      filteredUsers.push(currentUser);
    }

    res.render('home', {
      user: req.session.user,
      allUsers: filteredUsers,
      layout: false
    });
  });
});

// Logout route - clear cookie-session
router.get('/logout', (req, res) => {
  req.session = null;  // clear session for cookie-session
  res.redirect('/');
});

module.exports = router;
