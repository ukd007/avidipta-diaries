const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/login',(req,res)=>{
    res.render('login');
});

router.post('/login',(req,res)=>{
    const {username,password}=req.body;
    if (username==='admin'&&password==='cvable'){
        req.session.user={username,role:'admin'}
        return res.redirect('/admin/dashboard')
    }
    res.render('login',{error:"Invalid Credentials"});
});

router.get('/admin/dashboard',(req,res)=>{
    if (!req.session.user||req.session.user.role!=='admin'){
        return res.redirect('/login');
    }
})
module.exports=router;