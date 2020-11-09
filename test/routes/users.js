var express = require('express');
var router = express.Router();
var User = require('../models/User');

// Index
router.get('/', function(req, res){
  User.find({})
    .sort({id:1})
    .exec(function(err, users){
      if(err) return res.json(err);
      res.render('users/index', {users:users});
    });
});

// New
router.get('/new', function(req, res){
  res.render('users/new');
});

// create
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err) return res.json(err);
    res.redirect('/users');
  });
});

// show
router.get('/:id', function(req, res){
  User.findOne({id:req.params.id}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

// edit
router.get('/:id/edit', function(req, res){
  User.findOne({id:req.params.id}, function(err, user){
    if(err) return res.json(err);
    res.render('users/edit', {user:user});
  });
});

// update
router.put('/:id', function(req, res, next){
  User.findOne({id:req.params.id})
    .select('password')
    .exec(function(err, user){
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err) return res.json(err);
        res.redirect('/users/'+user.id);
      });
  });
});

// destroy
router.delete('/:id', function(req, res){
  User.deleteOne({id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/users');
  });
});

module.exports = router;
