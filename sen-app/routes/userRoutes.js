const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users/profile/:id',(req,res)=>{
    return res
})

module.exports = router;