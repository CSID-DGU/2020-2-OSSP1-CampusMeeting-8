const express = require('express');
const socket = require('socket.io');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = socket(server);

app.use(express.static('public'));

app.get('/', function(request, response) {
  fs.readFile('public/chat.html',function(err, data) {
    if(err) {
      response.send('Error')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  });
});

io.sockets.on('connection', function(socket) {

  socket.on('newUser', function(name) {
    console.log(name + ' in')
    socket.name = name
    var message = socket.name + '님이 접속했습니다.';
    io.sockets.emit('update', {
      name : 'SERVER',
      message : message
    });
  });

  socket.on('message', function(data) { 
    data.name = socket.name
    socket.broadcast.emit('update', data);
  });

  socket.on('disconnect', function() {
    console.log(socket.name + ' out')
    var message = socket.name + '님이 퇴장했습니다.';
    sockets.broadcast.emit('update', {
      name : 'SERVER',
      message : message
    });
  });
});

server.listen(3000, function() {
  console.log('Success')
});
