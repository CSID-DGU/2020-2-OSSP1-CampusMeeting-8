var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');

var connection = require('./../config');
module.exports.auth=function(req,res){
    var id=req.body.id;
    var password=req.body.password;


    connection.query('SELECT * FROM users WHERE id = ?',[id], function (error, results, fields) {
      if (error) {
          res.json({
            status:false,
            message:'there are some error with query'
            })
      }else{

        if(results.length >0){
  decryptedString = cryptr.decrypt(results[0].password);
            if(password==decryptedString){
                res.json({
                    status:true,
                    message:'successfully authenticated'
                })
            }else{
                res.json({
                  status:false,
                  message:"Id and password does not match"
                 });
            }

        }
        else{
          res.json({
              status:false,
            message:"Id does not exits"
          });
        }
      }
    });
}
