import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        alert(`Wrong code. Attempts left: ${3-newAttempts}`);
    }

  };

  return (
    <div style={{textAlign:"center",marginTop:"150px"}}>

      <h2>Admin Access</h2>

      <input
        type="password"
        placeholder="Enter Secret Code"
        value={code}
        onChange={(e)=>setCode(e.target.value)}
      />

      <br/><br/>

      <button onClick={verifyCode}>
        Continue
      </button>

    </div>
  );
}
