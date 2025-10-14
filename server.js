const express = require('express');
const pool = require('./db');
const app = express();
const cors = require('cors')
const PORT = 3000;

app.use(express.json());

// Kiểm tra server
app.get('/', (req, res) => {
  res.send('Server Node.js + Aiven PostgreSQL đang chạy!');
});

// Lấy danh sách user
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// Thêm user
app.post('/users', async (req, res) => {
  const { name, age } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, age) VALUES ($1, $2) RETURNING *',
      [name, age]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể thêm user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
