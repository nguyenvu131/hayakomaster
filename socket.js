/*
  Socket.IO server hoàn chỉnh
  - Quản lý tất cả player
  - Gửi currentPlayers khi client mới connect
  - Thông báo newPlayer, player:move, player:leave
*/

const { Server } = require('socket.io');

function randColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
}

const players = {}; // lưu tất cả người chơi {id: {x, y, color}}

function initSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // Tạo player mới server-side
    players[socket.id] = { x: 400, y: 300, color: randColor() };

    // Gửi danh sách tất cả player cho client mới
    socket.emit('currentPlayers', players);

    // Thông báo cho người khác có player mới
    socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

    // Nhận di chuyển từ client
    socket.on('player:move', (data) => {
      if (players[socket.id]) {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
      }
      socket.broadcast.emit('player:move', { id: socket.id, x: data.x, y: data.y });
    });

    // Nhận chat từ client
    socket.on('chat', (data) => {
      io.emit('chat', { id: socket.id, text: data.text });
    });

    // Xử lý disconnect
    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
      delete players[socket.id];
      io.emit('player:leave', { id: socket.id });
    });
  });
}

module.exports = { initSocket };