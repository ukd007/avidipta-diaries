const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.get('/', (req, res) => {
  res.render('homepage');  // or res.send('Hello World') to test
});


//View Engine Setup
app.set("view engine", "ejs");
app.use(expressLayouts);
const viewsArray = [path.join(__dirname, 'views'),
path.join(__dirname, 'views/users'),
path.join(__dirname, 'views/admin'),
path.join(__dirname, 'views/partials')]
app.set('views', viewsArray);

//Middleware
// app.use(express.urlencoded({ extended: false }));
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false },

//}));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//Import Routes
//const authRoutes=require('middleware/auth');
//app.use('/',authRoutes);
/*app.get("/", (req, res) => {
  res.render("profilepage");
});*/
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
  res.render("profilepage", { players }); // 👈 Fix the path here
});


app.get('/cricket', (req, res) => {
  res.redirect('users/profilepage');
});

//LOGIN PAGE [ homepage.ejs]
app.post('/login', (req, res) => {
  res.redirect('/home');
});

//LOGIN PAGE REDIRECTING TO [home.ejs]
app.get('/home', (req, res) => {
  res.render('home'); 
});
//AUTHENTICATION TO BE DONE AFTER LOGIN SYSTEM IS MADE
app.get('/admin', (req, res) => {
  res.render('admin/dashboard', {
    layout: 'partials/bootstrap',
    title: 'Admin Dashboard',
  });
});


app.get('/admin/scorerapp', (req, res) => {
  res.render('admin/scorerapp', {
  layout: 'partials/bootstrap',
  title: 'Scorer App'
});
});

//Start Server
app.listen(8080, () => {
  console.log('Server listening on 8080');
})
  ;