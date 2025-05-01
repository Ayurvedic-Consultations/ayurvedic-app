const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Retailer = require('../models/Retailer');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin'); // Import Admin model

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // Find user in any of the models
    const users = await Promise.allSettled([
      Admin.findById(decoded.id).then(user => user && { ...user.toObject(), role: 'admin' }),
      Doctor.findById(decoded.id).then(user => user && { ...user.toObject(), role: 'doctor' }),
      Retailer.findById(decoded.id).then(user => user && { ...user.toObject(), role: 'retailer' }),
      Patient.findById(decoded.id).then(user => user && { ...user.toObject(), role: 'patient' }),
    ]);

    // Extract the first valid user
    const user = users.find(result => result.status === 'fulfilled' && result.value)?.value;

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

module.exports = auth;
