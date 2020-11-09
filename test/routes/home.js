var express = require('express');
var router = express.Router();

// Home
router.get('/', function(req, res){
  res.render('home/home');
});


module.exports = router;
