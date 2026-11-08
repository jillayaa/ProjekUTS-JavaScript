export type KondisiKebaya = 'baik' | 'perawatan' | 'rusak';

export interface Kebaya {
  id: number;
  kode_kebaya: string;
  nama_model: string;
  ukuran: string;
  warna: string;
  harga_sewa_per_hari: number;
  kondisi: KondisiKebaya;
  keterangan: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KebayaForm {
  kode_kebaya: string;
  nama_model: string;
  ukuran: string;
  warna: string;
  harga_sewa_per_hari: number;
  kondisi: KondisiKebaya;
  keterangan: string | null;
}