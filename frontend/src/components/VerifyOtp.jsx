import { useState, useEffect, useRef } from "react";
import { showToast } from "../../public/toast";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import { verifyOtpApi, forgotPassword } from "../api";

export default function VerifyOtp() {

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  /* 🚫 Prevent direct access */
  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  /* ⏱ Timer */
  useEffect(() => {

    if (timer <= 0) return;

    const t = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(t);

  }, [timer]);

  /* 🔢 Handle input change */
  const handleChange = (value, index) => {

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  /* ⬅ Backspace navigation */
  const handleKeyDown = (e, index) => {

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  /* 📋 Paste OTP */
  const handlePaste = (e) => {

    const pasted = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted.split("");
    setOtp(newOtp);

    newOtp.forEach((num, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = num;
      }
    });
  };

  /* ✅ VERIFY OTP */
  const verifyOtp = async () => {

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      showToast("Enter complete 6-digit OTP", "warning");
      return;
    }

    try {

      const data = await verifyOtpApi(email, finalOtp);

      if (!data.success) {
        showToast(data.message || "Invalid OTP", "error");
        return;
      }

      showToast(data.message || "OTP verified successfully", "success");

      navigate("/reset-password", { state: { email } });

    } catch {
      showToast("Server error", "error");
    }
  };

  /* 🔁 RESEND OTP */
  const resendOtp = async () => {

    if (resending) return;

    setResending(true);

    try {

      const data = await forgotPassword(email);

      if (!data.success) {
        showToast(data.message || "Failed to resend OTP", "error");
        return;
      }

      showToast("OTP resent successfully", "success");

      setOtp(Array(6).fill(""));
      setTimer(30);

      // clear inputs
      inputsRef.current.forEach(input => {
        if (input) input.value = "";
      });

      inputsRef.current[0]?.focus();

    } catch {

      showToast("Server error", "error");

    } finally {

      setResending(false);

    }
  };

  return (
    <div className="bg">
      <div className="glass-card">

        <h1 className="h">Verify OTP</h1>
        <p className="subtitle">Enter the 6-digit OTP</p>

        <div className="otp-box" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputsRef.current[i] = el)}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <button className="login-btn" onClick={verifyOtp}>
          Verify OTP
        </button>

        <div className="otp-resend">

          {timer > 0 ? (
            <span>Resend OTP in {timer}s</span>
          ) : (
            <button
              className="resend-btn"
              onClick={resendOtp}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
