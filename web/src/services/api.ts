import type {
  Kebaya,
  KebayaForm
} from '../types/kebaya';

import type {
  User,
  LoginResponse,
  RegisterForm
} from '../types/user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
}

// Fungsi utama untuk mengirim request
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  useAuth = true
): Promise<T> {

  const headers = new Headers(options.headers);

  const token = localStorage.getItem('token');

  if (useAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const rawText = await response.text();

  let result: ApiResponse<T>;

  try {
    result = rawText
      ? JSON.parse(rawText) as ApiResponse<T>
      : {} as ApiResponse<T>;
  } catch {
    throw new Error(
      `Response server bukan JSON yang valid (HTTP ${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `HTTP Error ${response.status}`
    );
  }

  if (result.success !== true) {
    throw new Error(
      result.message || 'Permintaan API gagal'
    );
  }

  return result.data as T;
}

// AUTHENTICATION

export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {

  return apiRequest<LoginResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password })
    },
    false
  );
};

export const registerApi = async (
  data: RegisterForm
): Promise<User> => {

  return apiRequest<User>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(data)
    },
    false
  );
};

export const getMeApi = async (): Promise<User> => {
  return apiRequest<User>('/auth/me');
};

// KEBAYA

export const getAllKebaya = async (): Promise<Kebaya[]> => {
  return apiRequest<Kebaya[]>('/kebaya');
};

export const getKebayaById = async (
  id: number
): Promise<Kebaya> => {
  return apiRequest<Kebaya>(`/kebaya/${id}`);
};

export const createKebaya = async (
  data: KebayaForm
): Promise<Kebaya> => {
  return apiRequest<Kebaya>('/kebaya', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateKebaya = async (
  id: number,
  data: Partial<KebayaForm>
): Promise<Kebaya> => {
  return apiRequest<Kebaya>(`/kebaya/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteKebaya = async (
  id: number
): Promise<void> => {
  await apiRequest<void>(`/kebaya/${id}`, {
    method: 'DELETE'
  });
};

// TIPE TRANSAKSI
export interface Penyewaan {
  id: number;
  pelanggan_id: number;
  kebaya_id: number;

  nama_pelanggan: string;
  no_hp: string;

  kode_kebaya: string;
  nama_model: string;
  ukuran: string;
  warna: string;

  tanggal_sewa: string;
  tanggal_kembali: string;
  tanggal_pengembalian_aktual: string | null;

  durasi_hari: number;
  harga_sewa_per_hari: number;
  total_harga: number;

  status: string;
  status_pembayaran: string;

  bukti_bayar: string | null;
  catatan_verifikasi: string | null;

  kondisi_pengembalian: string | null;
  denda: number;
  catatan_pengembalian: string | null;
}

// CUSTOMER: membuat pesanan
export const createPenyewaan = async (
  data: {
    kebaya_id: number;
    tanggal_sewa: string;
    tanggal_kembali: string;
  }
): Promise<Penyewaan> => {
  return apiRequest<Penyewaan>('/penyewaan', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// CUSTOMER: melihat riwayat sendiri
export const getMyPenyewaan = async (): Promise<Penyewaan[]> => {
  return apiRequest<Penyewaan[]>('/penyewaan/saya');
};

// ADMIN: melihat semua transaksi
export const getAllPenyewaan = async (): Promise<Penyewaan[]> => {
  return apiRequest<Penyewaan[]>('/penyewaan');
};

// CUSTOMER: upload bukti pembayaran
export const uploadBuktiBayar = async (
  id: number,
  file: File
): Promise<Penyewaan> => {
  const formData = new FormData();

  formData.append('bukti', file);

  return apiRequest<Penyewaan>(
    `/penyewaan/${id}/bukti-bayar`,
    {
      method: 'POST',
      body: formData
    }
  );
};

// ADMIN: verifikasi pembayaran
export const verifyPayment = async (
  id: number,
  keputusan: 'terima' | 'tolak',
  catatan: string
): Promise<Penyewaan> => {
  return apiRequest<Penyewaan>(
    `/penyewaan/${id}/verifikasi-pembayaran`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        keputusan,
        catatan
      })
    }
  );
};

// ADMIN: mulai masa sewa
export const startPenyewaan = async (
  id: number
): Promise<Penyewaan> => {
  return apiRequest<Penyewaan>(
    `/penyewaan/${id}/mulai`,
    {
      method: 'PATCH'
    }
  );
};

// ADMIN: pengembalian
export const returnPenyewaan = async (
  id: number,
  data: {
    tanggal_pengembalian_aktual: string;
    kondisi_pengembalian: 'baik' | 'rusak';
    catatan_pengembalian: string;
  }
): Promise<Penyewaan> => {
  return apiRequest<Penyewaan>(
    `/penyewaan/${id}/pengembalian`,
    {
      method: 'PATCH',
      body: JSON.stringify(data)
    }
  );
};

// Melihat file bukti dengan token autentikasi
export const getBuktiBayarBlob = async (
  id: number
): Promise<Blob> => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `/api/penyewaan/${id}/bukti-bayar/file`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || 'Gagal mengambil bukti pembayaran'
    );
  }

  return response.blob();
};

// OWNER: laporan transaksi
export const getLaporanTransaksi = async (
  dari?: string,
  sampai?: string
) => {
  const params = new URLSearchParams();

  if (dari) params.set('dari', dari);
  if (sampai) params.set('sampai', sampai);

  const suffix = params.toString()
    ? `?${params.toString()}`
    : '';

  return apiRequest<Penyewaan[]>(
    `/laporan/transaksi${suffix}`
  );
};

// OWNER: laporan pendapatan
export interface LaporanPendapatan {
  total_transaksi: number;
  total_pendapatan: number;
  total_menunggu_verifikasi: number;
  total_denda_tercatat: number;
}

export const getLaporanPendapatan = async (
  dari?: string,
  sampai?: string
): Promise<LaporanPendapatan> => {
  const params = new URLSearchParams();

  if (dari) params.set('dari', dari);
  if (sampai) params.set('sampai', sampai);

  const suffix = params.toString()
    ? `?${params.toString()}`
    : '';

  return apiRequest<LaporanPendapatan>(
    `/laporan/pendapatan${suffix}`
  );
};