import React, { useState } from 'react';
import './patientTrans.css'; // Assuming your CSS file is named this
import { ReceiptText, Search } from 'lucide-react';

// Updated dummy data with a 'doctor' field
const transactionData = [
  {
    id: 'TXN75631A',
    date: '2025-09-02',
    doctor: 'Dr. Evelyn Reed',
    description: 'General Consultation',
    amount: 1500,
  },
  {
    id: 'TXN84592B',
    date: '2025-08-22',
    doctor: 'Dr. Marcus Thorne',
    description: 'Annual Health Check-up',
    amount: 8500,
  },
  {
    id: 'TXN34589C',
    date: '2025-08-15',
    doctor: 'Dr. Evelyn Reed',
    description: 'Lab Test: Blood Panel',
    amount: 2200,
  },
  {
    id: 'TXN12543D',
    date: '2025-07-30',
    doctor: 'Dr. Samuel Chen',
    description: 'Follow-up Visit',
    amount: 1000,
  },
  {
    id: 'TXN98765E',
    date: '2025-07-21',
    doctor: 'Dr. Marcus Thorne',
    description: 'X-Ray Diagnostics',
    amount: 3500,
  },
];

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Updated filter logic to search by doctor, amount, and ID
  const filteredTransactions = transactionData.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.doctor.toLowerCase().includes(term) ||
      t.amount.toString().includes(term) ||
      t.id.toLowerCase().includes(term)
    );
  });

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
            placeholder="Search by Doctor, Amount, or ID..."
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
              <th>Doctor</th>
              <th>Description</th>
              <th>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="transaction-id">{t.id}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td className="doctor-name">{t.doctor}</td>
                  <td>{t.description}</td>
                  <td className="transaction-amount">₹{t.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;