import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './Notifications.css';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.AYURVEDA_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (auth?.token) {
      fetchNotifications();
      
      // Set up polling for new notifications (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [auth?.token]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${process.env.AYURVEDA_BACKEND_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      // Update local state
      setNotifications(prevNotifs => 
        prevNotifs.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.AYURVEDA_BACKEND_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      // Update local state
      setNotifications(prevNotifs => 
        prevNotifs.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
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
    
    setIsOpen(false);
  };
  
  // Format date
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">No notifications yet</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
