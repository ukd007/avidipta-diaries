// utils/getProfileStats.js
const db = require('../config/db');

function getProfileStats(userId, test, callback) {
    if (!/^[a-z0-9_]+$/i.test(test)) {
        return callback(new Error('Invalid test name'));
    }

    const tableName = `${test}_stats`; // e.g., s25_stats
    const query = `SELECT * FROM \`${tableName}\` WHERE id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) return callback(err);
        if (!results || results.length === 0) return callback(new Error('No stats found'));

        const row = results[0];

        const stats = {
            bat: {
                runs: row.runs,
                balls_played: row.balls_played,
                wickets_played: row.wickets_played,
                fours: row.fours,
                fifties: row.fifties,
                hundreds: row.hundreds
            },
            bowl: {
                wickets_taken: row.wickets_taken,
                overs_bowled: (row.total_balls_bowled / 6).toFixed(1), // Convert balls to overs like 20.3
                maidens: row.maidens,
                runs_conceded: row.runs_conceded
            },
            field: {
                catches: row.catches,
                runouts: row.runouts,
                stumpings: row.stumpings
            }
        };

        return callback(null, {
            [test]: stats // Return under test key, e.g., 's25'
        });
    });
}

module.exports = getProfileStats;
