import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './OrderHistory.css';
import { AuthContext } from '../../context/AuthContext';

// You might need to adjust this based on your backend configuration
const API_BASE_URL = `${process.env.AYURVEDA_BACKEND_URL}`;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext);
  const userId = auth?.user?.id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/orders`, {
          params: { userId },
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load your orders. Please try again later.');
        setLoading(false);
      }
    };

    if (userId) fetchOrders();
  }, [userId, auth.token]);

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to handle image paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Handle different image path scenarios
    if (imagePath.startsWith('http')) {
      // Already a full URL
      return imagePath;
    } else if (imagePath.startsWith('/')) {
      // Absolute path from root
      return `${API_BASE_URL}${imagePath}`;
    } else {
      // Relative path
      return `${API_BASE_URL}/${imagePath}`;
    }
  };

  // Function to map status to badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107'; // yellow
      case 'processing': return '#2196F3'; // blue
      case 'shipped': return '#9C27B0'; // purple
      case 'delivered': return '#4CAF50'; // green
      case 'cancelled': return '#F44336'; // red
      default: return '#757575'; // grey
    }
  };

  return (
    <div className="order-history" style={{ marginTop: '160px' }}>
      <h1>Your Order History</h1>
      
      {loading ? (
        <p>Loading your orders...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <button 
            onClick={() => window.location.href = '/shop'} 
            className="shop-now-btn"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                >
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </div>
              </div>
              
              <div className="order-items">
                <h4>Items</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.image ? (
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/placeholder-image.png';
                          }} 
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-price">${item.price.toFixed(2)} × {item.quantity}</p>
                      <p className="item-subtotal">Subtotal: ${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="payment-info">
                  <p><strong>Payment Method:</strong> {order.paymentMethod === 'cashOnDelivery' ? 'Cash On Delivery' : 'Online Payment'}</p>
                  <p><strong>Payment Status:</strong> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
                </div>
                <div className="order-total">
                  <p><strong>Total Amount:</strong> ${order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;