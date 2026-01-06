import type { BaseEntity } from '@/lib/shared/interfaces/base';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
export interface AuthUser extends BaseEntity {
  uid: string; // Firebase Auth UID, should match id
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: {
    name:Role;
    value:string
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}


