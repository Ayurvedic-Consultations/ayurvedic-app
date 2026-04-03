import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientPage.css"; // Import the CSS file for styling
import { AuthContext } from "../../context/AuthContext";

// Import images for each service category
// import appointmentImage from "../../media/doctor.png";
import appointmentImage from "../../media/appoint3.jpg";
import doctorImage from "../../media/appoint1.jpg";
import treatmentImage from "../../media/tre-plan.jpg";
// import yogaImage from "../../media/yoga.jpeg";
// import medicineImage from "../../media/remedies.jpg";
import medicineImage from "../../media/capsule.jpg";
// import medicineImage from "../../media/medicine.png";
import yogaImage from "../../media/yoga-diet.jpg";
import { jwtDecode } from 'jwt-decode';
import PrakritiAssessment from "./PrakritiAssessment";

//import step1Icon from "../../media/step1.png"; // Import icons for steps
//import step2Icon from "../../media/step2.png";
//import step3Icon from "../../media/step3.png";
//import step4Icon from "../../media/step4.png";

function PatientPage() {
	const { auth, setAuth } = useContext(AuthContext);
	const firstName = auth.user?.firstName || "Patient";
	const navigate = useNavigate();
	const [isPrakritiFilled, setIsPrakritiFilled] = useState(false); // Track if Prakriti form is filled
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				setUserId(decodedToken.id);
			} catch (error) {
				console.error("Invalid token:", error);
			}
		}
	}, []);

	const goToPrakritiAssessment = () => {
		navigate("/PrakritiAssessment");
	};

	const viewPrakritiResult = () => {
		// We navigate and pass a state 'viewResult: true'
		navigate("/PrakritiAssessment", { state: { viewResult: true } });
	};

	// Fetch Prakriti Determination data from the backend
	useEffect(() => {
		const token = localStorage.getItem('token');
		const fetchPrakritiData = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/prakriti/assessment/getall`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify({ patientEmail: auth.user?.email }), // Send email in the request body
					}
				);

				if (response.ok) {
					const data = await response.json();
					console.log("Prakriti Determination data:", data);
					if (data) {
						setIsPrakritiFilled(true); // Prakriti form is filled
					}
				} else {
					setIsPrakritiFilled(false); // Prakriti form is not filled
				}
			} catch (error) {
				console.error("Error fetching Prakriti Determination data:", error);
				setIsPrakritiFilled(false); // Assume form is not filled in case of error
			}
		};

		if (auth.user?.email) {
			fetchPrakritiData(); // Fetch data only if the user is logged in
		}
	}, [auth.user?.email]);

	const goToAppointedDoctor = () => {
		navigate("/appointed-doctor"); // Navigate to the appointed doctor page
	};

	const goToProfile = () => {
		navigate(`/profile/patient/${userId}`);
	};

	const goToTreatmentPlans = () => {
		navigate("/treatments"); // Navigate to the treatment plans page
	};

	const goToYogaAndDiet = () => {
		navigate("/diet-yoga"); // Navigate to Yoga and Diet page
	};

	const goToMedicines = () => {
		navigate("/medicines"); // Navigate to the Ayurvedic medicines page
	};

	const handleOpenPrakritiForm = () => {
		navigate("/prakritidetermination"); // Redirect to Prakriti Determination form page
	};

	return (
		<div className="patient-container">
			<main className="content">
				<h1>Hi {firstName}!</h1>
				<p>
					Welcome back to your Ayurvedic wellness journey. We're here to help
					you achieve balance and harmony in your life.
				</p>

				{/* Match Doctor Automatically Button */}
				<div className="match-section">
					{isPrakritiFilled ? (
						<>
							<p style={{ textAlign: "center" }}> Thank you for filling the prakriti determination form.</p>
							<button className="match-btn" onClick={viewPrakritiResult}>
								View Your Prakriti Result
							</button>

						</>
					) : (
						<>
							<p style={{ textAlign: "center" }}>
								Kindly complete the Prakriti Determination Form. This will enable
								us to automatically identify the most suitable doctor for your
								needs.
							</p>
							<button className="match-btn" onClick={goToPrakritiAssessment}>
								Prakriti Assesment
							</button>
						</>
					)}
				</div>

				{/* Key Services Section */}
				<section className="services-section">
					<h2>What can we help you with today?</h2>
					<div className="services-cards">
						<div className="service-card" onClick={goToProfile}>
							<img
								src={doctorImage}
								alt="Appointed Doctor"
								className="service-image"
							//   style={{ width: '280px', height: '180px' }}
							/>
							<h3>Your Profile</h3>
							<p>
								View and update your details.
							</p>
						</div>
						<div className="service-card" onClick={goToAppointedDoctor}>
							<img
								src={appointmentImage}
								alt="Appointed Doctor"
								className="service-image"
							/>
							<h3>Appointments</h3>
							<p>
								View the details of your currently assigned Ayurvedic doctor.
							</p>
						</div>
						<div className="service-card" onClick={goToTreatmentPlans}>
							<img
								src={treatmentImage}
								alt="Treatment Plans"
								className="service-image"
							/>
							<h3>Treatment Plans</h3>
							<p>
								Explore personalized Ayurvedic treatment plans designed for your
								needs.
							</p>
						</div>
						<div className="service-card" onClick={goToYogaAndDiet}>
							<img
								src={yogaImage}
								alt="Yoga & Diet"
								className="service-image"
								style={{ width: '380px', height: '200px' }}
							/>
							<h3>Yoga & Diet</h3>
							<p>
								Discover Ayurvedic yoga practices and diet recommendations for
								better health.
							</p>
						</div>
						<div className="service-card" onClick={goToMedicines}>
							<img
								src={medicineImage}
								alt="Medicines & Remedies"
								className="service-image"
							/>
							<h3>Medicines & Remedies</h3>
							<p>
								Browse our selection of Ayurvedic medicines and natural
								remedies.
							</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

export default PatientPage;
