var app = require('express')(); //function that bundles together everything in express
var http = require('http').Server(app); //whenever you're using server, you're using http
var io = require('socket.io')(http);// socket io listen to the http object
var redis = require('redis');
var client = redis.createClient();
var messages = [];
var storeMessage = function(name, data){
  messages.push({name: name, data: data});
  if (messages.length > 10){
    messages.shift();
  }
};

app.get('/', function(req, res){
  res.sendfile('index.html'); //what we want the client to get
});

io.on('connection', function(socket){ // the connection event. we look for the name of the event on the client side
  //and we have the same name on the server side
  console.log('a user connected'); //io connection
  socket.on('join', function(name) {
    messages.forEach(function(message){
      client.emit("messages", message.name + ":" + message.data);
      storeMessage(name, message);
    });
    socket.username = name;
    socket.on('chat message', function(msg){
      var username = socket.username;
      io.emit('chat message', username + ': ' + msg);
      console.log(username , msg);
      // io.emit('chat message', msg);// sending it to all the other sockets

    // var username = socket.username;
  });  //we can print out the chat message event!
  });

  socket.on('disconnect', function(){
    console.log('user disconnected'); // disconnection event!
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000'); //listening to port 3000
});