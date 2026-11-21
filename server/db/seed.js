require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/db/pool');

(async () => {
  const email = 'demo@sweety.dev';
  const password = 'demo1234';
  const hash = await bcrypt.hash(password, 10);

  const user = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ('Demo User', $1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [email, hash]
  );
  const userId = user.rows[0].id;

  await pool.query('DELETE FROM readings WHERE user_id=$1', [userId]);

  const samples = [
    ['2026-10-13', 'Morning', 95],
    ['2026-10-13', 'After breakfast', 140],
    ['2026-10-14', 'Morning', 102],
    ['2026-10-14', 'After lunch', 155],
    ['2026-10-15', 'Morning', 98],
    ['2026-10-15', 'After breakfast', 132],
    ['2026-10-15', 'After lunch', 148],
    ['2026-10-15', 'After dinner', 138],
    ['2026-09-20', 'Morning', 108],
    ['2026-09-25', 'After dinner', 165],
  ];
  for (const [d, s, v] of samples) {
    await pool.query(
      'INSERT INTO readings (user_id, reading_date, slot, value) VALUES ($1,$2,$3,$4)',
      [userId, d, s, v]
    );
  }
  console.log(`Seeded demo user: ${email} / ${password}`);
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
