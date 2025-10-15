const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_CA_CERT } = process.env;

if (!DB_CA_CERT) {
  console.error('❌ DB_CA_CERT chưa được thiết lập trong .env');
  process.exit(1);
}

let sslOptions;
try {
  const caPath = path.resolve(DB_CA_CERT);
  const ca = fs.readFileSync(caPath, 'utf8');
  sslOptions = { rejectUnauthorized: true, ca };
  console.log('✅ SSL CA loaded from:', caPath);
} catch (err) {
  console.error('❌ Không đọc được file CA:', DB_CA_CERT, err.message);
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  port: DB_PORT || 3306,
  user: DB_USER || 'root',
  password: DB_PASSWORD,
  database: DB_NAME || 'users',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  ssl: sslOptions
});

// Kiểm tra kết nối ban đầu
pool.getConnection()
  .then(conn => {
    console.log('✅ Kết nối MySQL Aiven thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MySQL Aiven:', err.message);
  });

// Tự động tạo bảng users nếu chưa có
async function ensureUsersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(sql);
    console.log("✅ users table ready");
  } catch (err) {
    console.error("❌ Lỗi tạo bảng users:", err.message);
  }
}

ensureUsersTable();

module.exports = pool;