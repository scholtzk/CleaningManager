export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cleaner';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'cleaner';
  phone?: string;
}
