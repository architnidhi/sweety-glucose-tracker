const pool = require('../db/pool');

function summarize(rows) {
  if (!rows.length) return null;
  const values = rows.map((r) => r.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Math.round(avg * 10) / 10,
    count: values.length,
    readings: rows,
  };
}

async function fetchRange(userId, from, to) {
  const r = await pool.query(
    `SELECT id, reading_date, slot, value
       FROM readings
      WHERE user_id=$1 AND reading_date BETWEEN $2 AND $3
      ORDER BY reading_date ASC, id ASC`,
    [userId, from, to]
  );
  return r.rows;
}

exports.daily = async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Query param "date" required (YYYY-MM-DD).' });
  const rows = await fetchRange(req.user.id, date, date);
  res.json({ range: { from: date, to: date }, summary: summarize(rows) });
};

exports.monthToDate = async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Query param "date" required (YYYY-MM-DD).' });
  const d = new Date(date + 'T00:00:00Z');
  const first = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const rows = await fetchRange(req.user.id, first, date);
  res.json({ range: { from: first, to: date }, summary: summarize(rows) });
};

exports.previousMonth = async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Query param "date" required (YYYY-MM-DD).' });

  const d = new Date(date + 'T00:00:00Z');
  const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 0));

  const fmt = (x) => x.toISOString().slice(0, 10);
  const from = fmt(first);
  const to = fmt(last);

  const rows = await fetchRange(req.user.id, from, to);
  res.json({ range: { from, to }, summary: summarize(rows) });
};
