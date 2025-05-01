import React, { useState } from 'react';
import './Payment.css';

const PaymentScreen = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handlePaymentSubmit = () => {
    if (selectedPaymentMethod) {
      alert(`Payment successful using ${selectedPaymentMethod}!`);
    } else {
      alert('Please select a payment method.');
    }
  };

  return (
    <div className="payment-page">
      <h2>Checkout</h2>

      <div className="payment-container">
        <h3>Select Payment Method</h3>

        <div className="payment-options">
          <label>
            <input
              type="radio"
              value="Credit/Debit Card"
              checked={selectedPaymentMethod === 'Credit/Debit Card'}
              onChange={handlePaymentMethodChange}
            />
            Credit/Debit Card
          </label>

          <label>
            <input
              type="radio"
              value="Net Banking"
              checked={selectedPaymentMethod === 'Net Banking'}
              onChange={handlePaymentMethodChange}
            />
            Net Banking
          </label>

          <label>
            <input
              type="radio"
              value="UPI"
              checked={selectedPaymentMethod === 'UPI'}
              onChange={handlePaymentMethodChange}
            />
            UPI
          </label>
        </div>

        <button onClick={handlePaymentSubmit} className="pay-now-button">
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentScreen;
