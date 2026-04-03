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
		role: "patient",
	});
	const [passwordResetEmail, setPasswordResetEmail] = useState("");
	const [passwordResetRole, setPasswordResetRole] = useState("patient");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");


	const [showReset, setShowReset] = useState(false);
	const navigate = useNavigate();
	const [showPage, setShowPage] = useState("enterEmail");

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleResetPasswordChange = (e) => {
		setPasswordResetEmail(e.target.value);
	}

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
	/////////////////////////////////////////////////////
	const handleForgotPassword = async () => {
		if (!passwordResetEmail || !passwordResetRole) {
			alert("Please provide both email and role.");
			return;
		}

		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/forgot-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: passwordResetEmail,
					role: passwordResetRole
				}),
			});

			const data = await response.json();

			if (response.ok) {
				alert("OTP has been sent to your registered WhatsApp number.");
				setShowPage("OTPVerification");
			} else {
				alert(data.message || "Failed to initiate password reset.");
			}
		} catch (error) {
			console.error("Forgot Password Error:", error);
			alert("An error occurred. Please try again later.");
		}

	};

	const handleVerifyOtp = async () => {
		if (!otp || otp.length !== 5) {
			alert("Please enter a valid 5-digit OTP.");
			return;
		}

		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/verify-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: passwordResetEmail,
					role: passwordResetRole,
					otp: otp
				}),
			});

			const data = await response.json();

			if (response.ok) {
				alert("OTP Verified successfully!");
				setShowPage("NewPassword");
			} else {
				alert(data.message || "Invalid or expired OTP.");
			}
		} catch (error) {
			console.error("OTP Verification Error:", error);
			alert("An error occurred during verification. Please try again.");
		}
	}

	const handleChangePassword = async () => {
		if (!newPassword || !confirmPassword) {
			alert("Please fill in both password fields.");
			return;
		}

		if (newPassword !== confirmPassword) {
			alert("Passwords do not match. Please try again.");
			return;
		}

		// if (newPassword.length < 6) {
		// 	alert("Password must be at least 6 characters long.");
		// 	return;
		// }

		try {
			const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/reset-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: passwordResetEmail,
					role: passwordResetRole,
					newPassword: newPassword
				}),
			});

			const data = await response.json();

			if (response.ok) {
				alert("Password has been reset successfully!");
				setShowReset(false);
				setShowPage("SignIn");
			} else {
				alert(data.message || "Failed to reset password.");
			}
		} catch (error) {
			console.error("Reset Password Error:", error);
			alert("An error occurred. Please try again.");
		}
	};

	////////////////////////////////////////////////////////
	const enterEmail = () => {
		return (
			<div className='reset-password-form'>
				<h2>Please Enter your Registered Email</h2>

				<div style={{ display: "flex", flexDirection: "column", padding: "15px" }}>
					<input type="email" name="email" value={passwordResetEmail} onChange={handleResetPasswordChange} placeholder="Enter Email" required />
					<label htmlFor="role">Select Role:</label>
					<select name="role" value={passwordResetRole} onChange={(e) => setPasswordResetRole(e.target.value)} required>
						<option value="doctor">Doctor</option>
						<option value="retailer">Retailer</option>
						<option value="patient">Patient</option>
					</select>
				</div>

				<button onClick={() => { setShowReset(false); setShowPage("enterEmail") }} className="reset-btn">Back to Sign In</button>
				<button onClick={handleForgotPassword} className="reset-btn">Reset Password</button>
			</div>
		)
	}

	const OTPVerification = () => {
		return (
			<div className='reset-password-form'>
				<h2>Enter OTP sent to your registered WhatsApp number</h2>

				<div style={{ display: "flex", flexDirection: "column", padding: "15px" }}>
					<input
						type="text"
						name="otp"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						placeholder="Enter OTP"
						style={{ border: "none", padding: "10px", borderRadius: "5px", marginBottom: "15px", fontSize: "16px", textAlign: "center", width: "100%", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
						required
					/>
				</div>

				<button onClick={handleVerifyOtp} className="reset-btn">
					Verify OTP
				</button>
			</div>
		);
	};

	const NewPassword = () => {
		return (
			<div className='reset-password-form'>
				<h2>Set Your New Password</h2>

				<div style={{ display: "flex", flexDirection: "column", padding: "15px" }}>
					<input
						type="password"
						name="newPassword"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder="Enter New Password"
						required
					/>

					<input
						type="password"
						name="confirmPassword"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm New Password"
						required
					/>
				</div>

				<button onClick={handleChangePassword} className="reset-btn">
					Reset Password
				</button>
			</div>
		);
	};
	//////////////////////////////////////////////////////////
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
						<div className='signin-heading'>Login to your account</div>
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
								<option value="admin">Admin</option>
							</select>

							<a href="#" className="forgot-password" onClick={() => setShowReset(true)}>Forgot Password?</a>
							<button type="submit" className="signin-btn">Login</button>
						</form>
						<p>
							Don’t have an account?
							<a href="#" onClick={handleSignUp}> Sign Up</a>
						</p>
					</>
				) : (
					(showPage === "enterEmail" && enterEmail()) ||
					(showPage === "OTPVerification" && OTPVerification()) ||
					(showPage === "NewPassword" && NewPassword())
				)}
			</div>
		</div>
	);
}

export default SignInScreen;
