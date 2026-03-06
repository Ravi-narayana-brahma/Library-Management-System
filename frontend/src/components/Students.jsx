import { useEffect, useState } from "react";
import "./Form.css";
import "./Table.css";
import {
  getStudents,
  addStudent,
  getStudentHistory,
  getActiveStudentIssues
} from "../api";

export default function Students() {

  const [studentName, setStudentName] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [viewMode, setViewMode] = useState(null);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);


  async function loadStudents() {

    const data = await getStudents();
    setStudents(data);
  }

  async function handleAddStudent() {

    if (
      !studentName.trim() ||
      !email.trim() ||
      !hallTicket.trim() ||   // ✅
      !year.trim() ||
      !branch.trim()
    ) {
      alert("All fields are required");
      return;
    }
    try {

      const msg = await addStudent({
        studentName,
        email,
        hallTicket,
        year,
        branch
      });
      alert(msg);

      setStudentName("");
      setEmail("");
      setHallTicket("");
      setYear("");
      setBranch("");

      loadStudents();

    } catch (e) {
        console.log("Add student error:", e);
        alert(e.message || "Error saving student");
    }
  }

  async function loadStudentHistory(hallTicket) {

    const data = await getStudentHistory(hallTicket);

    setHistory(data);
    setActiveIssues([]);
    setSelectedStudent(hallTicket);
    setViewMode("history");
  }


  async function loadActiveIssues(hallTicket) {

    const data = await getActiveStudentIssues(hallTicket);

    setActiveIssues(data);
    setHistory([]);
    setSelectedStudent(hallTicket);
    setViewMode("active");
  }
  useEffect(() => {
    loadStudents();
  }, []);
  function handleReset() {
    setStudentName("");
    setEmail("");
    setHallTicket("");
    setYear("");
    setBranch("");
  }

  return (
    <div>

      <div className="form-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Add Student</h2>
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
          >
            ↻
          </button>
        </div>
        <input
          placeholder="Student Name"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Hall Ticket Number"
          value={hallTicket}
          onChange={e => setHallTicket(e.target.value)}
          required
        />
        <input
          placeholder="Year"
          value={year}
          onChange={e => setYear(e.target.value)}
          required
        />

        <input
          placeholder="Branch"
          value={branch}
          onChange={e => setBranch(e.target.value)}
          required
        />


        <button onClick={handleAddStudent} className="issue-btn">Add Student</button>
      </div>

      <br />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Hall Ticket</th>
              <th>Year</th>
              <th>Branch</th>
              <th>History</th>
              <th>Active</th>

            </tr>
          </thead>

          <tbody>
            {students.map(s => (
              <tr key={s.studentId}>
                <td>{s.studentId}</td>
                <td>{s.studentName}</td>
                <td>{s.email}</td>
                <td>{s.hallTicket}</td>
                <td>{s.year}</td>
                <td>{s.branch}</td>
                <td>
                  <button className="mini-btn" onClick={() => loadStudentHistory(s.hallTicket)}>
                    History
                  </button>
                </td>

                <td>
                  <button className="mini-btn" onClick={() => loadActiveIssues(s.hallTicket)}>
                    Active
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
      {selectedStudent && viewMode === "history" && (
        <div className="table-wrap" style={{ marginTop: 20 }}>

          <div className="panel-header">
            <h3>Student History (ID : {selectedStudent})</h3>

            <button
              className="close-btn"
              onClick={() => {
                setSelectedStudent(null);
                setHistory([]);
                setActiveIssues([]);
                setViewMode(null);
              }}
            >
              ✕
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Copy Code</th>
                <th>Issue</th>
                <th>Return</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {history.map(h => (
                <tr key={h.recordId}>
                  <td>{h.bookCopyId?.book?.bookName}</td>
                  <td>{h.bookCopyId?.copyCode}</td>
                  <td>{h.issueDate}</td>
                  <td>{h.returnDate ?? "-"}</td>
                  <td><span className={`status ${(h.recordStatus || "").toLowerCase()}`}>
                    {h.recordStatus}
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
      {selectedStudent && viewMode === "active" && (
        <div className="table-wrap" style={{ marginTop: 20 }}>

          <div className="panel-header">
            <h3>Active Issued Books (ID : {selectedStudent})</h3>

            <button
              className="close-btn"
              onClick={() => {
                setSelectedStudent(null);
                setHistory([]);
                setActiveIssues([]);
                setViewMode(null);
              }}
            >
              ✕
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Copy Code</th>
                <th>Due</th>
              </tr>
            </thead>

            <tbody>
              {activeIssues.map(a => (
                <tr key={a.recordId}>
                  <td>{a.bookCopyId?.book?.bookName}</td>
                  <td>{a.bookCopyId?.copyCode}</td>
                  <td>{a.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}


    </div>
  );
}
