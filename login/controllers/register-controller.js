var Cryptr = require('cryptr');
var express=require("express");
var connection = require('./../config');

module.exports.register=function(req,res){
    var today = new Date();
    var encryptedString = cryptr.encrypt(req.body.password);
    var users={
        "id":req.body.id,
        "password":encryptedString,
        "name":req.body.name,
        "email":req.body.email,
        "created":today
    }
    var sql = "INSERT INTO users (id,pw,name,email,created) VALUES(?,?,?,?,?)";
    var param = [req.body.id, req.body.password, req.body.name, req.body.eamil,req.body.created];
    connection.query(sql, param, function (error, results, fields) {
      if (error) {
        res.json({
            status:false,
            message:'there are some error with query'
        })
      }else{
          res.json({
            status:true,
            data:results,
            message:'user registered sucessfully'
        })
      }
    });
}
