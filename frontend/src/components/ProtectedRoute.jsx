import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { whoAmI } from "../api";

export default function ProtectedRoute({ role, children }) {

  const [status, setStatus] = useState("loading"); // loading | allowed | denied

  useEffect(() => {
    whoAmI()
      .then(data => {
        if (data.role === role) {
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
      })
      .catch(() => setStatus("denied"));
  }, [role]);

  if (status === "loading") {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  if (status === "denied") {
    // 🔀 Redirect based on required role
    return (
      <Navigate
        to={role === "ADMIN" ? "/admin-login" : "/student-login"}
        replace
      />
    );
  }

  return children;
}
