// ======= GLOBAL VARIABLES =======
let socket = null;
let token = localStorage.getItem('token') || null;
let currentUser = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const players = {}; // id -> {x, y, color, name}
const apiBase = '/api/auth';

// ======= SIMPLE UI CREATION =======
const chatBox = document.getElementById('chat');
chatBox.style.display = 'none'; // hide until logged in

// create login/register UI
const authDiv = document.createElement('div');
authDiv.style.position = 'fixed';
authDiv.style.top = '40%';
authDiv.style.left = '50%';
authDiv.style.transform = 'translate(-50%, -50%)';
authDiv.style.background = '#222';
authDiv.style.padding = '20px';
authDiv.style.borderRadius = '10px';
authDiv.style.color = '#fff';
authDiv.style.textAlign = 'center';
authDiv.innerHTML = `
  <h2>Login / Register</h2>
  <input id="email" placeholder="Email" style="width:200px;margin-bottom:6px;"/><br>
  <input id="password" type="password" placeholder="Password" style="width:200px;margin-bottom:6px;"/><br>
  <button id="btnLogin">Login</button>
  <button id="btnRegister">Register</button>
  <div id="authMsg" style="margin-top:10px;color:#0f0;"></div>
`;
document.body.appendChild(authDiv);

document.getElementById('btnLogin').onclick = async () => {
  await authAction('login');
};
document.getElementById('btnRegister').onclick = async () => {
  await authAction('register');
};

// ======= AUTH FUNCTIONS =======
async function authAction(type) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    showMsg('Please fill both fields', true);
    return;
  }

  try {
    const res = await fetch(apiBase + '/' + type, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || 'Error: ' + res.statusText, true);
      return;
    }

    if (type === 'register') {
      showMsg('Registration successful! Please login.', false);
      return;
    }

    token = data.token;
    localStorage.setItem('token', token);
    currentUser = { email };
    showMsg('Login successful! Loading game...', false);

    setTimeout(() => {
      authDiv.remove();
      chatBox.style.display = 'block';
      initGame();
    }, 500);
  } catch (err) {
    showMsg('Network error: ' + err.message, true);
  }
}

function showMsg(msg, isError) {
  const el = document.getElementById('authMsg');
  el.style.color = isError ? '#f55' : '#0f0';
  el.textContent = msg;
}

// ======= GAME INITIALIZATION =======
function initGame() {
  socket = io();

  socket.on('connect', () => {
    console.log('Connected', socket.id);
  });

  socket.on('welcome', (data) => {
    players[data.id] = { x: 400, y: 300, color: randColor(), name: currentUser.email };
  });

  socket.on('player:move', (p) => {
    if (!players[p.id]) players[p.id] = { x: p.x, y: p.y, color: randColor(), name: 'Other' };
    else { players[p.id].x = p.x; players[p.id].y = p.y; }
  });

  socket.on('player:leave', (p) => {
    delete players[p.id];
  });

  socket.on('chat', (m) => {
    const messages = document.getElementById('messages');
    const el = document.createElement('div');
    el.textContent = (m.id || 'anon') + ': ' + (m.text || '');
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  });

  setupControls();
  renderLoop();
}

// ======= PLAYER MOVEMENT =======
const local = { x: 400, y: 300, color: randColor(), name: 'You' };
players['local'] = local;

function sendMove() {
  if (socket) socket.emit('player:move', { x: local.x, y: local.y });
}

function setupControls() {
  window.addEventListener('keydown', (e) => {
    const step = 6;
    if (e.key === 'ArrowUp') local.y -= step;
    if (e.key === 'ArrowDown') local.y += step;
    if (e.key === 'ArrowLeft') local.x -= step;
    if (e.key === 'ArrowRight') local.x += step;
    sendMove();
  });

  const input = document.getElementById('input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = e.target.value;
      if (!text) return;
      socket.emit('chat', { text });
      e.target.value = '';
    }
  });
}

// ======= RENDER LOOP =======
function renderLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.keys(players).forEach(id => {
    const p = players[id];
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(p.name || id.slice(0, 6), p.x - 16, p.y - 18);
  });
  requestAnimationFrame(renderLoop);
}

function randColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// ======= AUTO-LOGIN CHECK =======
if (token) {
  // try to auto-login silently
  currentUser = { email: '(Saved Session)' };
  authDiv.remove();
  chatBox.style.display = 'block';
  initGame();
}