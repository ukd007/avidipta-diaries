const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

app.get('/', (req, res) => {
  res.render('homepage');  // or res.send('Hello World') to test
});


//View Engine Setup
app.set("view engine", "ejs");
app.set('views', [path.join(__dirname, 'views'),path.join(__dirname, 'views/users')]);

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
  res.render("users/profilepage", { players }); // 👈 Fix the path here
});

app.get('/cricket', (req, res) => {
  res.render('users/profilepage');
});

//Start Server
app.listen(8080, () => {
  console.log('Server listening on 8080');
})
  ;