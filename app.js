var express=require("express");
var bodyParser=require('body-parser');
var connection = require('./config');
var app = express();
var authController=require('./controllers/auth-controller');
var registerController=require('./controllers/register-controller');
var session = require('express-session');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));


/* app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/login', function (req, res) {
   res.sendFile( __dirname + "/" + "login.html" );
})

app.get('/register', function (req, res) {
   res.sendFile( __dirname + "/" + "register.html" );
})
app.get('/login.css',function(req,res){
  res.sendFile(__dirname + "/" + "login.css");
})
app.get('/main', function (req, res) {
   if(!req.session.user) res.redirect('/login');
   else {
     console.log(req.session.user.id);
     res.sendFile(__dirname + "/" + "main.html");
   }
})

app.get("/logout",function(req,res){
  if(req.session.user){
    req.session.destroy(
      function (err){
        if(err){
          console.log("log out session error");
          return;
        }
        console.log("log out");
        res.redirect("/");
      }
    );

  } else{
    console.log("no session");
    res.redirect('/login');
  }

}) */

app.post('/api/register',registerController.register);
app.post('/api/auth',authController.auth);

console.log(authController);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/auth-controller', authController.auth);

module.exports = app;
