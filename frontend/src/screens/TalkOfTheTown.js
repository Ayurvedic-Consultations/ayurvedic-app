import React, { useState } from 'react';
import './TalkOfTheTown.css';

const DoctorsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const doctors = [
    {
      name: 'Dr. Aditi Sharma',
      specialization: 'Cardiologist',
      experience: '15 years',
      patientsServed: '10K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor1.avif',
      hospital: 'Apollo Hospital',
    },
    {
      name: 'Dr. Rahul Verma', 
      specialization: 'Dermatologist',
      experience: '12 years',
      patientsServed: '8K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor2.avif',
      hospital: 'Fortis Hospital',
    },
    {
      name: 'Dr. Sneha Kapoor',
      specialization: 'Neurologist',
      experience: '10 years',
      patientsServed: '6K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor3.avif',
      hospital: 'Max Healthcare',
    },
    {
      name: 'Dr. Arjun Mehta',
      specialization: 'Orthopedic Surgeon',
      experience: '20 years',
      patientsServed: '12K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor4.avif',
      hospital: 'Medanta Hospital',
    },
    {
      name: 'Dr. Aditi Sharma',
      specialization: 'Cardiologist',
      experience: '15 years',
      patientsServed: '10K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor1.avif',
      hospital: 'Apollo Hospital',
    },
    {
      name: 'Dr. Aditi Sharma',
      specialization: 'Cardiologist',
      experience: '15 years',
      patientsServed: '10K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor1.avif',
      hospital: 'Apollo Hospital',
    },
    {
      name: 'Dr. Aditi Sharma',
      specialization: 'Cardiologist',
      experience: '15 years',
      patientsServed: '10K+',
      thumbnail: 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor1.avif',
      hospital: 'Apollo Hospital',
    },
  ];

  const handleLeftClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? doctors.length - 3 : prevIndex - 1));
  };

  const handleRightClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === doctors.length - 3 ? 0 : prevIndex + 1));
  };

  return (
    <section className="talk-of-the-town">
      <div className="header1">
        <div className="title">Meet Our Doctors</div>
        <div className="gradient-border"></div>
      </div>

      <div className="slider-container">
        <div
          className="slick-slider1"
          style={{ transform: `translateX(-${currentIndex * 340}px)`, transition: 'transform 0.3s ease' }}
        >
          {doctors.map((doctor, index) => (
            <div className="slick-slide1" key={index}>
              <div className="video-card1">
                <div className="video-thumbnail">
                  <img src={doctor.thumbnail} alt={doctor.name} className="thumbnail-img" />
                </div>
                <div className="content">
                  <p className="influencer-name">{doctor.name}</p>
                  <p className="video-title">{doctor.specialization}</p>
                  <div className="separator"></div>
                  <p className="followers">Experience: {doctor.experience}</p>
                  <p className="followers">Patients Served: {doctor.patientsServed}</p>
                  <p className="followers">Hospital: {doctor.hospital}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="arrow-button left" onClick={handleLeftClick}>←</button>
        <button className="arrow-button right" onClick={handleRightClick}>→</button>
      </div>
    </section>
  );
};

export default DoctorsSection;
