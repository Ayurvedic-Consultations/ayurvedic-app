import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientPage.css"; // Import the CSS file for styling
import { AuthContext } from "../../context/AuthContext";

// Import images for each service category
import doctorImage from "../../media/doctor.png";
import treatmentImage from "../../media/treatment.png";
import yogaImage from "../../media/yoga.jpeg";
import medicineImage from "../../media/medicine.png";
import step1Icon from "../../media/step1.png"; // Import icons for steps
import step2Icon from "../../media/step2.png";
import step3Icon from "../../media/step3.png";
import step4Icon from "../../media/step4.png";

function PatientPage() {
	const { auth, setAuth } = useContext(AuthContext);
	const firstName = auth.user?.firstName || "Patient";
	const navigate = useNavigate();
	const [isPrakritiFilled, setIsPrakritiFilled] = useState(false); // Track if Prakriti form is filled

	// Fetch Prakriti Determination data from the backend
	useEffect(() => {
		const fetchPrakritiData = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/api/prakriti/${auth.user?.email}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
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

	const handleMatchDoctor = () => {
		// Logic to match the doctor automatically
		alert("Matching you with the perfect Ayurvedic doctor...");
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
							<button className="match-btn" onClick={handleMatchDoctor}>
								Match Me Automatically
							</button>
							<p>
								Let us find the perfect Ayurvedic doctor for you based on your
								needs.
							</p>
						</>
					) : (
						<>
							<button className="match-btn" onClick={handleOpenPrakritiForm}>
								Prakriti Determination
							</button>
							<p>
								Kindly complete the Prakriti Determination Form. This will
								enable us to automatically identify the most suitable doctor for
								your needs.
							</p>
						</>
					)}
				</div>

				{/* Key Services Section */}
				<section className="services-section">
					<h2>What can we help you with today?</h2>
					<div className="services-cards">
						<div className="service-card" onClick={goToAppointedDoctor}>
							<img
								src={doctorImage}
								alt="Appointed Doctor"
								className="service-image"
							/>
							<h3>Your Appointed Doctor</h3>
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

				<div className="how-we-work">
					<h2 className="hww-heading">How We Work?</h2>

					<div className="hww-content">
						<div className="hww-step">
							<div className="hww-step-header">
								<img src={step1Icon} alt="Step 1" className="hww-icon" />
								<h3>Step 1: Consultation</h3>
							</div>
							<div className="hww-step-text">
								<p>
									Get a detailed consultation with our expert Ayurvedic doctors.
								</p>
							</div>
						</div>

						<div className="hww-step">
							<div className="hww-step-header">
								<img src={step2Icon} alt="Step 2" className="hww-icon" />
								<h3>Step 2: Diagnosis</h3>
							</div>
							<div className="hww-step-text">
								<p>
									Receive a comprehensive diagnosis based on your health
									profile.
								</p>
							</div>
						</div>

						<div className="hww-step">
							<div className="hww-step-header">
								<img src={step3Icon} alt="Step 3" className="hww-icon" />
								<h3>Step 3: Treatment Plan</h3>
							</div>
							<div className="hww-step-text">
								<p>
									Follow a personalized treatment plan tailored to your needs.
								</p>
							</div>
						</div>

						<div className="hww-step">
							<div className="hww-step-header">
								<img src={step4Icon} alt="Step 4" className="hww-icon" />
								<h3>Step 4: Follow-Up</h3>
							</div>
							<div className="hww-step-text">
								<p>
									Engage in follow-up sessions to track your progress and adjust
									the plan if needed.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export default PatientPage;
