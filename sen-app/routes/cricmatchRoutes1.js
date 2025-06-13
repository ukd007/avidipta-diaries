const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');

// Match Manager Page
router.get('/match-manager', (req, res) => {
    db.query('SELECT * FROM matches', (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Failed to load matches.');
        }

        res.render('admin/cricket_match/match_manager', {
            layout: 'partials/bootstrap',
            matches: results // Pass the matches to EJS
        });
    });
});

// Show Match Starter Form
router.get('/match-starter/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    res.render('admin/cricket_match/match_starter', { layout: false, matchId });
});

// Generate New Match ID and Redirect to Starter Form
router.post('/new', (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM matches", (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Failed to generate match ID.');
        }

        const nextMatchId = results[0].count + 1;
        res.redirect(`/match-starter/${nextMatchId}`);
    });
});

// Initialize Match and Save to DB + Cloudinary with JSON Structure
router.post('/initialize', async (req, res) => {
    const { match_id, team1, team2, type } = req.body;

    const initialMatchData = {
        matchId: match_id,
        team1,
        team2,
        type,
        toss: {
            wonBy: "",
            decision: ""
        },
        innings: [
            { battingTeam: team1, overs: [] },
            { battingTeam: team2, overs: [] }
        ],
        status: "not_started"
    };

    // ✅ Retry with Exponential Backoff
    async function uploadWithRetry(data, retries = 3, delay = 2000) {
        try {
            return await cloudinary.uploader.upload(
                `data:application/json;base64,${Buffer.from(JSON.stringify(data)).toString('base64')}`,
                {
                    resource_type: 'raw',
                    public_id: `cricket_match_${match_id}`,
                    folder: 'cric_match_data',
                    timeout: 120000 // 120 seconds timeout
                }
            );
        } catch (error) {
            if (retries > 0 && (error.name === 'TimeoutError' || error.http_code === 499)) {
                console.warn(`Upload failed, retrying in ${delay}ms... Attempts left: ${retries}`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Delay
                return uploadWithRetry(data, retries - 1, delay * 2); // Exponential backoff
            }
            console.error('Cloudinary Upload Failed after retries:', error);
            throw error; // Let the main try-catch handle it
        }
    }

    try {
        const uploadResult = await uploadWithRetry(initialMatchData);

        const cloudinary_url = uploadResult.secure_url;
        const cloudinary_public_id = uploadResult.public_id;

        const insertSql = `
            INSERT INTO matches (match_id, team1, team2, type, cloudinary_url, cloudinary_public_id, status)
            VALUES (?, ?, ?, ?, ?, ?, 'in_progress')
        `;
        const values = [match_id, team1, team2, type, cloudinary_url, cloudinary_public_id];

        db.query(insertSql, values, (err) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send('Failed to initialize match.');
            }

            req.session.matchData = { matchId: match_id };
            res.redirect(`/scoreapp/${match_id}`);
        });

    } catch (cloudinaryError) {
        console.error('Cloudinary Upload Error:', cloudinaryError);
        return res.status(500).send('Failed to upload match data to Cloudinary. Please try again.');
    }
});

// Resume Match
router.post('/resume', (req, res) => {
    const { matchId } = req.body;

    if (!matchId) return res.redirect('/match-manager');

    req.session.matchData = { matchId };
    res.redirect(`/scoreapp/${matchId}`);
});

//Delete Match(DB+Cloudinary)
router.post('/delete-match', (req, res) => {
    const { matchID } = req.body;
    q1= 'SELECT cloudinary_public_id from matches where match_id=?'
    db.query(q1, [matchID], async (err, results) => {
        if (err) {
            console.error('Database error:', err)
            return res.status(500).send('Failed to delete match.');
        }
        if (results.length === 0) {
            return res.redirect('/match-manager');
        }
        const publicID = results[0].cloudinary_public_id;

        //Delete from cloudinaruy if publciId exits
        if (publicID) {
            try {
                await cloudinary.uploader.destroy(publicID, { resource_type: raw });
                console.log('CLoudinary file deleted successfully.');
            } catch (cloudErr) {
                console.error('Cloudianry Deletion Error:', cloudErr);
            }
        }

        //Delete from database
        q2='DELETE from matches where match_id=?'
        db.query(q2,[matchID],(err)=>{
            if (err){
                console.error("Database Error: ",err);
                return res.status(500).send('Failed to delete match.');
            }
            res.redirect('/match-manager');
        });
    });
});

module.exports=router