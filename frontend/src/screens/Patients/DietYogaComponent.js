import React, { useState, useEffect } from 'react';
import './DietYogaComponent.css';  // Ensure this CSS file is linked in your project

function DietYogaComponent() {
  const [activeTab, setActiveTab] = useState('Diet');
  const [activeFrequency, setActiveFrequency] = useState('Daily');
  const [diet, setDiet] = useState({
    daily: { breakfast: '', lunch: '', dinner: '', juices: '' },
    weekly: {
      monday: { breakfast: '', lunch: '', dinner: '', juices: '' },
      tuesday: { breakfast: '', lunch: '', dinner: '', juices: '' },
      wednesday: { breakfast: '', lunch: '', dinner: '', juices: '' },
      thursday: { breakfast: '', lunch: '', dinner: '', juices: '' },
      friday: { breakfast: '', lunch: '', dinner: '', juices: '' },
      saturday: { breakfast: '', lunch: '', dinner: '', juices: '' },
      sunday: { breakfast: '', lunch: '', dinner: '', juices: '' },
    },
    herbs: [],
  });
  const [yoga, setYoga] = useState({
    morningPlan: '',
    eveningPlan: '',
  });

  // Fetch the diet and yoga plan for the patient
  useEffect(() => {
    const fetchDietYogaPlan = async () => {
      try {
        const patientEmail = localStorage.getItem('email'); // Assuming the patient's email is stored in localStorage
        const token = localStorage.getItem('token'); // Retrieve the authentication token

        if (!token) {
          throw new Error('Authentication token is missing.');
        }

        const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/diet-yoga/patient/${patientEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch diet and yoga plan');
        }

        const data = await response.json();
        if (data.diet) setDiet(data.diet);
        if (data.yoga) setYoga(data.yoga);
      } catch (error) {
        console.error('Error fetching diet and yoga plan:', error);
      }
    };

    fetchDietYogaPlan();
  }, []);

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
                    <p>{diet.daily[meal.toLowerCase()] || 'No recommendation available.'}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>Weekly Diet Plan</h2>
              {Object.entries(diet.weekly).map(([day, plan]) => (
                <div key={day}>
                  <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                  <div className="meal-grid">
                    {['Breakfast', 'Lunch', 'Dinner', 'Juices'].map((meal) => (
                      <div key={meal} className="meal">
                        <h4>{meal}</h4>
                        <p>{plan[meal.toLowerCase()] || 'No recommendation available.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          <h2>Ayurvedic Herb Recommendations:</h2>
          <div className="herbs">
            {diet.herbs.length > 0 ? (
              diet.herbs.map((herb, index) => (
                <p key={index}>{herb}</p>
              ))
            ) : (
              <p>No herb recommendations available.</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'Yoga' && (
        <>
          <h2>Yoga Plans</h2>
          <div className="yoga-plans">
            <div className="yoga-session">
              <h3>Morning Yoga Plan</h3>
              <p>{yoga.morningPlan || 'No morning yoga plan available.'}</p>
            </div>
            <div className="yoga-session">
              <h3>Evening Yoga Plan</h3>
              <p>{yoga.eveningPlan || 'No evening yoga plan available.'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DietYogaComponent;
