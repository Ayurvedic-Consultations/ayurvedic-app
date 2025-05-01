import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../Patients/SignUpPatientScreen.css";
import "../SignUpScreen.css";
import "./SignUpDoctorScreen.css";
import { AuthContext } from "../../context/AuthContext";

function SignUpDoctorScreen() {
	const { setAuth } = useContext(AuthContext);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dob: "",
		age: "",
		experience: "",
		gender: "",
		zipCode: "",
		education: "",
		designation: "",
		price: "",
		password: "",
		confirmPassword: "", // Added confirmPassword for validation
	});

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

	const [certificate, setCertificate] = useState(null);
	const navigate = useNavigate();

	// Handle input change
	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	// Handle file input
	const handleFileChange = (e) => {
		setCertificate(e.target.files[0]);
	};

	// Handle form submission
	const handleNextClick = async (e) => {
		e.preventDefault(); // Prevents the form from submitting automatically

		// Check if passwords match
		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		// Validate file upload
		if (!certificate) {
			alert("Please upload your ayurvedic degree certificate.");
			return;
		}

		if (certificate.size > 5 * 1024 * 1024) {
			alert("File size exceeds 5MB limit");
			return;
		}

		// Create FormData object for file upload
		const data = new FormData();
		Object.keys(formData).forEach((key) => {
			data.append(key, formData[key]);
		});
		data.append("certificate", certificate);

		try {
			const response = await fetch(
				"http://localhost:8080/api/auth/register/doctor",
				{
					method: "POST",
					body: data,
				}
			);

			const result = await response.json();
			if (response.ok) {
				localStorage.setItem("token", result.token);
				setAuth({ token: result.token, user: result.user });
				alert("Registration successful");
				navigate("/doctor-home");
			} else {
				alert(result.error || "Something went wrong");
			}
		} catch (error) {
			console.error("Error during registration:", error);
		}
	};

	return (
		<div className="signup-container">
			<h1>Sign Up - Doctor</h1>
			<p>Expand your practice. Reach new patients seeking ayurvedic care.</p>

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
						<label>Experience (in years)</label>
						<input
							type="number"
							name="experience"
							value={formData.experience}
							onChange={handleInputChange}
							placeholder="24"
							required
						/>
					</div>
				</div>

				<div className="form-column">
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
						<label>Education (College)</label>
						<input
							type="text"
							name="education"
							value={formData.education}
							onChange={handleInputChange}
							placeholder="Ayurvedic College"
							required
						/>
					</div>
					<div className="form-group">
						<label>Designation</label>
						<input
							type="text"
							name="designation"
							value={formData.designation}
							onChange={handleInputChange}
							placeholder="Vaidya"
							required
						/>
					</div>
					<div className="form-group">
						<label>Price</label>
						<input
							type="number"
							name="price"
							value={formData.price}
							onChange={handleInputChange}
							placeholder="250"
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

				<div className="form-group fileupload">
					<label>Upload Ayurvedic Degree Certificate</label>
					<input
						type="file"
						accept=".png, .jpg, .jpeg"
						onChange={handleFileChange}
						required
					/>
					<p className="file-info">
						Supported file formats: png, jpg. File size limit: 5MB
					</p>
				</div>

				<div className="form-button">
					<button type="submit" className="next-btn" disabled={!isFormValid()}>
						Next →
					</button>
				</div>
			</form>
		</div>
	);
}

export default SignUpDoctorScreen;
