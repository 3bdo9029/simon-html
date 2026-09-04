const { WebSocketServer } = require('ws');

// Attaches a WebSocket server to the HTTP server on the /ws path and
// returns a broadcast function that sends an event to every client.
function peerProxy(httpServer) {
  const socketServer = new WebSocketServer({ server: httpServer, path: '/ws' });

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;
    socket.on('pong', () => {
      socket.isAlive = true;
    });
  });

  // Drop dead connections every 10 seconds
  setInterval(() => {
    socketServer.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 10000);

  function broadcast(event) {
    const message = JSON.stringify(event);
    socketServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  return { broadcast };
}

module.exports = { peerProxy };
