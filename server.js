// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var url = require('url');
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);


function requestHandler(req, res) {
	console.log("Got a request: " + req);

	var requestURL = url.parse(req.url);
	fs.readFile(__dirname + requestURL.pathname,
		function (err, fileContents) {
			// if there is an error
			if (err) {
				res.writeHead(404);
				return res.end('Error loading ' + requestURL.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.write(fileContents);
			res.end();
  		}
	);
}


// WebSocket Portion
// WebSockets work with the HTTP server
//Console logs here show up on server!
var io = require('socket.io').listen(httpServer);
var connectedSockets = [];
// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

		// Add to the connectedSockets Array
		connectedSockets.push(socket);
		
		socket.on('peer_id', function(data) {
			console.log("Received: 'peer_id' " + data);

			// We can save this in the socket object if we like
			socket.peer_id = data;
			console.log("Saved: " + socket.peer_id);

			// We can loop through these if we like
			for (var i  = 0; i < connectedSockets.length; i++) {
				console.log("loop: " + i + " " + connectedSockets[i].peer_id);
			}
			
			// Tell everyone my peer_id
			socket.broadcast.emit('peer_id',data);
		});
		
			socket.on('headmoves', function(points) {
			
			socket.broadcast.emit('headmoves', points);
		});

			socket.on('coordinates', function(cords){
				socket.broadcast.emit('coordinates', cords);
			})
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
			var indexToRemove = connectedSockets.indexOf(socket);
			connectedSockets.splice(indexToRemove, 1); // Remove 1 from position, indexToRemove
		});
	}
);

