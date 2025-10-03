import React from "react";
import { Briefcase, GraduationCap } from "lucide-react";
import "./DoctorDetails.css";

const DetailsTab = ({ doctor }) => {
	if (!doctor) return null;

	return (
		<div className="card">
			<h3>
				<Briefcase size={20} /> Professional Details
			</h3>
			<div className="profile-details">
				{/* Education & Certifications */}
				<div className="detail-item">
					<h4>
						<GraduationCap size={16} /> Education & Certificate
					</h4>
					<ul>
						<li>
							<span className="label">Education:</span>{" "}
							{doctor.education || "Not specified"}
						</li>
						{/* <li>
							<span className="label">Certificate:</span>{" "}
							{doctor.certificate ? (
								<a
									href={doctor.certificate}
									target="_blank"
									rel="noopener noreferrer"
								>
									View Certificate
								</a>
							) : (
								"Not provided"
							)}
						</li> */}
						<li>
							<span className="label">Certificate:</span>{" "}
							{doctor.designation ? (
								doctor.designation
							) : (
								"Not provided"
							)}
						</li>
					</ul>
				

				{/* Professional Info */}
				<div className="detail-item">
					<h4>
						<Briefcase size={16} /> Professional Info
					</h4>
					<p>
						<span className="label">Specialization:</span>{" "}
						{doctor.specialization?.length > 0
							? doctor.specialization.join(", ")
							: "Not specified"}
					</p>
					<p>
						<span className="label">Experience:</span>{" "}
						{doctor.experience || 0} years
					</p>
					<p>
						<span className="label">Zip Code:</span>{" "}
						{doctor.zipCode || "Not specified"}
					</p>
				</div>

				</div>
			</div>
		</div>
	);
};

export default DetailsTab;
