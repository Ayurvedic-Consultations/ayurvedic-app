import React from 'react';
import './Treatments.css';
import { useNavigate } from 'react-router-dom';

function TreatmentsScreen() {
  const navigate = useNavigate();
  const treatments = [
    { category: 'Digestive Health', image: '../images/Digestive Health.png' },
    { category: 'Respiratory Health', image: '../images/Respiratory Health.jpg' },
    { category: 'Skin Care', image: '../images/Skin Care.jpg' },
    { category: 'Joint and Bone Health', image: '../images/Joint & Bone Health.jpg' },
    { category: 'Cardiovascular Health', image: '../images/Cardiovascular Health.jpg' },
    { category: 'Mental Health and Wellness', image: '../images/Mental Health and Wellness.jpg' },
    { category: 'Metabolic and Endocrine Health', image: '../images/Metabolism & Hormonal Health.jpg' },
    { category: 'Immune Support', image: '../images/Fatty Liver Treatment.jpg' },
    { category: "Women's Health", image: '../images/Women Health.jpg' },
    { category: "Men's Health", image: '../images/Mens Health.png' },
    { category: 'Liver and Kidney Health', image: '../images/Liver and Kidney Health.jpg' },
    { category: 'Eye Health', image: '../images/Eye Health.jpg' },
    { category: 'Oral Health', image: '../images/oral health.jpg' },
    { category: 'General Wellness', image: '../images/General Wellness.jpg' },
    { category: 'Infections', image: '../images/infection.jpg' },
    { category: 'Pain Management', image: '../images/Pain Management.jpg' },
  ];

  return (
    <div className="treatmentsScreen">
      <h1>Treatments</h1>
      <div className="grid-container">
        {treatments.map((treatment, index) => (
          <div 
            key={index} 
            className="grid-item" 
            onClick={() => navigate(`/treatment/${encodeURIComponent(treatment.category)}`)}
          >
            <img src={treatment.image} alt={treatment.category} className="treatment-image"/>
            <h2>{treatment.category}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TreatmentsScreen;
