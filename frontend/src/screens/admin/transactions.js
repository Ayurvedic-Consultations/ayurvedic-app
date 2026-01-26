import React, { useState, useEffect } from 'react';
import './transactions.css';

/**
 * Fetch function logic
 */
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
        // Assuming the API returns { transactions: [...] }
        setTransactions(data.transactions || []);
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

    // Filter Logic
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

    // --- Conditional Rendering States ---

    if (loading) {
        return (
            <div className="tx-container">
                <div className="tx-status-message">
                    <div className="spinner"></div>
                    <p>Fetching your transactions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tx-container">
                <div className="tx-status-message tx-error">
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="tx-container">
            <header className="tx-header-section">
                <h2 className="tx-header">Transactions</h2>
                <p className="tx-subtitle">View and manage all Ayurvedic commerce history</p>
            </header>

            {/* Filter + Search Controls */}
            <div className="tx-filter-controls">
                <div className="tx-control-group">
                    <label htmlFor="transaction-filter">Category</label>
                    <select
                        id="transaction-filter"
                        onChange={(e) => setFilter(e.target.value)}
                        value={filter}
                    >
                        <option value="all">All Transactions</option>
                        <option value="patient-doctor">Patient-Doctor</option>
                        <option value="patient-retailer">Patient-Retailer</option>
                        <option value="doctor-retailer">Doctor-Retailer</option>
                    </select>
                </div>

                <div className="tx-control-group search-group">
                    <label htmlFor="tx-search">Quick Search</label>
                    <input
                        id="tx-search"
                        type="text"
                        className="tx-search"
                        placeholder="Search by date, amount, or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filteredTransactions.length > 0 ? (
                <div className="tx-table-wrapper">
                    <table className="tx-table">
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
                                    <td data-label="Transaction ID" className="tx-id-cell">{t.id}</td>
                                    <td data-label="Type">
                                        <strong className={`tx-badge ${t.type.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {t.type}
                                        </strong>
                                    </td>
                                    <td data-label="Date">{t.date}</td>
                                    <td data-label="Amount" className="tx-amount-cell">
                                        ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td data-label="From">{t.from}</td>
                                    <td data-label="To">{t.to}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="tx-no-transactions">
                    <div className="empty-icon">🍃</div>
                    <h3>No results found</h3>
                    <p>Try adjusting your filters or search keywords.</p>
                </div>
            )}
        </div>
    );
};

export default Transactions;