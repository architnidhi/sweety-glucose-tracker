import { useEffect, useState } from 'react';
import api from '../api/client';
import ReadingForm from '../components/ReadingForm';
import { useAuth } from '../context/AuthContext';

export default function Readings() {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await api.get('/readings?limit=50');
    setItems(data.data);
  };

  useEffect(() => { load(); }, []);

  const create = async (payload) => {
    await api.post('/readings', payload);
    setShowForm(false);
    load();
  };
  const update = async (payload) => {
    await api.put(`/readings/${editing.id}`, payload);
    setEditing(null);
    load();
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this reading?')) return;
    await api.delete(`/readings/${id}`);
    load();
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Readings</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {!showForm && !editing && (
        <button onClick={() => setShowForm(true)}>+ Add reading</button>
      )}

      {showForm && <ReadingForm onSubmit={create} onCancel={() => setShowForm(false)} />}
      {editing && (
        <ReadingForm initial={editing} onSubmit={update} onCancel={() => setEditing(null)} />
      )}

      <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Date</th><th>Slot</th><th>Value</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{String(r.reading_date).slice(0, 10)}</td>
              <td>{r.slot}</td>
              <td>{r.value}</td>
              <td>
                <button onClick={() => setEditing(r)}>Edit</button>
                <button onClick={() => remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={4}>No readings yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
