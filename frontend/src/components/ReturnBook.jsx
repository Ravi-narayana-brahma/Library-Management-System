import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import { searchCopyCodes, returnBook } from "../api";


export default function ReturnBook() {

  const [copyId, setCopyId] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [returnInfo, setReturnInfo] = useState(null);
  const navigate = useNavigate();
  async function loadSuggestions(text) {
    try {
      const data = await searchCopyCodes(text);
      if (data.autoIssued === true) {
        alert("Auto issued to : " + data.autoIssuedTo);
      }

      setSuggestions(data);

    } catch (e) {
      console.log("suggest error", e);
    }
  }
  useEffect(() => {

    if (!copyId || copyId.length < 2) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(() => {
      loadSuggestions(copyId);
    }, 300);

    return () => clearTimeout(t);

  }, [copyId]);
  async function handleReturn() {

    if (!copyId) {
      alert("Enter Copy ID");
      return;
    }

    try {

      const data = await returnBook(copyId);

      setReturnInfo(data);

      setCopyId("");
      setSuggestions([]);

    } catch (e) {
      console.log("Return error", e);
      alert("Error returning book");
    }
  }



  return (
    <div className="form-box">

      <h2>Return Book</h2>

      <div className="auto-box">

        <input
          placeholder="Copy Code"
          value={copyId}
          onChange={e => setCopyId(e.target.value)}
        />

        {suggestions.length > 0 && (
          <div className="suggest-list">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="suggest-item"
                onClick={() => {
                  setCopyId(s);
                  setSuggestions([]);
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

      </div>

      <button className="issue-btn" onClick={handleReturn}>
        Return
      </button>


      {/* -------- Return Details -------- */}

      {returnInfo && (
        <div className="return-details-box">

          <h3>Return Details</h3>

          <div className="rd-row">
            <span>Copy Code</span>
            <span>{returnInfo.copyCode}</span>
          </div>

          <div className="rd-row">
            <span>Book</span>
            <span>{returnInfo.bookTitle}</span>
          </div>

          <div className="rd-row">
            <span>Taken By</span>
            <span>{returnInfo.issuedTo}</span>
          </div>

          <div className="rd-row">
            <span>Issued Date</span>
            <span>{returnInfo.issuedDate}</span>
          </div>

          <div className="rd-row">
            <span>Due Date</span>
            <span>{returnInfo.dueDate}</span>
          </div>

          <div className="rd-row">
            <span>Returned On</span>
            <span>{returnInfo.returnDate}</span>
          </div>

          <div className="rd-row fine">
            <span>Fine</span>
            <span>₹ {returnInfo.fine}</span>
          </div>

          {/* ✅ balance */}
          {returnInfo.fine > 0 && (
            <div className="rd-row">
              <span>Balance</span>
              <span>₹ {returnInfo.balanceAmount}</span>
            </div>
          )}

          {returnInfo?.balanceAmount > 0 && (
            <button
              className="pay-btn"
              onClick={() => navigate("/pay-fine", { state: returnInfo })}
            >
              Pay Fine
            </button>
          )}



        </div>
      )}

    </div>
  );
}
