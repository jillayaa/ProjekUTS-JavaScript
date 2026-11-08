import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';

import {
  loginApi,
  registerApi,
  getMeApi
} from '../services/api';

import type {
  User,
  RegisterForm
} from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<User>;

  register: (
    data: RegisterForm
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children
}: {
  children: ReactNode
}) => {

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  // Memulihkan sesi saat website dibuka kembali
  useEffect(() => {

    const checkSession = async () => {

      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getMeApi();

        setUser(currentUser);

      } catch {
        localStorage.removeItem('token');
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    void checkSession();

  }, []);

  // Login
  const login = async (
    email: string,
    password: string
): Promise<User> => {

  const result = await loginApi(email, password);

  localStorage.setItem('token', result.token);

  setUser(result.user);

  return result.user;
};

  // Registrasi Customer
  const register = async (data: RegisterForm) => {

    await registerApi(data);
  };

  // Logout
  const logout = () => {

    localStorage.removeItem('token');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan AuthContext
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth harus digunakan di dalam AuthProvider'
    );
  }

  return context;
};