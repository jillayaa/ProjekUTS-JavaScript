export type UserRole = 'owner' | 'admin' | 'customer';

export interface User {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterForm {
  nama: string;
  email: string;
  no_hp: string;
  alamat: string;
  password: string;
}