import React, { useState } from 'react';
// import './RetailerTrans.css';
import { ReceiptText, Search } from 'lucide-react';

const RetailerTransactions = ({ retailer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamically create transaction data from the retailer's orders prop
  const transactionData = retailer?.orders?.map(order => ({
    id: order.orderId,
    date: order.date,
    customer: order.customerName,
    description: `Order for ${order.medicineName}`,
    amount: order.total,
  })) || [];

  // Filter logic to search by customer, amount, and ID
  const filteredTransactions = transactionData.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.customer.toLowerCase().includes(term) ||
      t.amount.toString().includes(term) ||
      t.id.toLowerCase().includes(term)
    );
  });

  // Display a message if there are no transactions for the retailer
  if (transactionData.length === 0) {
    return (
        <div className="card transaction-card no-transactions-container">
             <h3>
                <ReceiptText size={22} /> No Transaction History
            </h3>
            <p>This retailer has no recorded transactions.</p>
        </div>
      );
  }

  return (
    <div className="card transaction-card">
      <div className="transaction-header">
        <h3>
          <ReceiptText size={20} /> Transaction History
        </h3>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Customer, Amount, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="transaction-table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Description</th>
              <th>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td data-label="ID" className="transaction-id">{t.id}</td>
                  <td data-label="Date">{new Date(t.date).toLocaleDateString()}</td>
                  <td data-label="Customer" className="customer-name">{t.customer}</td>
                  <td data-label="Description">{t.description}</td>
                  <td data-label="Amount" className="transaction-amount">
                    ₹{t.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No transactions found for your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetailerTransactions;
