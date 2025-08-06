import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import "./SignInScreen.css";
import logo from "../media/logo.png"; // Import your logo
import { AuthContext } from "../context/AuthContext";

function SignInScreen() {
	const { setAuth } = useContext(AuthContext);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "patient", // Default role, can be changed based on user input
	});

  const [showReset, setShowReset] = useState(false);
  const [resetData, setResetData] = useState({ email: '', newPassword: '' });
	const navigate = useNavigate();

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

  const handleResetChange = (e) => {
    setResetData({
      ...resetData,
      [e.target.name]: e.target.value,
    });
  };

	const handleSignUp = () => {
		navigate("/signup"); // Navigate to the SignUpScreen
	};

	const handleButton = () => {
		navigate("/signin");
	};

	const handleSignIn = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			console.log(formData);

			const result = await response.json();
			if (response.ok) {
				localStorage.setItem("token", result.token);
				localStorage.setItem("email", formData.email);
				localStorage.setItem("role", formData.role);
				setAuth({
					token: result.token,
					user: result.user,
					role: formData.role,
				});

				// Redirect based on role
				switch (formData.role) {
					case "doctor":
						navigate("/doctor-home");
						break;
					case "retailer":
						navigate("/retailer-home");
						break;
					case "patient":
						navigate("/patient-home");
						break;
					case "admin":
						navigate("/admin-home");
						break;
					default:
						navigate("/");
						break;
				}
			} else {
				alert(result.error || "Invalid credentials");
			}
		} catch (error) {
			console.error("Error during sign-in:", error);
		}
	};

  const handleForgotPassword = async () => {
    if (!resetData.email || !resetData.newPassword) {
      alert('Please enter email and new password');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) setShowReset(false);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-left">
        <img src={logo} alt="Ayurvedic Logo" className="ayurvedic-logo" />
        <h1>AYURVEDIC</h1>
        <h2>Consultations</h2>
        <div className='outbox'>
          <button className="sconsult-btn consult-btn" onClick={handleButton}>
            Consult an Ayurvedic Doctor <br /> Book a Session
          </button>
        </div>
      </div>
      <div className="signin-right">
        {!showReset ? (
          <>
            <div className='signin-heading'>Sign in to your account</div>
            <p className='welcome'>Welcome Back! We're happy to see you again</p>

            {/* Form for sign-in, with onSubmit triggering handleSignIn */}
            <form className='signin-form' onSubmit={handleSignIn}>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Mail ID" required />
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" required />

              {/* Role Selection Dropdown */}
              <label htmlFor="role">Select Role:</label>
              <select name="role" value={formData.role} onChange={handleInputChange} required>
                <option value="doctor">Doctor</option>
                <option value="retailer">Retailer</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option> {/* Added Admin Role */}
              </select>

              <a href="#" className="forgot-password" onClick={() => setShowReset(true)}>Forgot Password?</a>
              <button type="submit" className="signin-btn">SIGN IN</button> {/* onSubmit handles this */}
            </form>
            <p>
              Don’t have an account?
              <a href="#" onClick={handleSignUp}> Sign Up</a> {/* Add onClick to handleSignUp */}
            </p>
          </>
        ) : (
          <div className='reset-password-form'>
            <h2>Reset Password</h2>
            <input type="email" name="email" value={resetData.email} onChange={handleResetChange} placeholder="Enter Email" required />
            <input type="password" name="newPassword" value={resetData.newPassword} onChange={handleResetChange} placeholder="Enter New Password" required />
            <button onClick={handleForgotPassword} className="reset-btn">Reset Password</button>
            <button onClick={() => setShowReset(false)} className="back-btn">Back to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignInScreen;
