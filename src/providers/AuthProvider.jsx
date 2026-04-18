import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  currentUser,
  getCachedUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister
} from '../lib/dofus-api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function syncUser() {
      const nextUser = await currentUser();
      if (!active) return;
      setUser(nextUser);
      setIsReady(true);
    }

    syncUser();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      async refreshUser() {
        const nextUser = await currentUser();
        setUser(nextUser);
        return nextUser;
      },
      async login(identifier, password) {
        const result = await apiLogin(identifier, password);
        if (result.ok) {
          const nextUser = await currentUser();
          setUser(nextUser);
        }
        return result;
      },
      async register(username, email, password) {
        const result = await apiRegister(username, email, password);
        if (result.ok && !result.needsEmailConfirmation) {
          const nextUser = await currentUser();
          setUser(nextUser);
        }
        return result;
      },
      async logout() {
        await apiLogout();
        setUser(null);
      }
    }),
    [isReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
