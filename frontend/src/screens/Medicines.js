import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MedicineCard from './MedicineCard';
import './Medicines.css';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => {
    // Retrieve initial cart state from local storage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/medicines`);
        setMedicines(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicines(); 
  }, []);

  const addToCart = (medicine) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === medicine._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...medicine, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id, delta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(item.quantity + delta, 0) } : item
      );
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  useEffect(() => {
    // Store cart in local storage for persistence
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="medicines-page">
      <div className="medicine-list">
        {medicines.map((medicine) => (
          <MedicineCard key={medicine._id} medicine={medicine} cart={cart} addToCart={addToCart} handleQuantityChange={handleQuantityChange} />
        ))}
      </div>
    </div>
  );
};

export default Medicines;
