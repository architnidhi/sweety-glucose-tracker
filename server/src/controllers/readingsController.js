const pool = require('../db/pool');

const SLOTS = ['Morning', 'After breakfast', 'After lunch', 'After dinner'];

function validateReading({ reading_date, slot, value }) {
  if (value === undefined || value === null || value === '')
    return 'Please enter a glucose value.';
  const num = Number(value);
  if (!Number.isInteger(num) || num < 40 || num > 600)
    return 'Value must be between 40 and 600 mg/dl.';
  if (!SLOTS.includes(slot)) return 'Invalid slot.';
  if (!reading_date || !/^\d{4}-\d{2}-\d{2}$/.test(reading_date))
    return 'Invalid date format (YYYY-MM-DD).';

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  if (reading_date > todayStr) return 'Date cannot be in the future.';
  return null;
}

exports.list = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const total = await pool.query(
      'SELECT COUNT(*)::int AS count FROM readings WHERE user_id = $1',
      [req.user.id]
    );
    const rows = await pool.query(
      `SELECT id, reading_date, slot, value
         FROM readings
        WHERE user_id = $1
        ORDER BY reading_date DESC, id DESC
        LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json({ data: rows.rows, page, limit, total: total.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { reading_date, slot, value } = req.body || {};
  const err = validateReading({ reading_date, slot, value });
  if (err) return res.status(400).json({ error: err });

  try {
    const dayCount = await pool.query(
      'SELECT COUNT(*)::int AS c FROM readings WHERE user_id=$1 AND reading_date=$2',
      [req.user.id, reading_date]
    );
    if (dayCount.rows[0].c >= 4)
      return res.status(400).json({ error: 'You can add only 4 readings per day.' });

    const dup = await pool.query(
      'SELECT id FROM readings WHERE user_id=$1 AND reading_date=$2 AND slot=$3',
      [req.user.id, reading_date, slot]
    );
    if (dup.rowCount)
      return res.status(400).json({ error: `You already have an ${slot} reading for this date.` });

    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1,$2,$3,$4) RETURNING id, reading_date, slot, value`,
      [req.user.id, reading_date, slot, Number(value)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505')
      return res.status(400).json({ error: 'Duplicate reading for this slot and date.' });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { reading_date, slot, value } = req.body || {};
  const err = validateReading({ reading_date, slot, value });
  if (err) return res.status(400).json({ error: err });

  try {
    const existing = await pool.query(
      'SELECT id FROM readings WHERE id=$1 AND user_id=$2',
      [id, req.user.id]
    );
    if (!existing.rowCount) return res.status(404).json({ error: 'Reading not found.' });

    const dup = await pool.query(
      'SELECT id FROM readings WHERE user_id=$1 AND reading_date=$2 AND slot=$3 AND id<>$4',
      [req.user.id, reading_date, slot, id]
    );
    if (dup.rowCount)
      return res.status(400).json({ error: `You already have an ${slot} reading for this date.` });

    const result = await pool.query(
      `UPDATE readings SET reading_date=$1, slot=$2, value=$3
        WHERE id=$4 AND user_id=$5
        RETURNING id, reading_date, slot, value`,
      [reading_date, slot, Number(value), id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM readings WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Reading not found.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
