import { useState, useEffect } from "react";
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

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();

  /* ---------------- TIMER ---------------- */

  useEffect(() => {

    if (!showOtpPopup) return;

    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [timer, showOtpPopup]);

  /* ---------------- REGISTER ---------------- */

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

      if (!data.success) {
        showToast(data.message, "error");
        return;
      }

      showToast(data.message, "success");

      setGeneratedOtp(data.otp);
      setShowOtpPopup(true);
      setOtpSent(true);

      setTimer(60);

      setTimeout(() => {
        setShowOtpPopup(false);
      }, 60000);

    } catch {
      showToast("Server error", "error");
    }
  };

  /* ---------------- VERIFY OTP ---------------- */

  const handleVerifyOtp = async () => {

    if (!otp) {
      showToast("Enter OTP", "warning");
      return;
    }

    try {

      const data = await verifyOtp(email, otp);

      if (!data.success) {
        showToast(data.message, "error");
        return;
      }

      showToast("Account verified successfully", "success");

      navigate("/admin-login");

    } catch {
      showToast("Server error", "error");
    }
  };

  /* ---------------- RESEND OTP ---------------- */

  const handleResendOtp = async () => {

    try {

      const data = await adminRegister(username, email, password);

      if (!data.success) {
        showToast(data.message, "error");
        return;
      }

      setGeneratedOtp(data.otp);
      setShowOtpPopup(true);

      setTimer(60);

      setTimeout(() => {
        setShowOtpPopup(false);
      }, 60000);

      showToast("OTP resent successfully", "success");

    } catch {
      showToast("Server error", "error");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg">

      {showOtpPopup && (
        <div className="otp-popup">
          <p>OTP valid for {timer}s</p>
          <h2>{generatedOtp}</h2>
        </div>
      )}

      <div className="register-card fade-in">

        <div className="logo">
          <img src={logo} alt="Library Logo" className="logo-img" />
          <div className="logo-text">
            <strong>Book Nexa</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <h1 className="h">
          {otpSent ? "Verify OTP" : "Create Admin Account"}
        </h1>

        <p className="subtitle">Library Management System</p>

        {!otpSent && (
          <>
            <div className="register-field">
              <input
                type="text"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Admin Username</label>
            </div>

            <div className="register-field">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email Address</label>
            </div>

            <div className="register-field">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>

            <div className="register-field">
              <input
                type="password"
                placeholder=" "
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
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
              <input
                type="text"
                placeholder=" "
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <label>Enter OTP</label>
            </div>

            <button className="register-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>

            {timer === 0 && (
              <button
                className="register-btn resend-btn"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            )}
          </>
        )}

        <span
          className="forgot"
          onClick={() => navigate("/admin-login")}
        >
          Back to Login
        </span>

      </div>
    </div>
  );
}
