var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var mysql = require('mysql');
var crypto = require('crypto');

//express 객체 생성
var app = express();
var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : '1234',
    database : 'test'
  });

  connection.connect();

app.set('view engine','ejs');
app.set('views','./views');
  
app.use(bodyParser.urlencoded({extended:false}));

app.get('/',function (req,res){
	res.send('<a href="/login">login</a>');
});
app.get('/login',function(req,res){
	res.render('login');
});


app.post('/login',function(req,res){
	var id = req.body.username;
	var pw = req.body.password;
	var sql = 'SELECT * FROM users WHERE id=?';
	connection.query(sql,[id],function(err,results){
		if(err) console.log(err);
		
		if(!results[0])
			return res.send('please check your id');
		
		var user = results[0];
		crypto.pbkdf2(pw,user.salt,100000,64,'sha512',function(err,derivedKey){
			if(err) console.log(err);
			if(derivedKey.toString('hex') === user.password){
				return res.send('login success');
			}
			else 
				return res.send('please check your password');
		});
	});
});
http.createServer(app).listen(3000, function(){
    console.log('Express server running');
});