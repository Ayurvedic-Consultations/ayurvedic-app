import React, { useState, useEffect } from 'react';
import './transactions.css';

const fetchTransactions = async (setTransactions, setLoading, setError) => {
    setLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found.');
        }

        const response = await fetch(
            `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/orders/getAllTransactions`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch transactions.");
        }
        const data = await response.json();
        setTransactions(data.transactions);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
};

const Transactions = () => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTransactions(setTransactions, setLoading, setError);
    }, []);

    if (loading) {
        return <div className="transactions-container">Loading transactions...</div>;
    }

    if (error) {
        return <div className="transactions-container">Error</div>;
    }

    if (transactions.length === 0) {
        return <div className="transactions-container">No transactions found.</div>;
    }

    // Filter by dropdown + search
    const filteredTransactions = transactions.filter((t) => {
        const matchesFilter = filter === 'all' || t.type.toLowerCase().includes(filter);
        const searchLower = search.toLowerCase();

        const matchesSearch =
            t.date.toLowerCase().includes(searchLower) ||
            t.amount.toString().toLowerCase().includes(searchLower) ||
            t.from.toLowerCase().includes(searchLower) ||
            t.to.toLowerCase().includes(searchLower);

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
                    placeholder="Search by date, amount, or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length > 0 ? (
                <div className="transactions-table-wrapper">
                    <table className="transactions-table" style={{width: '100%'}}>
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
                                    {/* <td>#{t.id.slice(-6)}</td> */}
                                    <td>{t.id}</td>
                                    <td><strong>{t.type}</strong></td>
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
