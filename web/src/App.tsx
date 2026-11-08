import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// Halaman autentikasi
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Dashboard
import DashboardPage from "./pages/DashboardPage";

// Halaman Customer
import KatalogPage from "./pages/KatalogPage";
import PesananPage from "./pages/customer/PesananPage";
import StatusSewaPage from "./pages/customer/StatusSewaPage";

// Halaman Admin
import KelolaKebayaPage from "./pages/admin/KelolaKebayaPage";
import VerifikasiPembayaranPage from "./pages/admin/VerifikasiPembayaranPage";
import PengembalianPage from "./pages/admin/PengembalianPage";

// Halaman Owner
import LaporanTransaksiPage from "./pages/owner/LaporanTransaksiPage";
import LaporanPendapatanPage from "./pages/owner/LaporanPendapatanPage";

import type { UserRole } from "./types/user";

// Mengarahkan pengguna berdasarkan role
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Memuat akun...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPaths: Record<UserRole, string> = {
    owner: "/owner",
    admin: "/admin",
    customer: "/customer",
  };

  return <Navigate to={dashboardPaths[user.role]} replace />;
}

function App() {
  return (
    <Routes>
      {/* =================================
          HALAMAN PUBLIK
      ================================= */}

      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* =================================
          DASHBOARD OWNER
      ================================= */}

      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Laporan transaksi */}
      <Route
        path="/owner/laporan-transaksi"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <LaporanTransaksiPage />
          </ProtectedRoute>
        }
      />

      {/* Laporan pendapatan */}
      <Route
        path="/owner/laporan-pendapatan"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <LaporanPendapatanPage />
          </ProtectedRoute>
        }
      />

      {/* =================================
          DASHBOARD ADMIN
      ================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Mengelola data kebaya */}
      <Route
        path="/admin/kebaya"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <KelolaKebayaPage />
          </ProtectedRoute>
        }
      />

      {/* Verifikasi pembayaran */}
      <Route
        path="/admin/pembayaran"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <VerifikasiPembayaranPage />
          </ProtectedRoute>
        }
      />

      {/* Pengembalian dan denda */}
      <Route
        path="/admin/pengembalian"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PengembalianPage />
          </ProtectedRoute>
        }
      />

      {/* =================================
          DASHBOARD CUSTOMER
      ================================= */}

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Katalog kebaya */}
      <Route
        path="/customer/katalog"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <KatalogPage />
          </ProtectedRoute>
        }
      />

      {/* Membuat pesanan */}
      <Route
        path="/customer/pesanan"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <PesananPage />
          </ProtectedRoute>
        }
      />

      {/* Status penyewaan */}
      <Route
        path="/customer/status"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <StatusSewaPage />
          </ProtectedRoute>
        }
      />

      {/* =================================
          HALAMAN TIDAK DITEMUKAN
      ================================= */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
