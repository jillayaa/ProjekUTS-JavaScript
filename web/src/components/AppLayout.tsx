import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import "./AppLayout.css";

type UserRole = "owner" | "admin" | "customer";

interface AppLayoutProps {
  role: UserRole;
  title: string;
  subtitle?: string;
  children: ReactNode;
  backTo?: string;
}

const navigation = {
  owner: [
    { label: "Dashboard", path: "/owner", icon: "⌂" },
    { label: "Laporan Transaksi", path: "/owner/laporan-transaksi", icon: "▤" },
    {
      label: "Laporan Pendapatan",
      path: "/owner/laporan-pendapatan",
      icon: "▥",
    },
  ],

  admin: [
    { label: "Dashboard", path: "/admin", icon: "⌂" },
    { label: "Data Kebaya", path: "/admin/kebaya", icon: "♢" },
    { label: "Data Pelanggan", path: "/admin/pelanggan", icon: "♙" },
    { label: "Data Penyewaan", path: "/admin/penyewaan", icon: "▤" },
    { label: "Verifikasi Pembayaran", path: "/admin/pembayaran", icon: "✓" },
    { label: "Pengembalian dan Denda", path: "/admin/pengembalian", icon: "↩" },
  ],

  customer: [
    { label: "Dashboard", path: "/customer", icon: "⌂" },
    { label: "Katalog Kebaya", path: "/customer/katalog", icon: "♢" },
    { label: "Pesanan Saya", path: "/customer/pesanan", icon: "▤" },
    { label: "Status Penyewaan", path: "/customer/status", icon: "✓" },
  ],
};

export default function AppLayout({
  role,
  title,
  subtitle,
  children,
  backTo,
}: AppLayoutProps) {
  const navigate = useNavigate();

  const roleLabel = {
    owner: "Owner",
    admin: "Admin",
    customer: "Customer",
  };

  const dashboardPath = `/${role}`;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-logo">SK</div>

          <div>
            <h2>SewaKebaya</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="sidebar-heading">MENU UTAMA</div>

        <nav className="sidebar-navigation">
          {navigation[role].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === dashboardPath}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="role-indicator">
            <span className="role-dot" />
            Login sebagai {roleLabel[role]}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="app-main">
        {/* HEADER */}
        <header className="app-header">
          <div className="header-brand">
            <span className="mobile-logo">SK</span>
            <div>
              <strong>SewaKebaya</strong>
              <small>Management System</small>
            </div>
          </div>

          <div className="header-user">
            <span className="header-user-name">{roleLabel[role]}</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="app-content">
          <div className="page-heading">
            <div className="page-heading-left">
              {backTo && (
                <button
                  type="button"
                  className="back-button"
                  onClick={() => navigate(backTo)}
                >
                  ← Kembali
                </button>
              )}

              <div>
                <h1>{title}</h1>

                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>

            <div className="breadcrumb">
              <span>Beranda</span>
              <span>/</span>
              <span>{roleLabel[role]}</span>
              <span>/</span>
              <strong>{title}</strong>
            </div>
          </div>

          <div className="page-body">{children}</div>

          <footer className="app-footer">
            © {new Date().getFullYear()} SewaKebaya Management System
          </footer>
        </section>
      </main>
    </div>
  );
}
