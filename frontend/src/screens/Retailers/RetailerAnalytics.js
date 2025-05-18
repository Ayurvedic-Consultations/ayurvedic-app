import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./RetailerAnalytics.css"; // Create this file for styling

function RetailerAnalytics() {
  const { auth } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0 });

  useEffect(() => {
    const fetchRetailerOrders = async () => {
      try {
        const response = await axios.get(`${process.env.AYURVEDA_BACKEND_URL}/api/orders`, {
          params: { retailerId: auth?.user?.id },
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = response.data || [];
        const totalOrders = data.length;
        const totalRevenue = data.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        setStats({ total: totalOrders, revenue: totalRevenue });
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };

    if (auth?.user?.id) {
      fetchRetailerOrders();
    }
  }, [auth]);

  return (
    <div className="retailer-analytics">
      <h2>Retailer Analytics</h2>
      <div className="analytics-summary">
        <div className="card">
          <h3>Total Orders</h3>
          <p>{stats.total}</p>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <p>₹ {stats.revenue.toFixed(2)}</p>
        </div>
      </div>
      <div className="analytics-table">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((order) => (
              <tr key={order._id}>
                <td>{order.buyer?.firstName} {order.buyer?.lastName}</td>
                <td>{order.items?.length}</td>
                <td>₹ {order.totalPrice}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RetailerAnalytics;
