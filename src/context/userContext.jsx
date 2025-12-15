import { createContext, useContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [theme, setTheme] = useState({ mode: "dark" });

  // Automatically update body background on theme change
  useEffect(() => {
    document.body.style.backgroundColor =
      theme.mode === "light" ? "#fff" : "#212121";
  }, [theme.mode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === "light" ? "dark" : "light",
    }));
  };

  // Update user info after login
  const updateUser = (newUserData) => {
    setUser(prev => ({
      ...prev,
      ...newUserData,
    }));
  };

  const value = { user, updateUser, theme, toggleTheme };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
