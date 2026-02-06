"use client";

import { createContext, useContext, useState } from "react";

interface AuthState {
  permissions: string[];
}

const AuthContext = createContext<AuthState>({
  permissions: [],
});

interface AuthProviderProps {
  children: React.ReactNode;
  initialPermissions: string[]; // Recibimos esto desde el Layout
}

export function AuthProvider({
  children,
  initialPermissions = [],
}: AuthProviderProps) {
  // Inicializamos el estado directamente con lo que nos manda el servidor
  const [permissions] = useState<string[]>(initialPermissions);

  return (
    <AuthContext.Provider
      value={{
        permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
