import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './DoctorHomeScreen.css';
import { AuthContext } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

function DoctorHomeScreen() {
  const { auth } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const firstName = auth.user?.firstName || 'Doctor';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id); // Assuming 'id' is the field in your token
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []); // The empty array ensures this effect runs only once on mount

  return (
    <div className="doctor-home-container">
      
      <h1>Hi Dr. {firstName}</h1>
      <p>Welcome back! Let's manage appointments and patients records efficiently.</p>
      
      <div className="current-requests-container">
        <Link to="/current-requests"><button className="current-requests-btn">Current Requests</button></Link>
      </div>
      
      <div className="doctor-options">
        <div className="doctor-options-row">
          {userId ? (
            <Link to={`/profile/doctor/${userId}`}><button className="option-btn">Your Profile</button></Link>
          ) : (
            <button className="option-btn" disabled>Your Profile</button>
          )}

          <Link to="/appointment-slots"><button className="option-btn">Appointment Slots</button></Link>
          <Link to="/patient-list"><button className="option-btn">Patient List</button></Link>
        </div>
        <div className="doctor-options-row center-row">
          <Link to="/doctor-analytics"><button className="option-btn">Analytics</button></Link>

          <Link to="/health-blogs"><button className="option-btn">My Health Blogs</button></Link>
          <Link to="/doctor-reviews"><button className="option-btn">Patient's Reviews</button></Link>
        </div>
      </div>
    </div>
  );
}

export default DoctorHomeScreen;