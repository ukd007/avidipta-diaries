const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');

// Render Score App with Live Match Data from Cloudinary
router.get('/scoreapp/:id', (req, res) => {
    const matchId = req.params.id;

    db.query('SELECT * FROM matches WHERE match_id = ?', [matchId], async (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Database Error');
        }

        if (results.length === 0) {
            return res.status(404).send('Match not found');
        }

        const cloudinaryUrl = results[0].cloudinary_url;

        if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
            console.error('Invalid Cloudinary URL:', cloudinaryUrl);
            return res.status(400).send('Invalid Cloudinary URL stored in database.');
        }

        try {
            const response = await axios.get(cloudinaryUrl);
            const matchData = response.data;

            res.render('admin/cricket_match/scoreapp', {
                layout: false,
                team1: results[0].team1,
                team2: results[0].team2,
                battingTeam: results[0].team1 // You can adjust this logic as needed
                // You can add batsman1, batsman2, and bowler here once you have those values
            });

        } catch (fetchError) {
            console.error('Cloudinary Fetch Error:', fetchError);
            return res.status(500).send('Failed to load match data from Cloudinary.');
        }
    });
});

// Final Score Sheet
router.get('/scoresheet/:matchId', (req, res) => {
    const matchId = req.params.matchId;

    db.query('SELECT * FROM matches WHERE match_id = ?', [matchId], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Database Error');
        }

        if (results.length === 0) return res.redirect('/match-manager');

        res.render('admin/cricket_match/scoresheet', {
            layout: 'partials/bootstrap',
            matchData: results[0]
        });
    });
});

module.exports = router;
