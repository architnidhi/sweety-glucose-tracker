import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Readings from './pages/Readings';
import Reports from './pages/Reports';

function Nav() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  if (!user) return null;
  return (
    <nav style={{ display: 'flex', gap: 16, padding: '8px 0', marginBottom: 16, borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ fontWeight: loc.pathname === '/' ? 'bold' : 'normal' }}>Readings</Link>
      <Link to="/reports" style={{ fontWeight: loc.pathname === '/reports' ? 'bold' : 'normal' }}>Reports</Link>
      <span style={{ marginLeft: 'auto' }}>{user.name}</span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

function Shell({ children }) {
  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <Nav />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Readings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AuthProvider>
  );
}
