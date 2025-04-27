import React, { useState } from "react";
import banner from "../../assets/login.jpeg";
import logo from "../../assets/main.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HugeiconsIcon } from '@hugeicons/react';
import {EyeIcon , ViewOffSlashIcon } from '@hugeicons/core-free-icons';

import "./login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await login(loginData.username, loginData.password);
    console.log(success);
    if (success) {
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleShowPassword = () => {
    setShowPassword(prev => !prev);
  };


  return (
    <div className="login">
      <div className="login-container">
        <div className="login-words-container">
          <div className="login-logo">
            <img src={logo} alt="" />
          </div>
          <div className="login-words">
            <h3>Welcome Back 👋</h3>
            <p>
              Everything you need is just a click away. Sign in to get started.
            </p>

            <form className="custom-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ fontWeight: "700", fontSize: "15px" }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  className="input-field"
                  value={loginData.username}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: "700", fontSize: "15px" }}>
                  Password
                </label>
                <div className="input-container">
                <input
                    type={showPassword ? "text" : "password"}
                  name="password"
                  className="input-field"
                  value={loginData.password}
                  onChange={handleInputChange}
                />
                  <div className="input-eye" onClick={handleShowPassword} style={{ cursor: "pointer" }}>
                    {showPassword ? (
                      <HugeiconsIcon icon={EyeIcon} size={20} color="#545454" />
                    ) : (
                      <HugeiconsIcon icon={ViewOffSlashIcon} size={20} />
                    )}
                  </div>
                
                
                </div>
               
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <button className="form-group-button" type="submit">
                <p>Sign in</p>
              </button>
            </form>
          </div>
        </div>
        <div className="login-Image">
          <img src={banner} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Login;
