const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);


// NEW CODE: File System for JSON
const fs = require('fs');
const matchDataPath = path.join(__dirname, 'matchData.json');
function loadMatchData() {
  try {
    const data = fs.readFileSync('matchData.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log('No previous match data found, starting fresh.');
    return {
      score: 0,
      wickets: 0,
      overs: 0.0,
      batsman1: "",
      batsman2: "",
      bowler: "",
      balls: [],
    };
  }
}


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


// NEW CODE: Functions to load/save match data
function loadMatchData() {
  try {
    const raw = fs.readFileSync(matchDataPath);
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read match data:', err);
    return {};
  }
}

function saveMatchData(data) {
  try {
    fs.writeFileSync(matchDataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write match data:', err);
  }
}


app.use(cors());
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
const cricketRoutes= require('./routes/blogs/cricket');
app.use('/',cricketRoutes);

// Scorer App Page (uses layout)
app.get('/admin/scorerapp', (req, res) => {
  res.render('admin/scorerapp', {
    layout: 'partials/bootstrap',
    title: 'Scorer App'
  });
});
//Match Start
app.post('/start-match', (req, res) => {
  const { team1, team2, tossWinner, tossDecision, batsman1, batsman2,  bowler } = req.body;
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