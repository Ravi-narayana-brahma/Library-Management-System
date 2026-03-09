import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import { searchCopyCodes, returnBook, markCopyStatus } from "../api";
import { showToast } from "../../public/toast";

export default function ReturnBook() {

  const [copyId, setCopyId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [returnInfo, setReturnInfo] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [fineAmount, setFineAmount] = useState("");

  const navigate = useNavigate();

  async function loadSuggestions(text) {
    try {

      const data = await searchCopyCodes(text);

      if (data.autoIssued === true) {
        showToast(`Auto issued to : ${data.autoIssuedTo}`, "info");
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

  function handleReturn() {

    if (!copyId) {
      showToast("Enter Copy ID", "warning");
      return;
    }

    setShowModal(true);
  }

  async function handleAction(type) {

    if (type === "RETURN") {

      try {

        const data = await returnBook(copyId);
        setReturnInfo(data);

        setCopyId("");
        setSuggestions([]);
        setShowModal(false);

      } catch (e) {

        showToast("Error returning book", "error");

      }

    } else {

      setActionType(type);

    }
  }

  async function submitFineAction() {

  if (!fineAmount) {
    showToast("Enter fine amount", "warning");
    return;
  }

  try {

    const data = await markCopyStatus(copyId, actionType, Number(fineAmount));

    setReturnInfo(data);

    setShowModal(false);
    setCopyId("");
    setSuggestions([]);
    setActionType("");
    setFineAmount("");

  } catch (e) {

    showToast("Error processing request", "error");

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

      {/* -------- Modal -------- */}

      {showModal && (
        <div className="modal-overlay">

          <div className="modal-box">

            {!actionType && (
              <>
                <h3>Select Action</h3>

                <div className="modal-buttons">

                  <button
                    className="modal-return"
                    onClick={() => handleAction("RETURN")}
                  >
                    Return
                  </button>

                  <button
                    className="modal-lost"
                    onClick={() => handleAction("LOST")}
                  >
                    Lost
                  </button>

                  <button
                    className="modal-damaged"
                    onClick={() => handleAction("DAMAGED")}
                  >
                    Damaged
                  </button>

                </div>
              </>
            )}

            {(actionType === "LOST" || actionType === "DAMAGED") && (
              <>

                <h3>{actionType} Fine</h3>

                <input
                  type="number"
                  placeholder="Enter fine amount"
                  value={fineAmount}
                  onChange={e => setFineAmount(e.target.value)}
                />

                <button
                  className="issue-btn"
                  onClick={submitFineAction}
                >
                  Submit
                </button>

              </>
            )}

            <button
              className="modal-cancel"
              onClick={() => {
                setShowModal(false);
                setActionType("");
                setFineAmount("");
              }}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

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

          {returnInfo?.balanceAmount > 0 && (
            <>
              <div className="rd-row">
                <span>Balance</span>
                <span>₹ {returnInfo.balanceAmount}</span>
              </div>

              <button
                className="pay-btn"
                onClick={() => navigate("/admin/pay-fine", { state: returnInfo })}
              >
                Pay Fine
              </button>
            </>
          )}

        </div>
      )}

    </div>
  );
}
