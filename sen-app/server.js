const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// View Engine Setup
app.set("view engine", "ejs");
app.use(expressLayouts);

const viewsArray = [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views/users'),
  path.join(__dirname, 'views/admin'),
  path.join(__dirname, 'views/partials')
];
app.set('views', viewsArray);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES

// Homepage (login page)
app.get('/', (req, res) => {
  res.render('homepage', { layout: false });
});

// Profile Page
app.get('/profilepage', (req, res) => {
  const players = [
    { names: "Anaranya" },
    { names: "Aranyak" },
    { names: "Adesh" },
    { names: "Angshu" },
    { names: "Bibaswan" },
    { names: "Ishan" },
    { names: "Mayukh" },
    { names: "Rudraksh" },
    { names: "Swapnesh" },
    { names: "Sayan" },
    { names: "Sahendra" },
    { names: "Sashwat" },
    { names: "Udayendu" },
  ];
  res.render("profilepage", { players, layout: false });
});

// Redirect to Profile Page
app.get('/cricket', (req, res) => {
  res.redirect('users/profilepage');
});

// Login Submit → Redirect to Home Page
app.post('/login', (req, res) => {
  res.redirect('/home');
});

// Home Page (after login)
app.get('/home', (req, res) => {
  res.render('home', { layout: false });
});

// Admin Dashboard (uses layout)
app.get('/admin', (req, res) => {
  res.render('admin/dashboard', {
    layout: 'partials/bootstrap',
    title: 'Admin Dashboard',
  });
});

// Scorer App Page (uses layout)
app.get('/admin/scorerapp', (req, res) => {
  res.render('admin/scorerapp', {
    layout: 'partials/bootstrap',
    title: 'Scorer App'
  });
});

// Start Server
app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});
