import { useState } from 'react';

const SLOTS = ['Morning', 'After breakfast', 'After lunch', 'After dinner'];
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ReadingForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { reading_date: todayStr(), slot: 'Morning', value: '' }
  );
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (form.value === '' || form.value === null) {
      setErr('Please enter a glucose value.');
      return;
    }
    const num = Number(form.value);
    if (!Number.isInteger(num) || num < 40 || num > 600) {
      setErr('Value must be between 40 and 600 mg/dl.');
      return;
    }
    if (form.reading_date > todayStr()) {
      setErr('Date cannot be in the future.');
      return;
    }

    try {
      setBusy(true);
      await onSubmit({ ...form, value: num });
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save reading');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      {err && <p className="error">{err}</p>}
      <label>Date</label>
      <input type="date" max={todayStr()} value={form.reading_date}
        onChange={(e) => setForm({ ...form, reading_date: e.target.value })} />
      <label>Slot</label>
      <select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
        {SLOTS.map((s) => <option key={s}>{s}</option>)}
      </select>
      <label>Value (mg/dl)</label>
      <input type="number" value={form.value}
        onChange={(e) => setForm({ ...form, value: e.target.value })} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={busy} type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
