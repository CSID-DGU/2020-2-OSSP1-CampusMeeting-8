var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
var app = require('../app.js');
var connection = require('./../config');
module.exports.auth=function(req,res){
    var id=req.body.id;
    var pw=req.body.pw;


    connection.query('SELECT * FROM users WHERE id = ?',[id], function (error, results, fields) {
      if (error) {
          res.json({
            status:false,
            message:'there are some error with query'
            })
      }else{

        if(results.length >0){
          decryptedString = cryptr.decrypt(results[0].pw);
            if(pw==decryptedString){
              console.log("login");
              req.session.user={
                id: id,
                pw: pw,
                authorized: true
              };
              console.log(req.session.user.id);
                res.redirect("/main");
            }else{

              res.send('<script type="text/javascript">alert("아이디와 비밀번호를 확인해주세요"); document.location.href="/login"; </script>');

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
