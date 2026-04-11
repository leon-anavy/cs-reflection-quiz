const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const questionsRouter = require('./routes/questions');
const sessionsRouter = require('./routes/sessions');
const exportRouter = require('./routes/export');
const registerHandlers = require('./socket/handlers');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Ensure sessions directory exists
const sessionsDir = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'sessions')
  : path.join(__dirname, 'data', 'sessions');
fs.mkdirSync(sessionsDir, { recursive: true });

// Routes
app.use('/api/questions', questionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/export', exportRouter);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Socket.io
registerHandlers(io);

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, httpServer, io };
