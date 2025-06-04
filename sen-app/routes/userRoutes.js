// routes/profile.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

//Utility Functions
const getprofileStats = require('../utils/profileStats');

router.get('/users/profile/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const tests = ['summer25', 'winter24', 'summer24']

    const q = `SELECT * from users WHERE id=?`

    db.query(q, userId, async (err, userResults) => {
        if (err || userResults.length === 0) return res.send("User Not Found");

        const user = userResults[0];

        const stats = {};

        let pending = tests.length;

        tests.forEach((testName) => {
            getprofileStats(userId, testName, (err, data) => {
                stats[testName] = data || {};
                console.log(stats);
            if (--pending === 0) {
                return res.render('profilePage', {
                    layout: false,
                    user,
                    stats
                });
            }
        });
    });
});
});

module.exports = router;
