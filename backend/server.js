const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <h1>Orange TechBot está no ar! 🎉</h1>
    <p>Vá para /admin para acessar o painel.</p>
  `);
});

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    if (qr) {
      io.emit('qr', qr);
    }
    if (connection === 'open') {
      io.emit('status', 'Conectado ao WhatsApp!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

startWhatsApp();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});