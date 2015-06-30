var http = require("http");
var fs = require('fs');
var url = require('url');
var io = require('../node_modules/socket.io');

var server = http.createServer(function(request, response){
  
  var path = url.parse(request.url).pathname;

  switch(path){

    case '/':
      fs.readFile('client.html', function(error, data){
        if (error)
        {
          response.writeHead(404);
          response.end("opps this doesn't exist - 404");
        }
        else
        {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.end(data.toString());
        }
      });
      break;

    default:
      response.writeHead(404);
      response.end("opps this doesn't exist - 404");
      break;
  }
});

server.listen(8000);

io = io.listen(server);

io.on('connection', function(socket){
  
  console.log("New Client: "+socket.handshake.headers['user-agent']);
  
  fs.readFile('log.txt', function(error, data){
    if(error)
      socket.emit('message', {message: 'Error while reading file!'});
    else
    {
      arr = data.toString().split('\n');
      prevlines = arr.length;
      socket.emit('message', {message: arr.join('<br>')+'<br>'});
    }
  });
  
  var work = false;
  fs.watch('log.txt', function(event, filename) {
    if(work)
    {
      console.log('log file updated...');
      fs.readFile('log.txt', function(error, data){
        arr = data.toString().split('\n');
        update = "";
        for(var i = prevlines; i < arr.length; i++)
          update += arr[i] + '<br>';
        prevlines = arr.length;
        if(error)
          io.sockets.emit('update-message', {message: 'Error while reading file!'});
        else
          io.sockets.emit('update-message', {message: update});
      })
    }
    work = !work;
  });

});
