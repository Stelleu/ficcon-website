import http from 'http';
import app from './app.js';
import { wss } from './realtime.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`FICCON backend en écoute sur http://localhost:${PORT}`);
});

