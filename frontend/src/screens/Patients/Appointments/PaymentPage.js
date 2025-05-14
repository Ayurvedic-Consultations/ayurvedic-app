import React, { useEffect, useState } from "react";
import "./PaymentPage.css"; // Create this CSS file for styling

function PaymentPage() {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the QR code from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const qrCodeParam = urlParams.get("qrCode");

    if (qrCodeParam) {
      setQrCode(qrCodeParam);
      setLoading(false);
    } else {
      setError("QR Code is missing.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="payment-container loading">
        <p>Loading QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container error">
        <p>{error}</p>
      </div>
    );
  }

  // Strip the "uploads/doctors/" prefix if it exists
  const qrCodePath = qrCode.replace(/^uploads\/doctors\//, "");

  const qrCodeUrl = `http://localhost:8080/uploads/doctors/${qrCodePath}`;
  console.log("QR Code URL:", qrCodeUrl);  // Log the QR code URL

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Payment for Doctor</h2>
        <p>Scan the QR code below to complete your payment</p>
        <div className="qr-container">
          <img
            src={qrCodeUrl}
            alt="Doctor's QR Code"
            onError={(e) => {
              console.error("Failed to load QR code:", qrCode);
              setError("Failed to load QR code. Please try again later.");
              e.target.style.display = "none";  // Hide image on error
            }}
          />
        </div>
        <div className="payment-instructions">
          <h3>Payment Instructions:</h3>
          <ol>
            <li>Open your UPI payment app</li>
            <li>Scan the QR code displayed above</li>
            <li>Enter the amount as per your consultation fees</li>
            <li>Complete the payment</li>
            <li>Keep a screenshot of the payment confirmation</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
