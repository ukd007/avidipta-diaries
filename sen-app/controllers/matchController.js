const db = require('./db');
const cloudinary = require('./cloudinary');
const axios = require('axios');
const streamifier = require('streamifier');

async function createMatch(match_id, team1, team2, type) {
    //Initial empty score JSON
    const scoreData = {
        match_id,
        teams: [team1.team2],
        scores: {},
        winner: null
    };
    const uploadResult = await uploadJsonBuffer(`scores/match_${match_id}`, scoreData);

    await db.query(
        `INSERT INTO matches (match_id, team1, team2, type, cloudinary_url, cloudinary_public_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [match_id, team1, team2, type, uploadResult.secure_url, uploadResult.public_id]
    );
}