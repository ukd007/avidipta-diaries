const express = require('express');
const router = express.Router();
const db = require('../config/db');
const getProfileStats = require('../utils/profileStats');

router.get('/users/profile/:id', (req, res) => {
  const userId = req.params.id;
  const seasons = ['s25', 's24', 'w24'];
  const allStats = {};

  // Step 1: Get user info from the database
  db.query('SELECT id, username, profile_pic FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error('User not found or DB error:', err?.message || 'No user');
      return res.status(404).send('User not found');
    }

    const user = results[0];

    // Step 2: Get stats for all seasons
    let pending = seasons.length;

    seasons.forEach(season => {
      getProfileStats(userId, season, (err, stats) => {
        if (err) {
          console.error(`Error for ${season}:`, err.message);
          allStats[season] = {
            bat: {}, bowl: {}, field: {}
          };
        } else {
          allStats[season] = stats[season];
        }

        // Step 3: Render after all async calls are complete
        if (--pending === 0) {
          res.render('profilePage', {
            user,          // ← fetched user info
            stats: allStats,
            layout: false
          });
        }
      });
    });
  });
});

module.exports = router;
