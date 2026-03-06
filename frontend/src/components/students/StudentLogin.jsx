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

            showToast(data.message, "success");

            await getCurrentUser();
            setTimeout(() => {
                navigate("/student");
            }, 200);

        } catch {
            showToast("Server error", "error");
        }
    };

    return (
        <div className="bg">
            <div className="glass-card">
                <div className="logo">
                    <img src={logo} alt="Library Logo" className="logo-img" />
                    <div className="logo-text">
                        <strong>Book Nexa</strong>
                        <span>Studenet Portal</span>
                    </div>
                </div>

                <h1 className="h">Student Login</h1>
                <p className="subtitle">Library Management System</p>

                {/* 🔥 SAME INPUT DESIGN AS ADMIN */}
                <div className="field">
                    <input
                        type="text"
                        placeholder=" "
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label>Student ID / Roll Number</label>
                </div>

                <div className="field">
                    <input
                        type="password"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label>Password</label>
                </div>

                <button className="login-btn" onClick={handleLogin}>
                    Login
                </button>

                {/* <span
                    className="forgot"
                    onClick={() => {
                        sessionStorage.setItem("FORGOT_ROLE", "STUDENT");
                        navigate("/forgot-password");
                    }}
                >
                    Forgot password?
                </span> */}

            </div>
        </div>
    );
}