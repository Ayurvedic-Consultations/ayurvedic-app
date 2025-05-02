import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import './DoctorHomeScreen.css';
import { AuthContext } from '../../context/AuthContext';

function DoctorHomeScreen() {
  const { auth,setAuth } = useContext(AuthContext);
  const firstName = auth.user?.firstName || 'Doctor'
  return (
    <div className="doctor-home-container">
      
      <h1>Hi Dr. {firstName}</h1>
      <p>Welcome back! Let's manage appointments and patients records efficiently.</p>
      
      <div className="current-requests-container">
        <Link to="/current-requests"><button className="current-requests-btn">Current Requests</button></Link>
      </div>
      
      <div className="doctor-options">
        <div className="doctor-options-row">
          <Link to="/appointment-slots"><button className="option-btn">Appointment Slots</button></Link>
          <Link to="/patient-list"><button className="option-btn">Patient List</button></Link>
          <Link to="/doctor-analytics"><button className="option-btn">Analytics</button></Link>
        </div>
        <div className="doctor-options-row center-row">
          <Link to="/health-blogs"><button className="option-btn">My Health Blogs</button></Link>
          <Link to="/doctor-reviews"><button className="option-btn">Patient's Reviews</button></Link>
        </div>
      </div>
    </div>
  );
}

export default DoctorHomeScreen;
