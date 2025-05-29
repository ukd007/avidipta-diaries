const mysql=require('mysql2');

const db=mysql.createConnection({
    host:'hosting host',
    user:'hosting user',
    password:'hosting password',
    database: 'hosting db',
});

db.connect(err=>{
    if(err)throw err;
    console.log('MYSQL connected');
});

module.exports=db;
