import React from 'react';
import {
	Pill,
	CheckCircle2,
	XCircle,
	CalendarDays,
	Clock,
	Info,
	ClipboardList,
	Stethoscope
} from 'lucide-react';
import './PrescriptionHistory.css';

// --- Helper Functions ---

// Formats a date string into a more readable format (e.g., "Sep 28, 2025")
const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

// 1. HELPER FUNCTION: Determines if a prescription course is currently active
const isCourseActive = (dateOfAppointment) => {
	const now = new Date();
	const start = new Date(dateOfAppointment);

	return !(now >= start)
};


// --- Sub-components ---

// A reusable component for displaying a detail item with an icon
const DetailItem = ({ icon: Icon, text }) => (
	<div className="record-item">
		<Icon className="record-item-icon" />
		<span>{text}</span>
	</div>
);

// Renders a single prescription card
const RecordCard = ({ record }) => {
	// 2. Use the helper function to determine active status dynamically
	const isActive = isCourseActive(record.dateOfAppointment);

	const badgeClassName = `record-badge ${isActive ? 'active' : 'completed'}`;
	const cardClassName = `record-card ${!isActive ? 'past-record' : ''}`;

	return (
		<div className={cardClassName}>
			<div className="record-content">
				<p className="record-prescribed-by">
					<Stethoscope className="record-item-icon" />
					<strong style={
						{
							marginBottom:"5px",
							marginLeft:"3px"
						}
					}>Prescribed by {record.doctorName} on {formatDate(record.dateOfAppointment)}
					</strong>
				</p>
				{record.recommendedSupplements ? (
					record.recommendedSupplements.map((supplement) => (
						<div className="record-header" style={{
							display: "flex", flexDirection: "column", border
								: "solid rgb(66, 135, 245, 0.5) 1px", borderRadius: "8px", padding: "8px"
						}}>
							<div className="record-title-group">
								<Pill className="pill-icon" />
								<h4 key={supplement._id} className="record-title"
									style={{ border: "res solid 2px" }}
								>{supplement.medicineName}</h4>
							</div>
							{/* <span className={badgeClassName}>
								{isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
								{isActive ? 'Active' : 'Completed'}
							</span> */}
							<div className="record-details">
								<DetailItem
									icon={CalendarDays}
									// text={`${formatDate(record.startDate)} - ${formatDate(record.endDate)}`}
									text={"Sep 28, 2024 - Oct 28, 2024"}
								/>
								<DetailItem
									icon={Clock}
									text={supplement.dosage}
								/>
								<div className="record-item-block">
									<div className="record-item">
										<Info className="record-item-icon" />
										<p className="record-reason"><strong>Reason:</strong> {supplement.forIllness}</p>
									</div>
								</div>
								<div className="record-item-block">
									<div className="record-item">
										<ClipboardList className="record-item-icon" />
										<p className="record-instructions"><strong>Instructions:</strong> {supplement.instructions}</p>
									</div>
								</div>
							</div>
						</div>
					))
				) : <h4>No Supplements Recommended</h4>}
			</div>
		</div>
	);
};

// --- Main Component ---
export function PrescriptionHistory({ prescriptions, loading }) {
	const validRecords = Array.isArray(prescriptions) ? prescriptions : [];

	const activeRecords = validRecords.filter(record =>
		isCourseActive(record.dateOfAppointment)
	);

	const pastRecords = validRecords.filter(record =>
		!isCourseActive(record.dateOfAppointment)
	);

	console.log("Active Records:", activeRecords);

	return (
		<div className="prescription-history-container">

			{/* Active Prescriptions Section */}
			<div className="history-section-">
				<div className="section-header">
					<h3 className="section-title">
						<CheckCircle2 className="section-icon active-icon" />
						Active Prescriptions ({activeRecords.length})
					</h3>
				</div>
				<div className="record-list">
					{activeRecords.length > 0 ? (
						activeRecords.map((record) => (
							// Use record.id or record._id for the key
							<RecordCard key={record._id} record={record} />
						))
					) : (
						<p className="empty-state">No active prescriptions found.</p>
					)}
				</div>
			</div>

			{/* Past Prescriptions Section */}
			<div className="history-section">
				<div className="section-header">
					<h3 className="section-title">
						<XCircle className="section-icon past-icon" />
						Past Prescriptions ({pastRecords.length})
					</h3>
				</div>
				<div className="record-list">
					{pastRecords.length > 0 ? (
						pastRecords.map((record) => (
							// Use record.id or record._id for the key
							<RecordCard key={record.id} record={record} />
						))
					) : (
						<p className="empty-state">No past prescription records available.</p>
					)}
				</div>
			</div>

		</div>
	);
}
