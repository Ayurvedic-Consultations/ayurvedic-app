import React, { useState, useEffect } from 'react';
import './TalkOfTheTown.css';

const DoctorsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors from backend on component mount
  useEffect(() => {
    fetch("http://localhost:8080/api/doctors")
      .then((response) => response.json())
      .then((data) => {
        const mappedDoctors = data.map((doctor) => ({
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.designation || "N/A",
          experience: `${doctor.experience} years`,
          age: `${doctor.age || 'N/A'}`,
          thumbnail: doctor.thumbnail || 'https://res.cloudinary.com/dmezmffej/image/upload/v1722071358/doctor1.avif',
          price: doctor.price || 'N/A',
        }));
        setDoctors(mappedDoctors);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
      });
  }, []);

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
                  <p className="followers">Doctors Age: {doctor.age}</p>
                  <p className="followers">Price: {doctor.price}</p>
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
