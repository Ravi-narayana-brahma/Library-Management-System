import { useState } from "react";
import "../Auth.css";
import logo from "../../assets/logo.png";
import { showToast } from "../../../public/toast";
import { useNavigate } from "react-router-dom";

import { studentLogin } from "../../api";

export default function StudentLogin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!username || !password) {
      showToast("Please fill all fields", "warning");
      return;
    }

    try {

      await studentLogin(username, password);

      showToast("Login successful", "success");

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 300);

    } catch (err) {

      showToast(err.message || "Login failed", "error");

    }

  };

  return (

    <div className="bg">

      <div className="glass-card">

        <div className="logo">

          <img
            src={logo}
            alt="Library Logo"
            className="logo-img"
          />

          <div className="logo-text">
            <strong>Book Nexa</strong>
            <span>Student Portal</span>
          </div>

        </div>

        <h1 className="h">Student Login</h1>

        <p className="subtitle">
          Library Management System
        </p>

        <div className="field">

          <input
            type="text"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Student ID / Roll Number</label>

        </div>

        <div className="field password-field">
        
          <input
            type={showPassword ? "text" : "password"}
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        
          <label>Password</label>
        
          <span
            className="toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "🐵"}
          </span>
        
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          Login
        </button>

      </div>

    </div>

  );
}
