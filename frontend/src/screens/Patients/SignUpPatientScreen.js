import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPatientScreen.css';

function SignUpPatientScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    age: '',
    gender: '',
    zipCode: '',
    password: '',
    confirmPassword: '', // Added for confirm password
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid = () => {
    return (
      formData.firstName !== "" &&
      formData.lastName !== "" &&
      formData.email !== "" &&
      formData.phone !== "" &&
      formData.dob !== "" &&
      formData.age !== "" &&
      formData.gender !== "" &&
      formData.zipCode !== "" &&
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      formData.password === formData.confirmPassword
    );
  };

  const handleNextClick = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        alert('Registration successful');
        navigate('/patient-home');
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up - Patient</h1>
      <p>Unlock your inner balance. Start your Ayurvedic journey today.</p>
      
      {/* Form with onSubmit */}
      <form className="signup-form" onSubmit={handleNextClick}>
        <div className="form-column">
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange} 
              placeholder="Ram" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              placeholder="Singh" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email ID</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="abc@gmail.com" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              placeholder="0123456789" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Date of Birth (DD/MM/YYYY)</label>
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleInputChange} 
              required 
            />
          </div>
        </div>

        <div className="form-column">
          <div className="form-group">
            <label>Age</label>
            <input 
              type="number" 
              name="age" 
              value={formData.age} 
              onChange={handleInputChange} 
              placeholder="24" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleInputChange} 
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="form-group">
            <label>Zip Code (Location)</label>
            <input 
              type="text" 
              name="zipCode" 
              value={formData.zipCode} 
              onChange={handleInputChange} 
              placeholder="000001" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="Password" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              placeholder="Confirm Password" 
              required 
            />
          </div>
        </div>

        <div className="form-button">
          <button type="submit"
            className="next-btn"
            disabled={!isFormValid()}
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUpPatientScreen;
