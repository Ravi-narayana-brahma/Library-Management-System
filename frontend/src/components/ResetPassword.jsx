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

  const email = location.state?.email;

  const role = sessionStorage.getItem("FORGOT_ROLE") || "STUDENT";

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

      if (data.success === false) {
        showToast(data.message || "Reset failed", "error");
        return;
      }

      showToast(data.message || "Password reset successfully", "success");

      sessionStorage.removeItem("FORGOT_ROLE");

      navigate(
        role === "ADMIN"
          ? "/admin-login"
          : "/student-login"
      );

    } catch {

      showToast("Server error", "error");

    }
  };

  return (
    <div className="bg">
      <div className="glass-card">

        <h1 className="h">Reset Password</h1>
        <p className="subtitle">Create new password</p>

        <div className="field">
          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>New Password</label>
        </div>

        <div className="field">
          <input
            type="password"
            placeholder=" "
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <label>Confirm Password</label>
        </div>

        <button className="login-btn" onClick={resetPassword}>
          Reset Password
        </button>

      </div>
    </div>
  );
}
