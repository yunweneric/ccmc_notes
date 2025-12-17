import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/shared/firebase/config';
import type {  LoginCredentials, AuthUser } from '../interfaces';
import { Role } from '../interfaces/auth';
import { db } from '@/lib/shared/firebase/config';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<{ data: AuthUser | null; error: string | null }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      //Find the user information from the database
      const user:AuthUser | null = await this.getUserByUid(userCredential.user.uid);
      if (!user) {
        return {
          data: null,
          error: 'User not found',
        };
      }

      return {
        data: user,
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
  async getUserByUid(uid: string): Promise<AuthUser | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      return userData as AuthUser;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
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

