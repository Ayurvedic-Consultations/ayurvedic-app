import { useState, useEffect } from "react";
import React from "react";
import "./Precription.css";
import { Pill } from "lucide-react";

const DoctorPrescriptions = ({ doctorId }) => {
	const [doctorBookings, setDoctorBookings] = useState([]);
	const [loadingBookings, setLoadingBookings] = useState(true);

	// ✅ Fetch all bookings for a doctor
	useEffect(() => {
		const fetchDoctorBookings = async () => {
			try {
				const res = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/doctor/${doctorId}`
				);

				if (!res.ok) {
					if (res.status === 404) {
						setDoctorBookings([]);
						return;
					}
					throw new Error("Failed to fetch doctor bookings");
				}

				const data = await res.json();
				setDoctorBookings(data.bookings);
			} catch (error) {
				console.error("❌ Error fetching doctor bookings:", error);
			} finally {
				setLoadingBookings(false);
			}
		};

		if (doctorId) fetchDoctorBookings();
	}, [doctorId]);

	return (
		<div className="card prescriptions-card">
			<h3>
				<Pill size={20} /> Medicines Prescribed
			</h3>

			{loadingBookings ? (
				<p>Loading prescriptions...</p>
			) : doctorBookings.length > 0 ? (
				doctorBookings.map((booking) =>
					booking.recommendedSupplements?.length > 0 ? (
						booking.recommendedSupplements.map((s, idx) => (
							<div key={s._id || idx} className="sub-card" style={{ width: "100%" }}>
								<div className="sub-card-header">
									<h4>{s.medicineName}</h4>
									<span className="dosage">{s.dosage}</span>
								</div>
								<div className="prescription-details">
									<div>
										<p className="label">Duration</p>
										<p>{s.duration}</p>
									</div>
									<div>
										<p className="label">Instructions</p>
										<p>{s.instructions}</p>
									</div>
									<div>
										<p className="label">For Illness</p>
										<p>{s.forIllness}</p>
									</div>
									<div>
										<p className="label">Patient Name</p>
										<p>{booking.patientName}</p>
									</div>
								</div>
								<p className="prescribed-date">
									<span role="img" aria-label="clock">
										⏱
									</span>{" "}
									Prescribed on{" "}
									{new Date(booking.createdAt).toLocaleDateString()}
								</p>
							</div>
						))
					) : (
						<p key={booking._id} className="no-prescriptions">
							No prescriptions have been issued for {booking.patientName}.
						</p>
					)
				)
			) : (
				<p className="no-prescriptions">
					No prescriptions have been issued for this doctor’s patients.
				</p>
			)}
		</div>
	);
};

export default DoctorPrescriptions;
