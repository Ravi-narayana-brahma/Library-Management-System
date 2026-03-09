import { useState } from "react";
import logo from "../assets/logo.png";
import "./Auth.css";
import { showToast } from "../../public/toast";
import { useNavigate } from "react-router-dom";
import { adminLogin, whoAmI } from "../api";

export default function AdminLogin() {

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

            const data = await adminLogin(username, password); 

            if (!data.success) {
                showToast(data.message || "Login failed", "error");
                return;
            }

            showToast(data.message || "Login successful", "success");

            // 🔑 load session
            await whoAmI();  // ✅ from api.js

            setTimeout(() => {
                navigate("/admin");
            }, 200);

        } catch (err) {

            console.log(err); // helpful for debugging
        
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.response?.data ||
                "Invalid username or password";
        
            showToast(msg, "error");
        }
        }
    };

    return (
        <div className="bg">
            <div className="glass-card fade-in">
                <div className="logo">
                    <img src={logo} alt="Library Logo" className="logo-img" />
                    <div className="logo-text">
                        <strong>Book Nexa</strong>
                        <span>Admin Portal</span>
                    </div>
                </div>

                <h1 className="h">Login</h1>
                <p className="subtitle">Library Management System</p>

                <div className="field">
                    <input
                        type="text"
                        id="username"
                        placeholder=" "
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="username">Admin Username</label>
                </div>

        
                <div className="field password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                
                  <label htmlFor="password">Password</label>
                
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "🐵"}
                  </span>
                </div>
                <button className="login-btn" onClick={handleLogin}>
                    Login
                </button>

                <span
                    className="forgot"
                    onClick={() => {
                        sessionStorage.setItem("FORGOT_ROLE", "ADMIN");
                        navigate("/forgot-password");
                    }}
                >
                    Forgot password?
                </span>

                <span
                    className="register"
                    onClick={() => navigate("/admin-register")}
                >
                    Create Admin Account
                </span>
            </div>
        </div>
    );
}
