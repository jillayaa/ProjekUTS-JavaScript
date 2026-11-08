import { useState, type FormEvent } from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

import type { UserRole } from '../types/user';

function getDashboardPath(role: UserRole) {
  switch (role) {
    case 'owner':
      return '/owner';

    case 'admin':
      return '/admin';

    case 'customer':
      return '/customer';

    default:
      return '/login';
  }
}

export default function LoginPage() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  try {
    setLoading(true);
    setError('');

    const user = await login(email.trim(), password);

    navigate(
      getDashboardPath(user.role),
      { replace: true }
    );

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Login gagal'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          SK
        </div>

        <h1>Selamat Datang</h1>

        <p className="auth-subtitle">
          Login ke Sistem Penyewaan Kebaya
        </p>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>

        </form>

        <p className="auth-footer">
          Belum punya akun?{' '}
          <Link to="/register">
            Daftar Customer
          </Link>
        </p>

      </div>

    </div>
  );
}