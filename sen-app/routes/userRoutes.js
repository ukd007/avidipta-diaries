const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users/profile/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    const q1 = `SELECT * FROM users WHERE id = ?`;
    const q2 = `SELECT * FROM batstats_summer25 WHERE id = ?`;
    const q3 = `SELECT * FROM bowlstats_summer25 WHERE id = ?`;
    const q4 = `SELECT * FROM fieldstats_summer25 WHERE id = ?`;


    db.query(q1, userId, (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (userResults.length === 0) {
            return res.render('home', { error: "User Not Found" });
        }

        const user = userResults[0];
        //SUMMER 2025
        db.query(q2, userId, (err, batStatsResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            if (batStatsResults.length === 0) {
                return res.render('home', { error: "Batting Stats Not Found" });
            }

            const batStats = batStatsResults[0];

            return res.render('profilePage', {
                layout: false,
                user: user,
                batStats: batStats
            });
        });
    });
});

module.exports = router;
