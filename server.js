require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initSocket } = require('./socket');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
