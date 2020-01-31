const socketio = require('socket.io-client');

const socket = socketio('http://192.168.0.166:3333', {
  autoConnect: false
});

function subscribeToNewDevelopers(subscribe) {
  socket.on('new-developer', subscribe);
}

function connect(latitude, longitude, techs) {
  socket.io.opts.query = { latitude, longitude, techs };
  socket.connect();
}

function disconnect() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export { connect, disconnect, subscribeToNewDevelopers };
