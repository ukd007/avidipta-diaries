const express = require('express');
const router = express.Router();
const db = require('../../config/db');

const allowedTables = {
  summer24: 's24_stats',
  winter24: 'w24_stats',
  summer25: 's25_stats'
};

function getSafeTableName(friendlyName) {
  if (allowedTables[friendlyName]) {
    return allowedTables[friendlyName];
  }
  throw new Error('Invalid table name');
}

router.get('/edit-player/:id', (req, res) => {
  try {
    const friendlyTable = req.query.table;
    const table = getSafeTableName(friendlyTable); // real table name
    const id = parseInt(req.params.id);

    db.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, results) => {
      if (err || results.length === 0) return res.status(500).send('Player not found');
      res.render('edit-player', {
        player: results[0],
        table: friendlyTable // pass friendly name to frontend
      });
    });
  } catch (err) {
    return res.status(400).send(err.message);
  }
});
router.post('/update-player/:id', (req, res) => {
  try {
    const friendlyTable = req.query.table;
    const table = getSafeTableName(friendlyTable);
    const id = parseInt(req.params.id);
    const data = req.body;

    const fields = Object.keys(data);
    const values = Object.values(data);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    db.query(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      [...values, id],
      (err) => {
        if (err) return res.status(500).send('Update error');
        // Redirect to user edit page with 'test' query param (instead of 'table')
        res.redirect(`/admin/users/${id}/edit?test=${friendlyTable}`);
      }
    );
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

module.exports = router