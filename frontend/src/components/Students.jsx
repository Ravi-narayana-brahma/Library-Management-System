import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Form.css";
import "./Table.css";

import {
  getStudents,
  addStudent,
  getStudentHistory,
  getActiveStudentIssues,
  downloadStudentTemplate,
  uploadStudentsExcel
} from "../api";

import { showToast } from "../../public/toast";

export default function Students() {

  const [studentName, setStudentName] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");

  const [students, setStudents] = useState([]);
  const fileInputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  // Excel states
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);


  async function loadStudents() {

    const data = await getStudents();
    setStudents(data);

  }


  async function handleAddStudent() {

    if (
      !studentName.trim() ||
      !email.trim() ||
      !hallTicket.trim() ||
      !year.trim() ||
      !branch.trim()
    ) {

      showToast("All fields are required", "warning");
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

      showToast(msg, "success");

      setStudentName("");
      setEmail("");
      setHallTicket("");
      setYear("");
      setBranch("");

      loadStudents();

    }
    catch (e) {

      showToast(e.message || "Error saving student", "error");

    }

  }


async function handleExcelUpload() {

  if (!excelFile) {
    showToast("Please select Excel file", "warning");
    return;
  }

  try {

    const formData = new FormData();
    formData.append("file", excelFile);

    setUploading(true);
    setProgress(0);

    const data = await uploadStudentsExcel(
      formData,
      (event) => {

        const percent = Math.round(
          (event.loaded * 100) / event.total
        );

        setProgress(percent);

      }
    );

    showToast(
      `Saved: ${data.saved} | Errors: ${data.errors}`,
      "success"
    );

    setUploading(false);
    loadStudents();
    
    setExcelFile(null);
    setProgress(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  
  } catch (err) {

    setUploading(false);
    showToast("Upload failed", "error");

  }

}


 async function downloadTemplate() {

  try {

    const blob = await downloadStudentTemplate();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "students_template.xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {

    showToast("Template download failed", "error");

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


  function handleReset() {

    setStudentName("");
    setEmail("");
    setHallTicket("");
    setYear("");
    setBranch("");

  }


  useEffect(() => {

    loadStudents();

  }, []);


  return (

    <div>

      {/* ADD STUDENT FORM */}

      <div className="form-box">

        <div style={{ display: "flex", justifyContent: "space-between" }}>

          <h2>Add Student</h2>

          <button
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
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="Hall Ticket Number"
          value={hallTicket}
          onChange={e => setHallTicket(e.target.value)}
        />

        <input
          placeholder="Year"
          value={year}
          onChange={e => setYear(e.target.value)}
        />

        <input
          placeholder="Branch"
          value={branch}
          onChange={e => setBranch(e.target.value)}
        />

        <button
          onClick={handleAddStudent}
          className="issue-btn"
        >
          Add Student
        </button>

      </div>


      {/* EXCEL UPLOAD */}

      <div className="form-box" style={{ marginTop: 20 }}>

        <h2>Upload Students Excel</h2>
        
        <button
          className="mini-btn"
          onClick={downloadTemplate}
        >
          Download Template
        </button>

        <br /><br />

       <div className="file-upload-box">
        
            <input
              type="file"
              id="excelUpload"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={(e) => setExcelFile(e.target.files[0])}
            />
        
          <label htmlFor="excelUpload" className="file-upload-label">
            {excelFile ? excelFile.name : "Choose Excel File"}
          </label>
        
        </div>

        <br /><br />

        <button
          className="issue-btn"
          onClick={handleExcelUpload}
          disabled={uploading}
        >
          Upload Excel
        </button>


        {uploading && (

          <div style={{ marginTop: 10 }}>

            <div>Uploading... {progress}%</div>

            <div
              style={{
                height: "8px",
                background: "#ddd",
                borderRadius: "5px",
                marginTop: "5px"
              }}
            >

              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#4caf50",
                  borderRadius: "5px"
                }}
              ></div>

            </div>

          </div>

        )}

      </div>


      {/* STUDENTS TABLE */}

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

                  <button
                    className="mini-btn"
                    onClick={() => loadStudentHistory(s.hallTicket)}
                  >
                    History
                  </button>

                </td>

                <td>

                  <button
                    className="mini-btn"
                    onClick={() => loadActiveIssues(s.hallTicket)}
                  >
                    Active
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* HISTORY PANEL */}

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

                  <td>
                    <span className={`status ${(h.recordStatus || "").toLowerCase()}`}>
                      {h.recordStatus}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* ACTIVE ISSUES */}

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
