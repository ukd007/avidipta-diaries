const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users/profile/:id',(req,res)=>{
    const userId=parseInt(req.params.id,10)
    q=`select * from users where id=?`
    db.query(q,userId,(err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.render('home', { error: "Data Not Found" });
        }
    user=results[0];
    return res.render('profilePage.ejs',{layout:false,user})
    })
    
});

module.exports = router;