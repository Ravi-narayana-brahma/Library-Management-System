import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

/* Auth */
import AdminLogin from "./components/AdminLogin";
import StudentLogin from "./components/students/StudentLogin";
import ForgotPassword from "./components/ForgotPassword";
import AdminRegister from "./components/AdminRegister";
import VerifyOtp from "./components/VerifyOtp";
import ResetPassword from "./components/ResetPassword";

/* Admin */
import Dashboard from "./components/Dashboard";
import Books from "./components/Books";
import AddBook from "./components/AddBook";
import Students from "./components/Students";
import IssueBook from "./components/IssueBook";
import ReturnBook from "./components/ReturnBook";
import IssuedList from "./components/IssuedList";
import Reservations from "./components/Reservations";
import PayFine from "./components/PayFine";
import AdminProfile from "./components/Profile";

/* Student */
import StudentLayout from "./components/students/StudentLayout";
import StudentDashboard from "./components/students/StudentDashboard";
import AllBooks from "./components/students/AllBooks";
import IssuedBooks from "./components/students/IssuedBooks";
import ReturnHistory from "./components/students/ReturnHistory";
import StudentReservations from "./components/students/Reservations";
import Fines from "./components/students/Fines";
import Profile from "./components/students/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Navigate to="/student-login" />} />
        {/* ---------- Public ---------- */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ---------- Admin ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="add-book" element={<AddBook />} />
          <Route path="students" element={<Students />} />
          <Route path="issue" element={<IssueBook />} />
          <Route path="return" element={<ReturnBook />} />
          <Route path="issued" element={<IssuedList />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="pay-fine" element={<PayFine />} />
          <Route path="admin-profile" element={<AdminProfile />} />
        </Route>

        {/* ---------- Student ---------- */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="all-books" element={<AllBooks />} />
          <Route path="issued" element={<IssuedBooks />} />
          <Route path="history" element={<ReturnHistory />} />
          <Route path="reservations" element={<StudentReservations />} />
          <Route path="fines" element={<Fines />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
