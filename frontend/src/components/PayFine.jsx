import { useState, useEffect } from "react";
import "./PayFine.css";
import { useLocation, useNavigate } from "react-router-dom";
import { payFine } from "../api";
import { showToast } from "../../public/toast";

export default function PayFine() {

    const { state } = useLocation();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(state);   // ✅ local copy
    const [amount, setAmount] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmPayment, setConfirmPayment] = useState(false);
    const [payAmount, setPayAmount] = useState(0);

    // safety
    if (!issue) {
        return (
            <div style={{ padding: 20 }}>
                No payment data found.
                <br />
                <button onClick={() => navigate("/return")}>Go Back</button>
            </div>
        );
    }

    async function pay() {

        const payAmount = Number(amount);

        if (!payAmount || payAmount <= 0) {
            showToast("Enter valid amount", "warning");
            return;
        }

        if (payAmount > issue.balanceAmount) {
            showToast("Amount cannot be more than balance", "warning")
            return;
        }
           setPayAmount(amountNumber);
           setConfirmPayment(true);

        try {
            setLoading(true);

            const data = await payFine(issue.issueId, payAmount);

            setResult(data);

            // ✅ update safely
            setIssue(prev => ({
                ...prev,
                balanceAmount: data.balanceAmount
            }));

            setAmount("");

        } catch (e) {
            console.error(e);
            showToast("Payment failed", "error");
        } finally {
            setLoading(false);
        }
    }

    function handleKey(e) {
        if (e.key === "Enter") {
            pay();
        }
    }
    const handleConfirmPayment = async () => {

    try {
        setConfirmPayment(false);
        setLoading(true);

        const data = await payFine(issue.issueId, payAmount);

        setResult(data);

        setIssue(prev => ({
            ...prev,
            balanceAmount: data.balanceAmount
        }));

        setAmount("");

        showToast("Payment successful", "success");

    } catch (e) {
        console.error(e);
        showToast("Payment failed", "error");
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="pay-wrapper">

            <div className="pay-card">

                <div className="pay-header">
                    <h2>Pay Fine</h2>
                    <p>Complete your library fine payment</p>
                </div>

                <div className="pay-summary">

                    <div className="summary-row">
                        <span>Student</span>
                        <strong>{issue.issuedTo}</strong>
                    </div>

                    <div className="summary-row">
                        <span>Book</span>
                        <strong>{issue.bookTitle}</strong>
                    </div>

                    <div className="summary-row">
                        <span>Copy</span>
                        <strong>{issue.copyCode}</strong>
                    </div>

                    <div className="summary-row">
                        <span>Total Fine</span>
                        <strong>₹ {issue.fine}</strong>
                    </div>

                    <div className="summary-row highlight">
                        <span>Balance Amount</span>
                        <strong>₹ {issue.balanceAmount}</strong>
                    </div>

                    <div className="pay-meta">
                        <span>Issue ID : #{issue.issueId}</span>
                        <span className="hint">You can pay partial amount</span>
                    </div>

                    <div className="progress-wrap">
                        <div
                            className="progress-bar"
                            data-label={
                                issue.fine > 0
                                    ? `${Math.round(
                                        ((issue.fine - issue.balanceAmount) / issue.fine) * 100
                                    )}% paid`
                                    : "0% paid"
                            }
                            style={{
                                width:
                                    issue.fine > 0
                                        ? `${Math.round(
                                            ((issue.fine - issue.balanceAmount) / issue.fine) * 100
                                        )}%`
                                        : "0%"
                            }}
                        />

                    </div>


                </div>

                {issue.balanceAmount === 0 && (
                    <div className="paid-info">
                        Fine already cleared.
                    </div>
                )}

                <div className="pay-input-box">
                    <div className="quick-pay">
                        <button
                            type="button"
                            onClick={() =>
                                setAmount(Math.ceil(issue.balanceAmount * 0.25))
                            }
                        >
                            25%
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setAmount(Math.ceil(issue.balanceAmount * 0.5))
                            }
                        >
                            50%
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setAmount(issue.balanceAmount)
                            }
                        >
                            Full
                        </button>
                    </div>

                    <label>Enter amount to pay</label>

                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        max={issue.balanceAmount}
                        disabled={issue.balanceAmount === 0}
                        onKeyDown={handleKey}
                        onChange={e => setAmount(e.target.value)}
                    />

                    <button
                        className="pay-btn"
                        disabled={loading || issue.balanceAmount === 0}
                        onClick={pay}
                    >
                        {loading ? "Processing..." : "Pay Now"}
                    </button>

                </div>

                {result && (
                    <div className="pay-success">

                        <div className="success-title">
                            ✅ Payment Successful
                        </div>

                        <div className="success-row">
                            <span>Paid</span>
                            <span>₹ {result.paidAmount}</span>
                        </div>

                        <div className="success-row">
                            <span>Balance</span>
                            <span>₹ {result.balanceAmount}</span>
                        </div>

                        <div className="success-row">
                            <span>Status</span>
                            <span>{result.fineStatus}</span>
                        </div>

                    </div>
                )}

                <button
                    className="back-btn2"
                    onClick={() => navigate("/issued")}
                >
                    ← Back to Issued List
                </button>

            </div>
            {confirmPayment && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <h3>Confirm Payment</h3>
                  <p>Confirm payment of ₹{payAmount} ?</p>
            
                  <div className="confirm-buttons">
                    <button 
                      className="btn cancel"
                      onClick={() => setConfirmPayment(false)}
                    >
                      Cancel
                    </button>
            
                    <button 
                      className="btn confirm"
                      onClick={handleConfirmPayment}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
}
