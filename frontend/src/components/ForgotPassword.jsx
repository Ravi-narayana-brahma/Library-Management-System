import { useState } from "react";
import { showToast } from "../../public/toast";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { forgotPassword } from "../api";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const role = sessionStorage.getItem("FORGOT_ROLE") || "STUDENT";

  const sendOtp = async () => {

    if (!email) {
      showToast("Please enter your email", "warning");
      return;
    }

    if (!email.includes("@")) {
      showToast("Enter valid email address", "error");
      return;
    }

    try {

      const data = await forgotPassword(email);

      if (data.success === false) {
        showToast(data.message || "Failed to send OTP", "error");
        return;
      }

      showToast(data.message || "OTP sent successfully", "success");

      navigate("/verify-otp", {
        state: { email }
      });

    } catch {

      showToast("Server error. Try again.", "error");

    }
  };

  const goBack = () => {

    sessionStorage.removeItem("FORGOT_ROLE");

    navigate(
      role === "ADMIN"
        ? "/admin-login"
        : "/student-login"
    );
  };

  return (
    <div className="bg">
      <div className="glass-card">

        <h1 className="h">Forgot Password</h1>
        <p className="subtitle">Reset using OTP</p>

        <div className="field">
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>

        <button className="login-btn" onClick={sendOtp}>
          Send OTP
        </button>

        <span className="forgot" onClick={goBack}>
          Back to Login
        </span>

      </div>
    </div>
  );
}
