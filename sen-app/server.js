const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

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

app.get("/", (req, res) => {
  res.render("profilepage");
});

//Start Server
app.listen(8080, () => {
  console.log('Server listening on 8080');
})
  ;