import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("jpcs_user");
    if (stored) { try { setUser(JSON.parse(stored)); } catch (_) {} }
    setLoading(false);
  }, []);
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("jpcs_user", JSON.stringify(userData));
    if (token) localStorage.setItem("jpcs_token", token);
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("jpcs_user");
    localStorage.removeItem("jpcs_token");
    localStorage.removeItem("jpcs_shoppinglist");
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === "admin", isLogged: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
