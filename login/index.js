var express=require("express");
var bodyParser=require('body-parser');

var connection = require('./config');
var app = express();

var authController=require('./controllers/auth-controller');
var registerController=require('./controllers/register-controller');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/login.html', function (req, res) {
   res.sendFile( __dirname + "/" + "login.html" );
})

/* route to handle login and registration */
app.post('/api/register',registerController.register);
app.post('/api/auth',authController.auth);

console.log(authController);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/auth-controller', authController.auth);
app.listen(3000);
