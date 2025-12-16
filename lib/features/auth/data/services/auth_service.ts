import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/shared/firebase/config';
import type { User, LoginCredentials } from '../interfaces';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<{ data: User | null; error: string | null }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return {
        data: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        },
        error: null,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        data: null,
        error: this.getUserFriendlyError(errorMessage),
      };
    }
  }

  async logout(): Promise<{ error: string | null }> {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        error: errorMessage,
      };
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, callback);
  }

  private getUserFriendlyError(errorMessage: string): string {
    if (errorMessage.includes('auth/invalid-email')) {
      return 'Invalid email address';
    }
    if (errorMessage.includes('auth/user-disabled')) {
      return 'This account has been disabled';
    }
    if (errorMessage.includes('auth/user-not-found')) {
      return 'No account found with this email';
    }
    if (errorMessage.includes('auth/wrong-password')) {
      return 'Incorrect password';
    }
    if (errorMessage.includes('auth/invalid-credential')) {
      return 'Invalid email or password';
    }
    if (errorMessage.includes('auth/network-request-failed')) {
      return 'Network error. Please check your connection';
    }
    if (errorMessage.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Please try again later';
    }
    return 'An error occurred during login. Please try again';
  }
}

export const authService = new AuthService();

