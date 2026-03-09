import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { showToast } from "../../public/toast";

export default function AdminCodeGate() {

  const [code,setCode] = useState("");
  const [attempts,setAttempts] = useState(0);

  const navigate = useNavigate();

  const verifyCode = async () => {

    const res = await fetch(
      "https://library-management-system-241n.onrender.com/api/security/verify-admin-code",
      {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({code})
      }
    );

    const data = await res.json();

    if(data.success){
        navigate("/real-admin-login");
        return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if(newAttempts >= 3){
        navigate("/student-login");
    } else {
        showToast(`Wrong code. Attempts left: ${3 - newAttempts}`, "warning");
    }

  };

  return (
  <div className="admin-code-page">
  <div className="admin-code-box">

    <h2 className="admin-code-title">Admin Access</h2>
    <p className="admin-code-subtitle">Enter the secret access code</p>

    <input
      type="password"
      className="admin-code-input"
      placeholder="Secret Code"
      value={code}
      onChange={(e)=>setCode(e.target.value)}
    />

    <button className="admin-code-btn" onClick={verifyCode}>
      Continue
    </button>

    <p className="admin-code-attempts">
      Attempts left: {3 - attempts}
    </p>

  </div>
</div>
  );
}
