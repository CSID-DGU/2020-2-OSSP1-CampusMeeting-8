const mysql = require('mysql');
/* const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'test'
}); */
const connection = mysql.createConnection({
  host: 'database-1.cg3niva28v4j.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'webrtc1234',
  database: 'userinfo'
});
connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected");
  } else {
    console.log(err);
    console.log("Error while connecting with database");
  }
});

module.exports = connection;
