'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing username
    const stored = localStorage.getItem('koetori_username');
    if (stored) {
      setUsernameState(stored.toLowerCase());
    }
    setIsLoading(false);
  }, []);

  const setUsername = (newUsername: string) => {
    const normalizedUsername = newUsername.toLowerCase().trim();
    localStorage.setItem('koetori_username', normalizedUsername);
    setUsernameState(normalizedUsername);
  };

  return (
    <UserContext.Provider value={{ username, setUsername, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}