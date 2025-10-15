Node.js + MySQL (Aiven SSL) + Socket.IO + LayaAir sample
=====================================================

What's included
- Express server (server.js)
- MySQL connection using mysql2 with SSL (db.js)
- Basic auth routes (routes/auth.js) using bcrypt and JWT
- Socket.IO integration (socket.js) for realtime
- Simple LayaAir-compatible client sample (public/index.html + public/game.js)
- .env.example and instructions

Quick start (after downloading and extracting)
1. Copy `.env.example` to `.env` and fill in your Aiven MySQL credentials and JWT secret.
2. Place Aiven CA certificate at `certs/ca.pem` (Aiven provides a CA .pem file).
3. On your machine run:
   npm install
   npm start
4. Open `public/index.html` in a browser (or serve it). The client connects to the server via Socket.IO.

Notes about Aiven SSL
- Aiven MySQL requires TLS/SSL. Provide the CA cert path in `DB_CA_CERT`.
- The MySQL connection in `db.js` reads the CA file and passes it via the `ssl` option.

Security
- This sample is for development / demo only. Do not use as-is in production.
- Make sure to keep your `.env` secret and never commit it.

