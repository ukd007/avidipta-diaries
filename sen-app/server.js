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

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
const isProduction = process.env.NODE_ENV === 'production';
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY_1 || 'devkey1', process.env.SESSION_KEY_2 || 'devkey2'],
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: isProduction
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


// login page
app.get('/', (req, res) => {
  res.render('loginpage', { layout: false });
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
const cricketRoutes = require('./routes/blogs/cricket');
app.use('/', cricketRoutes);

// Scorer App Page (uses layout)
app.get('/admin/scorerapp', (req, res) => {
  res.render('admin/scorerapp', {
    layout: 'partials/bootstrap',
    title: 'Scorer App'
  });
});
//Match Start
app.post('/start-match', (req, res) => {
  const { team1, team2, tossWinner, tossDecision, batsman1, batsman2, bowler } = req.body;
  let battingTeam;

  if (tossDecision.toLowerCase() === "bat") {
    // Toss winner chose to bat
    battingTeam = tossWinner;
  } else {
    // Toss winner chose to bowl, so batting team is the other team
    battingTeam = (tossWinner === team1) ? team2 : team1;
  }

  // Pass data to scoresheet.ejs
  res.render('admin/scoresheet', {
    layout: 'partials/bootstrap',
    team1,
    team2,
    tossWinner,
    tossDecision,
    batsman1,
    batsman2,
    bowler,
    battingTeam,
  });
});



app.get('/scorecard', (req, res) => {
  res.render('scorecard');
});


// New Code: Set up match state
let matchState = {
  score: 0,
  wickets: 0,
  overs: 0.0,
  batsman1: 'Player 1',
  batsman2: 'Player 2',
  bowler: 'Bowler 1',
  balls: []
};


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