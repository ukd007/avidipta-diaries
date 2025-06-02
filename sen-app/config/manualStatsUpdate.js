const db = require('./db');

async function updateBattingStats(dataArr) {
    const q = `UPDATE batstats_summer25 
              SET runs=?,balls_played=?, fours=?,wickets_played=?,fifties=?,hundreds=?
              WHERE id=?`
    await db.execute(q, dataArr);
}
async function updateBowlingStats(dataArr) {
    const q = `UPDATE bowlstats_summer25 
              SET wickets_taken=?,overs_bowled=?,maidens=?,runs_conceded=?
              WHERE id=?`
    await db.execute(q, dataArr);
}
async function updateFieldingStats(dataArr) {
    const q = `UPDATE fieldstats_summer25 
              SET catches=?,runouts=?,stumpings=?
              WHERE id=?`
    await db.execute(q, dataArr);
}
module.exports = {
    updateBattingStats,
    updateBowlingStats,
    updateFieldingStats
};