require('dotenv').config();
const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('✅ Kết nối MySQL Aiven thành công, thời gian server:', rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL Aiven:', err.message);
    process.exit(1);
  }
}

testConnection();