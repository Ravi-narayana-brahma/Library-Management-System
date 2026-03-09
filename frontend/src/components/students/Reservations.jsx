import { useEffect, useState } from "react";
import { showToast } from "../../../public/toast";
import {
  getStudentReservations,
  reserveBookFlexible,
  cancelStudentReservation
} from "../../api";
import "./Student.css"

export default function Reservations() {

  const [reservations, setReservations] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  async function loadReservations() {
    try {
      setLoading(true);

      const data = await getStudentReservations();
      setReservations(data);

    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to load reservations", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function addReservation() {

    if (!input.trim()) {
      showToast("Enter Book ID / Book Code / Copy Code", "warning");
      return;
    }

    try {

      const msg = await reserveBookFlexible(input.trim());

      showToast(msg, "success");

      setInput("");
      loadReservations();

    } catch (e) {
      console.error(e);
      showToast(e.message || "Reservation failed", "error");
    }
  }
async function cancelReservation(id) {
  setCancelId(id);
  setConfirmCancel(true);
}
async function confirmCancelReservation() {

  try {

    const msg = await cancelStudentReservation(cancelId);

    showToast(msg || "Reservation cancelled", "info");

    loadReservations();

  } catch (e) {
    console.error(e);
    showToast("Cancel failed", "error");
  } finally {
    setConfirmCancel(false);
  }
}
  const filteredReservations = reservations.filter(r =>
    r.book?.bookName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="student-page-header">
        <h1 className="h1">📌 My Reservations</h1>
        <span>Reserve using Book ID / Book Code / Copy Code</span>
      </div>

      <div className="reservation-form">
        <input
          placeholder="Book ID | Book Code | Copy Code"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={addReservation}>Reserve</button>
      </div>

      <div className="reservation-search">
        <input
          placeholder="Search reservation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : filteredReservations.length > 0 ? (
        <table className="student-table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Book Name</th>
              <th>Reserved On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredReservations.map((res, index) => (
              <tr key={res.reservationId}>
                <td>{index + 1}</td>
                <td>{res.book?.bookName}</td>
                <td>
                  {new Date(res.reservationDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </td>
                <td>
                  <span className={`badge ${res.status === "ACTIVE" ? "orange" : "red"}`}>
                    {res.status}
                  </span>
                </td>
                <td>
                  {res.status === "ACTIVE" ? (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelReservation(res.reservationId)}
                    >
                      Cancel
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      ) : (
        <div className="empty-state">📌 No reservations found</div>
      )}
      {confirmCancel && (
      <div className="confirm-overlay">
        <div className="confirm-box">
    
          <h3>Cancel Reservation</h3>
          <p>Cancel this reservation?</p>
    
          <div className="confirm-buttons">
            <button
              className="btn cancel"
              onClick={() => setConfirmCancel(false)}
            >
              No
            </button>
    
            <button
              className="btn confirm"
              onClick={confirmCancelReservation}
            >
              Yes, Cancel
            </button>
          </div>
    
        </div>
      </div>
    )}
    </div>
  );
}
