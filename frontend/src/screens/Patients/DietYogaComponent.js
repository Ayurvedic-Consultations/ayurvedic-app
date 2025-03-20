import React, { useState } from 'react';
import './DietYogaComponent.css';  // Ensure this CSS file is linked in your project

function DietYogaComponent() {
  const [activeTab, setActiveTab] = useState('Diet');
  const [activeFrequency, setActiveFrequency] = useState('Daily');

  return (
    <div className="container">
      <h1>Your Diet and Yoga Plan</h1>
      <div className="tabs">
        <button
          onClick={() => setActiveTab('Diet')}
          className={`tab ${activeTab === 'Diet' ? 'active' : ''}`}
        >
          Diet
        </button>
        <button
          onClick={() => setActiveTab('Yoga')}
          className={`tab ${activeTab === 'Yoga' ? 'active' : ''}`}
        >
          Yoga
        </button>
      </div>

      {activeTab === 'Diet' && (
        <>
          <div className="frequency-tabs">
            <button
              onClick={() => setActiveFrequency('Daily')}
              className={`tab ${activeFrequency === 'Daily' ? 'active' : ''}`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveFrequency('Weekly')}
              className={`tab ${activeFrequency === 'Weekly' ? 'active' : ''}`}
            >
              Weekly
            </button>
          </div>

          {activeFrequency === 'Daily' ? (
            <>
              <h2>Recommended Diet Plan</h2>
              <div className="meal-grid">
                {['Breakfast', 'Lunch', 'Dinner', 'Juices'].map((meal) => (
                  <div key={meal} className="meal">
                    <h3>{meal}</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>Weekly Diet Plan</h2>
              {[
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ].map((day) => (
                <div key={day}>
                  <h3>{day}</h3>
                  <div className="meal-grid">
                    {['Breakfast', 'Lunch', 'Dinner', 'Juices'].map((meal) => (
                      <div key={meal} className="meal">
                        <h4>{meal}</h4>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit, sed do
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          <h2>Ayurvedic Herb Recommendations:</h2>
          <div className="herbs">
            {[
              'Lorem ipsum dolor sit amet,',
              'consectetur adipiscing elit.',
              'Sed ut imperdiet',
              'Pellentesque',
            ].map((herb, index) => (
              <p key={index}>{herb}</p>
            ))}
          </div>
        </>
      )}

      {activeTab === 'Yoga' && (
        <>
          <h2>Yoga Plans</h2>
          <div className="yoga-plans">
            <div className="yoga-session">
              <h3>Morning Yoga Plan</h3>
              <p>
                Start your day with energizing poses to awaken your body and
                mind.
              </p>
            </div>
            <div className="yoga-session">
              <h3>Evening Yoga Plan</h3>
              <p>
                Wind down with relaxing poses to prepare your body for restful
                sleep.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DietYogaComponent;
