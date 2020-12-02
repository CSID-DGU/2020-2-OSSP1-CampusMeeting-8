var mysql      = require('mysql');
/* var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'test'
}); */
var connection = mysql.createConnection({
  host     : 'database-1.cg3niva28v4j.ap-northeast-2.rds.amazonaws.com',
  user     : 'admin',
  password : 'webrtc1234',
  database : 'mysql'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected");
} else {
    console.log("Error while connecting with database");
}
});

module.exports = connection;
