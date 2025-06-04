// routes/profile.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const getSummer25Stats = require('../utils/summer25Stats.js');

router.get('/users/profile/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    const q1 = `SELECT * FROM users WHERE id = ?`;

    db.query(q1, userId, (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (userResults.length === 0) {
            return res.render('home', { error: "User Not Found" });
        }

        const user = userResults[0];

        getSummer25Stats(userId, (err, stats, errorMsg) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            if (!stats) {
                return res.render('home', { error: errorMsg });
            }

            return res.render('profilePage', {
                layout: false,
                user,
                batStats: stats.batStats,
                bowlStats: stats.bowlStats,
                fieldStats: stats.fieldStats
            });
        });
    });
});

module.exports = router;
