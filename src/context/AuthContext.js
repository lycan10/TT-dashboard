import React, { createContext, useState, useContext, useEffect } from "react";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
        validateUser();
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      logout();
      return false;
    }
  };

  const logout = async () => {
    await fetch(`${process.env.REACT_APP_BASE_URL}/api/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const validateUser = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data));
      return true

    } catch (error) {
      console.error("Login error:", error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
