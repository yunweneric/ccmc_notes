// Data layer exports
export type { User, LoginCredentials, AuthState } from './data/interfaces';
export { mapFirebaseUser } from './data/interfaces';
export { AuthService, authService } from './data/services';

// Hooks exports
export { useAuth } from './hooks';

// Presentation layer exports
export { AuthProvider, useAuthContext, AuthGuard } from './presentation/components';
export { LoginForm } from './presentation/components';
export { LoginPage } from './presentation/pages/login_page';

