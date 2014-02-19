var http = require('http'),
	fs = require('fs'),
	// NEVER use a Sync function except at start-up!
	index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

userList = []
idList = []
// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
	socket.emit('connected', {message: 'Welcome!',  list: userList});
	socket.on('message', function(data){
		console.log(data);
		sendMessage(socket, data.id, data.message);
	});
	socket.on('register', function(data){
		for (var i = 0; i < userList.length; i++) {
			if(userList[i] == data.nick){
				socket.emit('error', {message: 'Already Exists!!!'});
				return;
			}
		};
		userList.push(data.nick);
		idList.push(data.id);

		socket.emit('added');
		sendMessage(socket, data.id, data.nick + " joined chat");
		socket.broadcast.emit('updateList', {list: userList});
		socket.emit('updateList', {list: userList});
	})
});

var sendMessage = function(socket, id, message){
	var nick = '';
	for (var i = 0; i < idList.length; i++) {
		if(idList[i] == id){
			nick = userList[i];
		}
	};
	socket.broadcast.emit('out', {'message': message, 'nick': nick});
	socket.emit('out', {'message': message, 'nick': nick});
}
app.listen(3000, '0.0.0.0');