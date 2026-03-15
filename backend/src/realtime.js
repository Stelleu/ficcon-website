import supabase from './config/db.js';
import { WebSocketServer } from 'ws';

// WebSocket server partagé
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}

// Abonnement Supabase Realtime sur les inscriptions masterclass
supabase
  .channel('masterclass-registrations')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'masterclass_registrations'
    },
    (payload) => {
      console.log('Changement masterclass_registrations', payload);
      // On notifie tous les front qu’il faut rafraîchir les données masterclass
      broadcast({ type: 'masterclass_update' });
    }
  )
  .subscribe();

export { wss };

