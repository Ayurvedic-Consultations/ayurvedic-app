// controllers/notificationController.js
const Notification = require('../models/Notification');

exports.createNotification = async (userId, title, message, relatedTo, relatedId) => {
  try {
    const notification = new Notification({
      recipient: userId,
      title,
      message,
      relatedTo,
      relatedId
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    let { patientId, userId, role } = req.query;

    if (!patientId && !userId && req.user) {
        userId = req.user.id;
    }
    if (!role && req.user) {
        role = req.user.role;
    }

    const finalUserId = userId || patientId;

    if (!finalUserId || !role) {
        return res.status(400).json({ message: "Missing userId/patientId or role" });
    }

    // 3. Query the database
    const notifications = await Notification.find({ 
        userId: finalUserId,  
        role: role    
    })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};