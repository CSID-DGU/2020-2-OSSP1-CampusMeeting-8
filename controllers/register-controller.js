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
      res.json({
        status: false,
        message: 'there are some error with query'
      })
    } else {
      res.json({
        status: true,
        data: results,
        message: 'user registered sucessfully'
      })
    }
  });
  connection.end();
}
