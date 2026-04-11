const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

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
  const { connect } = require('./data/db');
  connect()
    .then(async () => {
      const { readQuestions, writeQuestions } = require('./data/store');
      const questions = await readQuestions();
      if (questions.length === 0) {
        const defaultQuestions = require('./data/questions.json');
        await writeQuestions(defaultQuestions);
        console.log('Seeded default questions');
      }
      httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}

module.exports = { app, httpServer, io };
