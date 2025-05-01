import React, { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Patients/SignUpPatientScreen';
import '../SignUpScreen.css'
import { AuthContext } from '../../context/AuthContext';

function SignUpRetailerScreen() {
  const { setAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    licenseNumber: '',
    age: '',
    gender: '',
    zipCode: '',
    password: '',
  });
  const navigate = useNavigate();

  // Handle input change to update formData
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleNextClick = async (e) => {
    e.preventDefault(); // Prevent default form submit behavior
    try {
      alert(JSON.stringify(formData));
      const response = await fetch('http://localhost:8080/api/auth/register/retailer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        setAuth({ token: result.token, user: result.user });
        alert('Registration successful');
        navigate('/retailer-home');
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up - Retailers</h1>
      <p>Unlock your inner balance. Start your Ayurvedic journey today.</p>
      <form className="signup-form" onSubmit={handleNextClick}>
        <div className="form-column">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ram" required/>
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
              placeholder="01/01/2000"
              required
            />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input
              type="number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="242345678"
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
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              placeholder="Male/Female"
              required
            />
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
              placeholder="Password"
              required
            />
          </div>
        </div>

        <div className="form-button">
          <button type="submit" className="next-btn">Sign Up →</button>
        </div>
      </form>
    </div>
  );
}

export default SignUpRetailerScreen;
