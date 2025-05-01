import React from 'react';
import { useNavigate } from 'react-router-dom';
import v from '../media/mov_bbb.mp4';
import v1 from '../media/v1.mp4';
import './HeroSection.css';

function HeroSection() {
  const navigate = useNavigate();

  const handleConsultButtonClick = () => {
    navigate('/signin');
  };

  return (
    <div className="hero-section" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Background Video */}
      <video autoPlay muted loop className="hero-video" style={{ width: '100%', height: '100%', objectFit: 'cover', marginRight:"-10px" }}>
        <source src={v1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Hero Content */}
      <div className="hero-content" style={{
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>Find Natural Healing with Ayurveda</h2>
        <p style={{ fontSize: '1.5rem', marginTop: '1rem', color:'whitesmoke'}}>Consult Certified Ayurvedic Doctors for Holistic Well-Being</p>


        <button
          className="consult-btn"
          onClick={handleConsultButtonClick}
          style={{
            marginTop: '1.5rem',
            padding: '10px 20px',
            fontSize: '1.2rem',
            backgroundColor: '#8F9F6D',
            color: '#fff',
            border: 'none',
            borderRadius: '5px', 
            cursor: 'pointer'
          }}
        >
          Book Your Appointment Today
        </button>

        {/* Tabbed Navigation */}
      </div>
    </div>
  );
}

export default HeroSection;
