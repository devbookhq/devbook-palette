import { AuthError } from './authError';
import { AuthState } from './authState';
import { User } from './user';

export type AuthInfo = { user?: User, error?: AuthError, state: AuthState };
