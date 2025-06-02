const express = require('express');
const router = express.Router();
const db = require('../config/db');
const {
  updateBattingStats,
  updateBowlingStats,
  updateFieldingStats
} = require('../config/manualStatsUpdate');

// Batting stats update
router.post('/update-batting', (req, res) => {
  const {
    runs, balls_played, fours_hit, wickets_played, fifties, hundreds, player_id
  } = req.body;

  const dataArr = [
    parseInt(runs),
    parseInt(balls_played),
    parseInt(fours_hit),
    parseInt(wickets_played),
    parseInt(fifties),
    parseInt(hundreds),
    parseInt(player_id)
  ];

  const q = `SELECT * FROM users WHERE id = ?`;

  db.query(q, dataArr[6], (err, result) => {
    if (err) {
      console.error(err);
      req.session.message = null;
      req.session.error = 'Database error while fetching user';
      return res.redirect(`/admin/users/${dataArr[6]}/edit`);
    }

    updateBattingStats(dataArr).then(() => {
      req.session.message = 'Batting stats updated successfully';
      req.session.error = null;
      res.redirect(`/admin/users/${dataArr[6]}/edit`);
    }).catch(err => {
      console.error(err);
      req.session.message = null;
      req.session.error = 'Error updating batting stats';
      res.redirect(`/admin/users/${dataArr[6]}/edit`);
    });
  });
});

// Bowling stats update
router.post('/update-bowling', (req, res) => {
  const { wickets_taken, overs_bowled, maidens, runs_conceded, player_id } = req.body;

  const dataArr = [
    parseInt(wickets_taken),
    parseInt(overs_bowled),
    parseInt(maidens),
    parseInt(runs_conceded),
    parseInt(player_id)
  ];

  const q = `SELECT * FROM users WHERE id = ?`;
  db.query(q, dataArr[4], (err, result) => {
    if (err) {
      console.error(err);
      req.session.message = null;
      req.session.error = 'Database error while fetching user';
      return res.redirect(`/admin/users/${dataArr[4]}/edit`);
    }

    updateBowlingStats(dataArr).then(() => {
      req.session.message = 'Bowling stats updated successfully';
      req.session.error = null;
      res.redirect(`/admin/users/${dataArr[4]}/edit`);
    }).catch(err => {
      console.error(err);
      req.session.message = null;
      req.session.error = 'Error updating bowling stats';
      res.redirect(`/admin/users/${dataArr[4]}/edit`);
    });
  });
});

// Fielding stats update
router.post('/update-fielding', (req, res) => {
  const {
    catches, runouts,stumpings, player_id
  } = req.body;

  const dataArr = [
    parseInt(catches),
    parseInt(runouts),
    parseInt(stumpings),
    parseInt(player_id)
  ];

  const q = `SELECT * FROM users WHERE id = ?`;

  db.query(q, dataArr[3], (err, result) => {
    if (err) {
      console.error(err);
      req.session.message = null;
      req.session.error = 'Database error while fetching user';
      return res.redirect(`/admin/users/${dataArr[3]}/edit`);
    }

    updateFieldingStats(dataArr).then(() => {
      req.session.message = 'Fielding stats updated successfully';
      req.session.error = null;
      res.redirect(`/admin/users/${dataArr[3]}/edit`);
    }).catch(err => {
      console.error(err);
      req.session.message = null;
      req.session.error = 'Error updating fielding stats';
      res.redirect(`/admin/users/${dataArr[3]}/edit`);
    });
  });
});

module.exports = router;
