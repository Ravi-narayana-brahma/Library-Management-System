import { useState } from "react";
import "../Auth.css";
import logo from "../../assets/logo.png";
import { showToast } from "../../../public/toast";
import { useNavigate } from "react-router-dom";

import { studentLogin, getCurrentUser } from "../../api";

export default function StudentLogin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!username || !password) {
      showToast("Please fill all fields", "warning");
      return;
    }

    try {

      const data = await studentLogin(username, password);

      if (!data.success) {

        showToast(data.message || "Login failed", "error");
        return;

      }

      showToast(data.message || "Login successful", "success");

      // load session
      await getCurrentUser();

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 300);

    } catch (err) {

      showToast("Server error", "error");

    }

  };

  return (

    <div className="bg">

      <div className="glass-card">

        {/* LOGO */}
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


        <h1 className="h">
          Student Login
        </h1>

        <p className="subtitle">
          Library Management System
        </p>


        {/* USERNAME */}
        <div className="field">

          <input
            type="text"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>
            Student ID / Roll Number
          </label>

        </div>


        {/* PASSWORD */}
        <div className="field">

          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>
            Password
          </label>

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
