import { useEffect, useState } from 'react';
import api from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function Summary({ data, title }) {
  if (!data) return <p>No readings for this period yet. Add a reading to see your report.</p>;
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Highest: <b>{data.highest}</b> · Lowest: <b>{data.lowest}</b> · Average: <b>{data.average}</b> · Count: <b>{data.count}</b></p>
    </div>
  );
}

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [daily, setDaily] = useState(null);
  const [mtd, setMtd] = useState(null);
  const [prevMonth, setPrevMonth] = useState(null);

  const load = async () => {
    const [d, m, p] = await Promise.all([
      api.get(`/reports/daily?date=${date}`),
      api.get(`/reports/month-to-date?date=${date}`),
      api.get(`/reports/previous-month?date=${date}`),
    ]);
    setDaily(d.data.summary);
    setMtd(m.data.summary);
    setPrevMonth(p.data.summary);
  };

  useEffect(() => { load(); }, [date]);

  return (
    <div>
      <h2>Reports</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <h3>Daily — {date}</h3>
      {daily ? (
        <>
          <Summary data={daily} title="Summary" />
          <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
            <thead><tr><th>Slot</th><th>Value</th></tr></thead>
            <tbody>
              {daily.readings.map((r) => (
                <tr key={r.id}><td>{r.slot}</td><td>{r.value}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      ) : <p>No readings for this day.</p>}

      <h3>Month-to-date</h3>
      <Summary data={mtd} title="Month-to-date" />

      <h3>Previous month</h3>
      <Summary data={prevMonth} title="Previous month" />
    </div>
  );
}
