import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await signup(form.name, form.email, form.password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <h2>Sign up</h2>
      {err && <p className="error">{err}</p>}
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Sign up</button>
      <p>Have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
}
