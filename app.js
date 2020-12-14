const express=require("express");
const bodyParser=require('body-parser');
const app = express();
const authController=require('./controllers/auth-controller');
const registerController=require('./controllers/register-controller');
const session = require('express-session');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.post('/api/register',registerController.register);
app.post('/api/auth',authController.auth);

console.log(authController);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/auth-controller', authController.auth);

module.exports = app;
