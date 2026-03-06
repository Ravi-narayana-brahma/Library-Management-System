import { useState } from "react";
import { showToast } from "../../public/toast";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Auth.css";
import { adminRegister, verifyOtp } from "../api";


export default function AdminRegister() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirm) {
      showToast("All fields are required", "warning");
      return;
    }
    if (!email.includes("@")) {
      showToast("Enter valid email address", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const data = await adminRegister(username, email, password);
      if (!data.success) return showToast(data.message, "error");

      showToast(data.message, "success");
      setOtpSent(true);
    } catch {
      showToast("Server error", "error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Enter OTP", "warning");

    try {
      const data = await verifyOtp(email, otp);
      if (!data.success) return showToast(data.message, "error");
      showToast("Account verified successfully", "success");
      navigate("/admin-login");
    } catch {
      showToast("Server error", "error");
    }
  };

  return (
    <div className="bg">
      <div className="register-card fade-in">

        <div className="logo">
          <img src={logo} alt="Library Logo" className="logo-img" />
          <div className="logo-text">
            <strong>Book Nexa</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <h1 className="h">{otpSent ? "Verify OTP" : "Create Admin Account"}</h1>
        <p className="subtitle">Library Management System</p>

        {!otpSent && (
          <>
            <div className="register-field">
              <input type="text" placeholder=" " value={username}
                onChange={(e) => setUsername(e.target.value)} required />
              <label>Admin Username</label>
            </div>

            <div className="register-field">
              <input type="email" placeholder=" " value={email}
                onChange={(e) => setEmail(e.target.value)} required />
              <label>Email Address</label>
            </div>

            <div className="register-field">
              <input type="password" placeholder=" " value={password}
                onChange={(e) => setPassword(e.target.value)} required />
              <label>Password</label>
            </div>

            <div className="register-field">
              <input type="password" placeholder=" " value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required />
              <label>Confirm Password</label>
            </div>

            <button className="register-btn" onClick={handleRegister}>
              Create Account
            </button>
          </>
        )}

        {otpSent && (
          <>
            <div className="register-field">
              <input type="text" placeholder=" " value={otp}
                onChange={(e) => setOtp(e.target.value)} required />
              <label>Enter OTP</label>
            </div>

            <button className="register-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        <span className="forgot" onClick={() => navigate("/admin-login")}>
          Back to Login
        </span>

      </div>
    </div>
  );
}