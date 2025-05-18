import React, { useState, useEffect } from 'react';

function MyItems() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await fetch(`${process.env.AYURVEDA_BACKEND_URL}/api/medicines/my`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Send JWT token
          },
        });

        const data = await response.json();
        if (response.ok) {
          setItems(data);
        } else {
          setError(data.message || 'Failed to fetch items');
        }
      } catch (error) {
        setError('An error occurred while fetching items');
      }
    };

    fetchMyItems();
  }, []);

  return (
    <div className="items-grid">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {items.map((item, index) => (
        <div key={index} className="item-card">
          <h3>{item.name}</h3>
          <p>Price: {item.price}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Cures: {item.cures}</p>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default MyItems;
