import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

export default function DashboardPage() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  if (!user) return null;

  const menus = {

    owner: [
      {
        title: 'Laporan Transaksi',
        description: 'Melihat seluruh transaksi penyewaan',
        path: '/owner/laporan-transaksi',
        icon: '▤'
      },
      {
        title: 'Laporan Pendapatan',
        description: 'Melihat pendapatan usaha',
        path: '/owner/laporan-pendapatan',
        icon: 'Rp'
      }
    ],

    admin: [
      {
        title: 'Kelola Data Kebaya',
        description: 'Tambah, edit, lihat dan hapus koleksi',
        path: '/admin/kebaya',
        icon: '♧'
      },
      {
        title: 'Verifikasi Pembayaran',
        description: 'Memeriksa bukti pembayaran Customer',
        path: '/admin/pembayaran',
        icon: '✓'
      },
      {
        title: 'Pengembalian dan Denda',
        description: 'Mengelola proses pengembalian kebaya',
        path: '/admin/pengembalian',
        icon: '↩'
      }
    ],

    customer: [
      {
        title: 'Katalog Kebaya',
        description: 'Melihat koleksi kebaya yang tersedia',
        path: '/customer/katalog',
        icon: '♧'
      },
      {
        title: 'Pesanan Saya',
        description: 'Membuat dan melihat pesanan penyewaan',
        path: '/customer/pesanan',
        icon: '▤'
      },
      {
        title: 'Status Penyewaan',
        description: 'Melihat status penyewaan saya',
        path: '/customer/status',
        icon: '✓'
      }
    ]

  };

  const roleNames = {
    owner: 'Owner',
    admin: 'Admin',
    customer: 'Customer'
  };

  const handleLogout = () => {

    logout();

    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-page">

      <header className="dashboard-navbar">

        <div className="brand">
          <div className="brand-icon">SK</div>

          <div>
            <h2>SewaKebaya</h2>
            <p>Management System</p>
          </div>
        </div>

        <div className="user-info">
          <div>
            <strong>{user.nama}</strong>

            <span>{roleNames[user.role]}</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </header>

      <main className="dashboard-container">

        <section className="welcome-section">
          <p>DASHBOARD {roleNames[user.role].toUpperCase()}</p>

          <h1>
            Selamat datang, {user.nama}
          </h1>

          <span>
            Kelola aktivitas penyewaan kebaya melalui akun kamu.
          </span>
        </section>

        <section className="dashboard-cards">

          {menus[user.role].map((menu) => (

            <Link
              to={menu.path}
              className="dashboard-card"
              key={menu.path}
            >

              <div className="dashboard-icon">
                {menu.icon}
              </div>

              <h3>{menu.title}</h3>

              <p>{menu.description}</p>

              <span className="card-link">
                Buka halaman →
              </span>

            </Link>

          ))}

        </section>

      </main>

    </div>
  );
}