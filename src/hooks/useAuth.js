// Thin re-export so components can import a hook named useAuth (per spec).
import { useAuthContext } from '../context/AuthContext.jsx';

export function useAuth() {
  return useAuthContext();
}
