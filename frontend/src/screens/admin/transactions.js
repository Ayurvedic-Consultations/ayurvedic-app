import React, { useState } from 'react';
import './transactions.css';

const Transactions = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Static sample data
  const data = [
    { id: 1, type: 'Patient-Doctor', date: '2025-08-28', amount: 50.0, from: 'Jane Doe (Patient)', to: 'Dr. Smith (Doctor)' },
    { id: 2, type: 'Patient-Retailer', date: '2025-08-27', amount: 25.5, from: 'John Doe (Patient)', to: 'MediMart (Retailer)' },
    { id: 3, type: 'Doctor-Retailer', date: '2025-08-26', amount: 120.75, from: 'Dr. Smith (Doctor)', to: 'PharmaSupply (Retailer)' },
    { id: 4, type: 'Patient-Doctor', date: '2025-08-25', amount: 75.0, from: 'Alice Green (Patient)', to: 'Dr. Jones (Doctor)' },
  ];

  // Filter by dropdown + search
  const filteredTransactions = data.filter((t) => {
    const matchesFilter = filter === 'all' || t.type.toLowerCase().includes(filter);
    const searchLower = search.toLowerCase();

    const matchesSearch =
      t.date.toLowerCase().includes(searchLower) ||
      t.amount.toString().toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="transactions-container">
      <h2 className="transactions-header">Transactions</h2>

      {/* Filter + Search Controls */}
      <div className="filter-controls">
        <label htmlFor="transaction-filter">Filter by:</label>
        <select
          id="transaction-filter"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="all">All</option>
          <option value="patient-doctor">Patient-Doctor</option>
          <option value="patient-retailer">Patient-Retailer</option>
          <option value="doctor-retailer">Doctor-Retailer</option>
        </select>

        {/* Search bar */}
        <input
          type="text"
          className="transaction-search"
          placeholder="Search by date or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>{t.type}</td>
                  <td>{t.date}</td>
                  <td>${t.amount.toFixed(2)}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-transactions">No transactions found for the selected filter.</div>
      )}
    </div>
  );
};

export default Transactions;
