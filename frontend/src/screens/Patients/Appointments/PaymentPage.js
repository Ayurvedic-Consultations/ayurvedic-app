import React, { useEffect, useState } from "react";
import "./PaymentPage.css"; // Create your styles here
import { useNavigate } from "react-router-dom";

function PaymentPage() {
    const navigate = useNavigate();

    const [qrCode, setQrCode] = useState("");
    const [price, setPrice] = useState(null);
    const [bookingId, setBookingId] = useState("");
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const qrCodeParam = urlParams.get("qrCode");
        const priceParam = urlParams.get("price");
        const bookingIdParam = urlParams.get("bookingId");
        console.log('Booking ID:', bookingId);

        if (qrCodeParam && priceParam && bookingIdParam) {
            setQrCode(qrCodeParam);
            setPrice(priceParam);
            setBookingId(bookingIdParam);
            setLoading(false);
        } else {
            setError("QR Code, Price, or Booking ID is missing.");
            setLoading(false);
        }
    }, []);

    const handleFileChange = (e) => {
        setPaymentScreenshot(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentScreenshot) {
            setError("Please upload a payment screenshot.");
            return;
        }

        console.log(paymentScreenshot); 

        const formData = new FormData();
        formData.append("paymentScreenshot", paymentScreenshot);
        formData.append("amountPaid", price);
        formData.append("paymentStatus", "Completed");
        console.log(formData);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/${bookingId}/payment`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to upload payment screenshot.");
            }

            alert("Payment uploaded successfully. Your doctor will send the meeting link at the time of appointment.");
            setTimeout(() => {
            navigate("/patient-home");
            }, 3000);
            setPaymentScreenshot(null);
        } catch (err) {
            setError(err.message);
        }
    };



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

    const qrCodePath = qrCode.replace(/^uploads\/doctors\//, "");
    const qrCodeUrl = `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/uploads/doctors/${qrCodePath}`;

    return (
        <div className="payment-container">
            <div className="payment-card">
                <h2>Doctor Consultation Payment</h2>
                <p>Scan the QR code below to pay</p>

                <div className="qr-container">
                    <img
                        src={qrCodeUrl}
                        alt="Doctor's QR Code"
                        onError={(e) => {
                            setError("Failed to load QR code image.");
                            e.target.style.display = "none";
                        }}
                    />
                </div>

                <p><strong>Amount to Pay:</strong> ₹{price}</p>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="paymentScreenshot">Upload Payment Screenshot:</label>
                        <input
                            type="file"
                            id="paymentScreenshot"
                            name="paymentScreenshot"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    <button type="submit">Submit Screenshot</button>
                </form>

                <div className="payment-instructions">
                    <h3>Instructions:</h3>
                    <ol>
                        <li>Open any UPI app (PhonePe, Google Pay, Paytm)</li>
                        <li>Scan the QR code shown above</li>
                        <li>Pay the amount ₹{price}</li>
                        <li>Take a screenshot of the successful payment</li>
                        <li>Upload the screenshot using the form above</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;
