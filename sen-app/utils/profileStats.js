// utils/summer25Stats.js
const db = require('../config/db');

function getProfileStats(userId, testName, callback) {
    if (!/^[a-z0-9]+$/i.test(testName)) {
        return callback(new Error('Invalid test name'));
    }

    const batTable = `batstats_${testName}`;
    const bowlTable = `bowlstats_${testName}`;
    const fieldTable = `fieldstats_${testName}`;

    let stats = {};
    q1 = `SELECT * FROM ?? WHERE id = ?`
    db.query(q1, [batTable, userId], (err1, batRows) => {
        if (err1) return callback(err1);
        stats.bat = batRows[0] || {};  // ✅ use `bat` instead of `batStats`


        db.query(`SELECT * FROM ?? WHERE id = ?`, [bowlTable, userId], (err2, bowlRows) => {
            if (err2) return callback(err2);
            stats.bowl = bowlRows[0] || {};  // ✅ use `bowl` instead of `bowlStats`

            db.query(`SELECT * FROM ?? WHERE id = ?`, [fieldTable, userId], (err3, fieldRows) => {
                if (err3) return callback(err3);
                stats.field = fieldRows[0] || {};
                callback(null, stats);
            });

        });
    });
}

module.exports = getProfileStats;
