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

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'anudayenduanaranyapartnership',     // replace with a real secret string
  resave: false,                 // recommended false to avoid unnecessary saves
  saveUninitialized: false,      // recommended false to not save empty sessions
  cookie: {
    secure: false                // set to true if using HTTPS (SSL)
  }
}));
// ROUTES

// login page
app.get('/', (req, res) => {
  res.render('loginpage', { layout: false });
});
// Authentication
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

//ADMIN ONLY
const userRoutes = require('./routes/adminRoutes');
app.use('/', userRoutes);

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
