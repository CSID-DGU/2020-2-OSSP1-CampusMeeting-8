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
        res.send("<script type='text/javascript'>alert('중복된 아이디 혹은 이메일입니다.'); document.location.href='/register';</script>");
      }
      else {
        res.send("<script type='text/javascript'>alert('알 수없는 에러가 발생했습니다.'); document.location.href='/register';</script>");
      }
    } else {
      res.send("<script type='text/javascript'>alert('회원가입이 완료되었습니다. 로그인해주세요.'); document.location.href='/login';</script>");
    }
  });
}
