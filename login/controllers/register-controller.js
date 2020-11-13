var Cryptr = require('cryptr');
var express=require("express");
var connection = require('./../config');

module.exports.register=function(req,res){
    var encryptedString = cryptr.encrypt(req.body.pw);
    var users={
        "id":req.body.id,
        "pw":encryptedString,
        "name":req.body.name,
        "email":req.body.email
    }
    var sql = 'INSERT INTO users SET ?';
   connection.query(sql, users, function (error, results, fields) {
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
    connection.end();
}
