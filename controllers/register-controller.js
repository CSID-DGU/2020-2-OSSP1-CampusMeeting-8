const connection = require('./../config');

module.exports.register = function (req, res) {
  const encryptedString = cryptr.encrypt(req.body.pw);
  const users = {
    "id": req.body.id,
    "pw": encryptedString,
    "name": req.body.name,
    "email": req.body.email,
    "phone": req.body.phone,
    "bdate": req.body.bdate
  }
  const sql = 'INSERT INTO users SET ?';
  connection.query(sql, users, function (error, results, fields) {
    console.log(error);
    if (error) {
      if(error.errno==1062){
        res.send("<script type='text/javascript'>alert('중복된 아이디입니다. 새로고침(F5) 후 다시 해주세요')</script>");
      }
      else {
        res.send("<script type='text/javascript'>alert('에러가 발생했습니다. 새로고침(F5) 후 다시 해주세요')</script>");
      }
    } else {
      res.redirect("/login");
    }
  });
  connection.end();
}
