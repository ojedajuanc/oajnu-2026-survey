import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth, signIn as svcSignIn, signOut as svcSignOut } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Admin = authenticated with Email/Password provider (not email link / participant)
  const isAdmin = !!user && user.providerData?.some((p) => p.providerId === 'password');

  const value = {
    user,
    isAdmin,
    loading,
    signIn: (email, pw) => svcSignIn(email, pw),
    signOut: () => svcSignOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
