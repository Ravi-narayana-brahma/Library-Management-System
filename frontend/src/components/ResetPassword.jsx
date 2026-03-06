import { useState, useEffect } from "react";
import { showToast } from "../../public/toast";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import { resetPassword as resetPasswordApi } from "../api";

export default function ResetPassword() {

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from VerifyOtp
  const email = location.state?.email;

  // Prevent direct access
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const resetPassword = async () => {
    if (!password || !confirm) {
      showToast("All fields required", "warning");
      return;
    }

    if (password !== confirm) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const data = await resetPasswordApi(email, password);

      if (!data.success) {
        showToast(data.message, "error");
        return;
      }

      showToast(data.message, "success");
      navigate("/admin-login");

    } catch {
      showToast("Server error", "error");
    }
  };

  return (
    <div className="bg">
      <div className="glass-card">
        <h1 className="h">Reset Password</h1>
        <p className="subtitle">Create new password</p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button className="login-btn" onClick={resetPassword}>
          Reset Password
        </button>
      </div>
    </div>
  );
}
