import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './Notifications.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);
  
  // Fetch all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/notifications', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };
    
    if (auth?.token) {
      fetchNotifications();
    }
  }, [auth?.token]);
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      // Update local state
      setNotifications(prevNotifs => 
        prevNotifs.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:8080/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      // Update local state
      setNotifications(prevNotifs => 
        prevNotifs.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.relatedTo === 'order' && notification.relatedId) {
      window.location.href = `/retailer/orders/${notification.relatedId}`;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  };
  
  const groupedNotifications = groupNotificationsByDate(notifications);
  const hasUnread = notifications.some(notif => !notif.isRead);
  
  return (
    <div className="notifications-page" style={{ marginTop: '160px' }}>
      <div className="notifications-header">
        <h1>Notifications</h1>
        {hasUnread && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>
      
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="empty-notifications-page">
          <p>You don't have any notifications yet.</p>
        </div>
      ) : (
        Object.entries(groupedNotifications).map(([date, notifs]) => (
          <div key={date} className="notifications-group">
            <h3 className="date-header">{date}</h3>
            <div className="notifications-list">
              {notifs.map(notification => (
                <div 
                  key={notification._id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.relatedTo === 'order' && (
                      <div className="icon order-icon">📦</div>
                    )}
                    {notification.relatedTo === 'payment' && (
                      <div className="icon payment-icon">💰</div>
                    )}
                    {notification.relatedTo === 'account' && (
                      <div className="icon account-icon">👤</div>
                    )}
                    {notification.relatedTo === 'system' && (
                      <div className="icon system-icon">🔔</div>
                    )}
                  </div>
                  <div className="notification-details">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsPage;