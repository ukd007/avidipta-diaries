const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

const path = require('path');
require('dotenv').config();
const cookieSession = require('cookie-session');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);

const fs = require('fs');

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY_1, process.env.SESSION_KEY_2],
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
  sameSite: 'none'
}));



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
app.use(cors());
app.use(express.static('public'));


// ROUTES

//NEW CODE 2
app.get('/match-data', (req, res) => {
  res.json(matchState);
});

let matchState = {};
// Load match data from file at startup
if (fs.existsSync('matchData.json')) {
  matchState = JSON.parse(fs.readFileSync('matchData.json'));
  console.log('Match data loaded from file');
} else {
  matchState = {
    score: 0,
    wickets: 0,
    overs: "0.0",
    batsman1: {},
    batsman2: {},
    bowler: {}
  };
  console.log('Starting with fresh match state');
}

// login page
app.post('/', (req, res) => {
  try {
    const { uname, psw } = req.body;

    // Example dummy check — replace with DB or actual logic
    if (uname === 'admin' && psw === 'password') {
      req.session.user = uname;
      res.redirect('/dashboard');
    } else {
      res.render('loginpage', { layout: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// Authentication
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

//ADMIN ONLY
const adminRoutes = require('./routes/adminRoutes');
app.use('/', adminRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);
const statsRoutes = require('./routes/profileData/stats');
app.use('/', statsRoutes);
//Cricket Routes
const cricblogRoutes = require('./routes/blogs/cricket');
app.use('/', cricblogRoutes);
const cricmatchRoutes1 = require('./routes/cricmatchRoutes2');
app.use('/', cricmatchRoutes1);
const cricmatchRoutes2 = require('./routes/cricmatchRoutes1');
app.use('/', cricmatchRoutes2);

// New Code: Socket.IO logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current match state to new client
  socket.emit('update', matchState);

  // Listen for updates and broadcast
  socket.on('update', (data) => {
    matchState = { ...matchState, ...data }; // update shared state
    socket.broadcast.emit('update', matchState); // notify others
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
server.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});