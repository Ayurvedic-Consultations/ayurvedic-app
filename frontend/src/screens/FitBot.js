import React, { useState } from "react";
import "./FitBot.css";

// Circular Progress Bar Component
const CircularProgressBar = ({ degree, value, label }) => (
  <div className="circular-progress-bar" style={{ '--degree': `${degree}deg` }}>
    <div className="circular-progress-bar__circle-wrap">
      <div className="circular-progress-bar__circle">
        <div className="circular-progress-bar__mask">
          <div className="circular-progress-bar__fill"></div>
        </div>
        <div className="circular-progress-bar__mask">
          <div className="circular-progress-bar__fill"></div>
        </div>
        <div className="circular-progress-bar__inner-circle">
          <div className="progress-bar-info">
            <div className="progress-bar-value">{value}</div>
            {label && <div className="progress-bar-label">{label}</div>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Video Card Component
const VideoCard = ({ title, description, imageUrl, duration }) => (
  <div className="video-card">
    <div className="video-card__player-wrapper">
      <div
        className="video-card__image"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="video-card__play-icon">
          <i className="icon-play"></i>
        </div>
      </div>
    </div>
    <div className="video-card__details">
      <div className="video-card__title">{title}</div>
      <div className="video-card__description">
        <i className="icon-clock"></i> {duration}
      </div>
    </div>
  </div>
);

// FitBot Component (Main Component)
const FitBot = () => {
  const [sliderValue, setSliderValue] = useState(0);

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
  };

  return (
    <section className="fitbot-section">
      <div className="fitbot-header">
        <div className="fitbot-icon">
          <img
            src="https://res.cloudinary.com/dmezmffej/image/upload/v1698300431/static/fitness/fitbot/fitbot-ai-icon.svg"
            alt="AI Icon"
          />
        </div>
        <div className="fitbot-info">
          <h1 className="fitbot-title">FitBot</h1>
          <p className="fitbot-subheading">Your AI fitness coach</p>
          <p className="fitbot-upgrade">
            Upgrade your fitness with <span className="highlight">real-time</span> insights
          </p>
        </div>
      </div>

      {/* FitBot Stats */}
      <div className="fitbot-stats">
        <CircularProgressBar degree={54} value={30} label="Reps" />
        <CircularProgressBar degree={158.4} value={88} label="Posture score" />
        <CircularProgressBar degree={68.4} value={332} label="Energy out" />
        <CircularProgressBar degree={163.8} value={91} label="Fitness score" />
      </div>

      {/* Video Exercises */}
      <div className="fitbot-exercises">
        <h3 className="fitbot-exercises-title">
          Try these <span className="highlight">FitBot</span> exercises
        </h3>
        <div className="video-slider">
          <VideoCard
            title="Burpees"
            description="High-intensity workout"
            imageUrl="https://res.cloudinary.com/dmezmffej/image/upload/v1695129794/new_motion_work.00_00_34_01.Still005.jpg"
            duration="1 min"
          />
          <VideoCard
            title="Jumping Jacks"
            description="Full-body exercise"
            imageUrl="https://res.cloudinary.com/dmezmffej/image/upload/v1695129793/new_motion_work.00_00_36_22.Still004.jpg"
            duration="1 min"
          />
          {/* Add more VideoCard components as necessary */}
        </div>
      </div>

      {/* Locked Content */}
      <div className="fitbot-locked-content">
        <h4>Unlock FitBot workouts with our plans</h4>
        <input
          type="range"
          className="slider"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
        />
      </div>
    </section>
  );
};

export default FitBot;
