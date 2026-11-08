import {
  useState,
  type FormEvent
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {

  const { register } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    try {

      setError('');

      if (form.password.length < 8) {
        setError('Password minimal 8 karakter');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Konfirmasi password tidak sama');
        return;
      }

      setLoading(true);

      await register({
        nama: form.nama,
        email: form.email,
        no_hp: form.no_hp,
        alamat: form.alamat,
        password: form.password
      });

      alert('Registrasi berhasil. Silakan login.');

      navigate('/login', { replace: true });

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Registrasi gagal'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card register-card">

        <div className="auth-logo">
          SK
        </div>

        <h1>Buat Akun Customer</h1>

        <p className="auth-subtitle">
          Daftar untuk mulai menyewa kebaya.
        </p>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Nama Lengkap</label>

            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama lengkap"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email aktif"
              required
            />
          </div>

          <div className="form-group">
            <label>Nomor HP</label>

            <input
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          <div className="form-group">
            <label>Alamat</label>

            <input
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              placeholder="Alamat tempat tinggal"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              required
            />
          </div>

          <div className="form-group">
            <label>Konfirmasi Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>

        </form>

        <p className="auth-footer">
          Sudah punya akun?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}