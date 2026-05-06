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

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  };


  const changeUserPassword = async (user_id, password) => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        logout();
        return false;
      }
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/users/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify({ user_id, password }),
        }
      );

      if (!response.ok) {
        throw new Error("failed");
      }
      return true;
    } catch (error) {
      console.error("Password change error:", error);
      return false;
    }
  };

  const logout = async () => {
    await fetch(`${process.env.REACT_APP_BASE_URL}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
  };

  const validateUser = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        logout();
        return false;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        throw new Error("User validation failed");
      }

      const data = await response.json();
      setUser(data);
      return true;

    } catch (error) {
      console.error("User validation error:", error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, changeUserPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
