import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrakritiDetermination.css';
import '../SignUpScreen.css';
import { AuthContext } from '../../context/AuthContext';

function PrakritiDetermination() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const patientEmail = auth.user?.email; // Get the patient's email from the authenticated user

  // State for all form fields
  const [physicalTraits, setPhysicalTraits] = useState({
    bodyBuild: '',
    height: '',
    appearance: '',
    skinTexture: '',
    hairType: '',
    voiceQuality: '',
  });

  const [physiologicalTraits, setPhysiologicalTraits] = useState({
    digestion: '',
    bodyTemperature: '',
    thirstLevel: '',
    sleepingPattern: '',
    appetite: '',
    dietaryHabits: '',
  });

  const [psychologicalTraits, setPsychologicalTraits] = useState({
    decisionMakingAbility: '',
    comprehension: '',
  });

  const [behavioralTraits, setBehavioralTraits] = useState({
    politeness: '',
    emotionalStability: '',
  });

  const [isFormValid, setIsFormValid] = useState(false); // Track form validity

  // Validate the form whenever any field changes
  useEffect(() => {
    validateForm();
  }, [physicalTraits, physiologicalTraits, psychologicalTraits, behavioralTraits]);

  // Handle input changes for physical traits
  const handlePhysicalTraitChange = (e, field) => {
    setPhysicalTraits({ ...physicalTraits, [field]: e.target.value });
  };

  // Handle input changes for physiological traits
  const handlePhysiologicalTraitChange = (e, field) => {
    setPhysiologicalTraits({ ...physiologicalTraits, [field]: e.target.value });
  };

  // Handle input changes for psychological traits
  const handlePsychologicalTraitChange = (e, field) => {
    setPsychologicalTraits({ ...psychologicalTraits, [field]: e.target.value });
  };

  // Handle input changes for behavioral traits
  const handleBehavioralTraitChange = (e, field) => {
    setBehavioralTraits({ ...behavioralTraits, [field]: e.target.value });
  };

  // Validate the form to ensure all fields are filled
  const validateForm = () => {
    const isPhysicalTraitsValid = Object.values(physicalTraits).every((value) => value !== '');
    const isPhysiologicalTraitsValid = Object.values(physiologicalTraits).every((value) => value !== '');
    const isPsychologicalTraitsValid = Object.values(psychologicalTraits).every((value) => value !== '');
    const isBehavioralTraitsValid = Object.values(behavioralTraits).every((value) => value !== '');

    setIsFormValid(
      isPhysicalTraitsValid &&
      isPhysiologicalTraitsValid &&
      isPsychologicalTraitsValid &&
      isBehavioralTraitsValid
    );
  };

  // Handle Save button click
  const handleSaveClick = async () => {
    if (!isFormValid) {
      alert('Please fill out all fields before saving.');
      return;
    }

    const prakritiData = {
      patientEmail,
      physicalTraits,
      physiologicalTraits,
      psychologicalTraits,
      behavioralTraits,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prakritiData),
      });

      if (response.ok) {
        alert('Prakriti Determination saved successfully!');
        navigate('/patient-home'); // Navigate to the home page after saving
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save Prakriti Determination.');
      }
    } catch (error) {
      console.error('Error saving Prakriti Determination:', error);
      alert('An error occurred while saving. Please try again.');
    }
  };

  const handleSkipClick = () => {
    navigate('/patient-home'); // Navigate to HomeScreen
  };

  return (
    <div className="signup-container">
      <h1>Prakriti Determination Form</h1>
      <p>Unlock personalized care! Complete our Prakriti determination to find the perfect doctor for you based on your needs.</p>
      <form className="signup-form">
        {/* Physical Traits */}
        <div className="form-section">
          <h2>Physical Traits</h2>
          <div className="form-group">
            <label>Body Build</label>
            <select
              value={physicalTraits.bodyBuild}
              onChange={(e) => handlePhysicalTraitChange(e, 'bodyBuild')}
              required
            >
              <option value="">Select...</option>
              <option value="Thin">Thin</option>
              <option value="Well Built">Well-built</option>
            </select>
          </div>
          <div className="form-group">
            <label>Height</label>
            <select
              value={physicalTraits.height}
              onChange={(e) => handlePhysicalTraitChange(e, 'height')}
              required
            >
              <option value="">Select...</option>
              <option value="Small">Short</option>
              <option value="Medium">Medium</option>
              <option value="Tall">Tall</option>
            </select>
          </div>
          <div className="form-group">
            <label>Appearance (Veins/Tendons)</label>
            <select
              value={physicalTraits.appearance}
              onChange={(e) => handlePhysicalTraitChange(e, 'appearance')}
              required
            >
              <option value="">Select...</option>
              <option value="Prominent">Prominent</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
          <div className="form-group">
            <label>Skin Texture</label>
            <select
              value={physicalTraits.skinTexture}
              onChange={(e) => handlePhysicalTraitChange(e, 'skinTexture')}
              required
            >
              <option value="">Select...</option>
              <option value="Dry">Dry</option>
              <option value="Oily">Oily</option>
              <option value="Combination">Combination</option>
            </select>
          </div>
          <div className="form-group">
            <label>Hair Type</label>
            <select
              value={physicalTraits.hairType}
              onChange={(e) => handlePhysicalTraitChange(e, 'hairType')}
              required
            >
              <option value="">Select...</option>
              <option value="Thin">Thin</option>
              <option value="Thick">Thick</option>
              <option value="Curly">Curly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Voice Quality</label>
            <select
              value={physicalTraits.voiceQuality}
              onChange={(e) => handlePhysicalTraitChange(e, 'voiceQuality')}
              required
            >
              <option value="">Select...</option>
              <option value="Soft">Soft</option>
              <option value="Moderate">Moderate</option>
              <option value="Loud">Loud</option>
            </select>
          </div>
        </div>

        {/* Physiological Traits */}
        <div className="form-section">
          <h2>Physiological Traits</h2>
          <div className="form-group">
            <label>Digestion</label>
            <select
              value={physiologicalTraits.digestion}
              onChange={(e) => handlePhysiologicalTraitChange(e, 'digestion')}
              required
            >
              <option value="">Select...</option>
              <option value="Regular">Regular</option>
              <option value="Irregular">Irregular</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Body Temperature</label>
            <select
              value={physiologicalTraits.bodyTemperature}
              onChange={(e) => handlePhysiologicalTraitChange(e, 'bodyTemperature')}
              required
            >
              <option value="">Select...</option>
              <option value="Feels Cold Easily">Feels Cold Easily</option>
              <option value="Feels Hot Easily">Feels Hot Easily</option>
            </select>
          </div>
          <div className="form-group">
            <label>Thirst Level</label>
            <select
              value={physiologicalTraits.thirstLevel}
              onChange={(e) => handlePhysiologicalTraitChange(e, 'thirstLevel')}
              required
            >
              <option value="">Select...</option>
              <option value="Frequent">Frequent</option>
              <option value="Normal">Normal</option>
              <option value="Intense">Intense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sleeping Pattern (Hours per Night)</label>
            <input
              type="number"
              value={physiologicalTraits.sleepingPattern}
              onChange={(e) => handlePhysiologicalTraitChange(e, 'sleepingPattern')}
              placeholder="e.g., 7"
              required
            />
          </div>
          <div className="form-group">
            <label>Appetite</label>
            <select
              value={physiologicalTraits.appetite}
              onChange={(e) => handlePhysiologicalTraitChange(e, 'appetite')}
              required
            >
              <option value="">Select...</option>
              <option value="Strong">Strong</option>
              <option value="Weak">Weak</option>
              <option value="Irregular">Irregular</option>
            </select>
          </div>
          <div className="form-group">
            <label>Dietary Habits</label>
            <select
              value={physiologicalTraits.dietaryHabits}
              onChange={(e) => handlePhysiologicalTraitChange(e, 'dietaryHabits')}
              required
            >
              <option value="">Select...</option>
              <option value="Heavy">Heavy</option>
              <option value="Medium">Medium</option>
              <option value="Light">Light</option>
            </select>
          </div>
        </div>

        {/* Psychological Traits */}
        <div className="form-section">
          <h2>Psychological Traits</h2>
          <div className="form-group">
            <label>Decision-Making Ability</label>
            <select
              value={psychologicalTraits.decisionMakingAbility}
              onChange={(e) => handlePsychologicalTraitChange(e, 'decisionMakingAbility')}
              required
            >
              <option value="">Select...</option>
              <option value="Often Changes Decision">Often Changes Decision</option>
              <option value="Sometimes Changes Decision">Sometimes Changes Decision</option>
              <option value="Rarely Changes Decision">Rarely Changes Decision</option>
            </select>
          </div>
          <div className="form-group">
            <label>Comprehension/Grasping Power</label>
            <select
              value={psychologicalTraits.comprehension}
              onChange={(e) => handlePsychologicalTraitChange(e, 'comprehension')}
              required
            >
              <option value="">Select...</option>
              <option value="Quick">Quick</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
        </div>

        {/* Behavioral Traits */}
        <div className="form-section">
          <h2>Behavioral Traits</h2>
          <div className="form-group">
            <label>Politeness</label>
            <select
              value={behavioralTraits.politeness}
              onChange={(e) => handleBehavioralTraitChange(e, 'politeness')}
              required
            >
              <option value="">Select...</option>
              <option value="Polite/Humble">Polite/Humble</option>
              <option value="Sometimes Polite">Sometimes Polite</option>
              <option value="Rarely Polite">Rarely Polite</option>
            </select>
          </div>
          <div className="form-group">
            <label>Emotional Stability</label>
            <select
              value={behavioralTraits.emotionalStability}
              onChange={(e) => handleBehavioralTraitChange(e, 'emotionalStability')}
              required
            >
              <option value="">Select...</option>
              <option value="Calm and composed">Calm and composed</option>
              <option value="Balanced">Balanced</option>
              <option value="Rarely Disturbed">Rarely Disturbed</option>
            </select>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="button-container">
          <button type="button" className="skip-btn" onClick={handleSkipClick}>
            Skip →
          </button>
          <button
            type="button"
            className="next-btn"
            onClick={handleSaveClick}
            disabled={!isFormValid}
          >
            Save →
          </button>
        </div>
      </form>
    </div>
  );
}

export default PrakritiDetermination;
