import { useState, useCallback, useEffect } from 'react';
import { ClipboardPlus, PlusCircle, Link as LinkIcon, Loader2, Send } from 'lucide-react';
import './MedicineForm.css';

// List of available medicines
const AVAILABLE_MEDICINES = [
	"Paracetamol", "Ibuprofen", "Amoxicillin", "Omeprazole", "Metformin",
	"Lisinopril", "Simvastatin", "Amlodipine", "Aspirin", "Clopidogrel"
];

// 2. Define initial state as a constant for easy form resetting
const INITIAL_FORM_STATE = {
	medicineName: "",
	externalLink: "",
	startDate: "",
	endDate: "",
	reason: "",
	dosage: "",
	instructions: ""
};

// 3. Receive IDs from props
export function MedicineForm({ bookingId, patientId, doctorId }) {
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [availableMedicines, setAvailableMedicines] = useState([]);

	useEffect(() => {
		const fetchAvailableMedicines = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/medicines`,
					{
						method: 'GET',
					}
				);

				if (response.ok) {
					const data = await response.json();

					const medicineNames = data.map(med => med.name);
					setAvailableMedicines(medicineNames);
				} else {
					console.error("Failed to fetch medicines");
				}
			} catch (err) {
				console.error("Network Error while fetching medicines:", err);
			}

		}
		fetchAvailableMedicines();
	}, []);

	// 4. Setup Token, Loading, and Error states
	const token = localStorage.getItem('token');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// 5. Create a single, generic handler for most form inputs
	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	}, []);

	// Determine if the medicine is custom (not in the predefined list)
	const isCustomMedicine = (
		formData.medicineName.trim() !== "" &&
		!availableMedicines.some(m => m.toLowerCase() === formData.medicineName.trim().toLowerCase())
	);

	// 6. The New Submit Function
	const handleSubmit = async (e) => {
		e.preventDefault();

		const requiredFields = ['medicineName', 'startDate', 'endDate', 'reason', 'dosage'];
		const isFormValid = requiredFields.every(field => formData[field].trim() !== "");

		if (!isFormValid) {
			alert("Please fill in all required fields marked with *");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// CHECK THIS ENDPOINT: Ensure this matches your backend route for medicines
			const response = await fetch(
				`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings/supplements`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						bookingId,
						patientId,
						doctorId,
						medicineData: formData
					})
				}
			);

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.message || "Failed to prescribe medicine");
			}

			const data = await response.json();
			console.log("Medicine prescription submitted:", data);
			alert(`${formData.medicineName} has been prescribed successfully.`);

			// Reset form using the initial state constant
			setFormData(INITIAL_FORM_STATE);

		} catch (err) {
			console.error("Submission Error:", err);
			setError(err.message);
			alert(`Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="form-card">
			<div className="form-header">
				<h3 className="form-title">
					<ClipboardPlus className="form-icon" size={24} />
					Prescribe Medicine
				</h3>
			</div>

			<div className="form-content">
				<form onSubmit={handleSubmit} className="medicine-form">
					<div className="form-grid">
						{/* --- Medicine Name (type or choose) --- */}
						<div className="form-group">
							<label className="form-label" htmlFor="medicineName">Medicine Name *</label>
							<input
								id="medicineName"
								name="medicineName"
								className="form-input"
								list="medicineOptions"
								placeholder="Type or choose a medicine"
								value={formData.medicineName}
								onChange={handleChange}
								required
							/>
							<datalist id="medicineOptions">
								{availableMedicines.map((medicine) => (
									<option key={medicine} value={medicine} />
								))}
							</datalist>
							<small className="form-hint">Start typing or pick from suggestions, or enter a custom name.</small>
						</div>

						{/* --- External Link (shows for custom medicines) --- */}
						{isCustomMedicine && (
							<div className="form-group">
								<label className="form-label" htmlFor="externalLink">External Medicine Link</label>
								<div className="input-with-icon">
									<LinkIcon className="input-icon" size={16} />
									<input
										id="externalLink"
										name="externalLink"
										type="url"
										className="form-input"
										placeholder="https://example.com/medicine"
										value={formData.externalLink}
										onChange={handleChange}
									/>
								</div>
							</div>
						)}

						{/* --- Start Date --- */}
						<div className="form-group">
							<label className="form-label" htmlFor="startDate">Start Date *</label>
							<input
								id="startDate"
								name="startDate"
								type="date"
								className="form-input"
								value={formData.startDate}
								onChange={handleChange}
								required
							/>
						</div>

						{/* --- End Date --- */}
						<div className="form-group">
							<label className="form-label" htmlFor="endDate">End Date *</label>
							<input
								id="endDate"
								name="endDate"
								type="date"
								className="form-input"
								value={formData.endDate}
								onChange={handleChange}
								min={formData.startDate}
								required
							/>
						</div>

						{/* --- Dosage --- */}
						<div className="form-group">
							<label className="form-label" htmlFor="dosage">Dosage *</label>
							<input
								id="dosage"
								name="dosage"
								type="text"
								className="form-input"
								placeholder="e.g., 500mg, twice daily"
								value={formData.dosage}
								onChange={handleChange}
								required
							/>
						</div>

						{/* --- Reason --- */}
						<div className="form-group">
							<label className="form-label" htmlFor="reason">Diesease Diagnosed *</label>
							<input
								id="reason"
								name="reason"
								type="text"
								className="form-input"
								placeholder="e.g., Bacterial infection"
								value={formData.reason}
								onChange={handleChange}
								required
							/>
						</div>
					</div>

					{/* --- Instructions --- */}
					<div className="form-group full-width">
						<label className="form-label" htmlFor="instructions">Instructions</label>
						<textarea
							id="instructions"
							name="instructions"
							className="form-textarea"
							placeholder="e.g., Take with food. Complete the full course."
							value={formData.instructions}
							onChange={handleChange}
							rows="3"
						></textarea>
					</div>

					{/* Error Message Display */}
					{error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}

					{/* 7. Updated Button with Loader */}
					<button type="submit" className="submit-button" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
								Adding...
							</>
						) : (
							<>
								<PlusCircle size={18} style={{ marginRight: '8px' }} />
								Add Prescription
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
