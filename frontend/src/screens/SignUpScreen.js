import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignInScreen.css";
import "./SignUpScreen.css";
import logo from "../media/logo.png";

function SignUpScreen() {
	const navigate = useNavigate();
	const [userType, setUserType] = useState("");

	const handleButton = () => {
		navigate("/signin");
	};

	const handleSignUp = (role) => {
		setUserType(role);
		if (role === "patient") {
			navigate("/signup-patient");
		} else if (role === "doctor") {
			navigate("/signup-doctor");
		} else if (role === "retailer") {
			navigate("/signup-retailer");
		}
	};

	return (
		<div className="signup-screen-container">
			<div className="signin-left">
				<img src={logo} alt="Ayurvedic Logo" className="ayurvedic-logo" />
				<h1 className="left-title">AYURVEDIC </h1>
				<h2> Consultations</h2>
				<div className="outbox">
					<button className="sconsult-btn consult-btn " onClick={handleButton}>
						Consult an Ayurvedic Doctor
						<br />
						Book a Session
					</button>
				</div>
			</div>
			<div className="signin-right">
				<h1 className="right-title">Who are you registering as?</h1>
				<div className="signup-options">
					<button
						className="signup-btn"
						onClick={() => handleSignUp("patient")}
					>
						Patient
					</button>
					<button className="signup-btn" onClick={() => handleSignUp("doctor")}>
						Doctor
					</button>
					<button
						className="signup-btn"
						onClick={() => handleSignUp("retailer")}
					>
						Retailer
					</button>
				</div>
			</div>
		</div>
	);
}

export default SignUpScreen;
