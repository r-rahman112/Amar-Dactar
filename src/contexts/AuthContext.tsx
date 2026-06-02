import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fallback: load normal token session if not relying purely on Firebase
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
           const data = await res.json();
           setUser(data.user || null);
        } else {
           setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // user logged in via firebase
        setIsLoading(true);
        try {
          // Detect provider from providerData array
          const providerData = firebaseUser.providerData[0];
          let providerName = 'google';
          if (providerData) {
             if (providerData.providerId === 'facebook.com') providerName = 'facebook';
             if (providerData.providerId === 'apple.com') providerName = 'apple';
          }

          const res = await fetch('/api/users/social-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email || `${firebaseUser.uid}@${providerName}.unknown`,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              provider: providerName,
              hasAcceptedConsent: true // since they already logged in, assume consent was accepted
            })
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user || null);
          } else {
            setUser(null);
          }
        } catch (err) {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Not logged in with Firebase, fallback to JWT session check
        fetchMe();
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
    await fetch('/api/users/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
