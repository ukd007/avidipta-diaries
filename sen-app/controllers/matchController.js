const db = require('./db');
const cloudinary = require('./cloudinary');
const axios = require('axios');
const streamifier=require('streamifier');

async function createMatch(match_id,team1,team2,type){
    //Initial empty score JSON
    const scoreData={
        match_id,
        teams:[team1.team2],
        scores:{},
        winner:null
    };
    const uploadResult=await uploadJsonBuffer(`scores/match_${match_id}`,scoreData);
    
}