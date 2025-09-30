import React, { useState, useCallback } from 'react';
// 1. Import desired icons from lucide-react
import { ClipboardPlus, PlusCircle, Link as LinkIcon } from 'lucide-react';
import './MedicineForm.css'; // Assuming you have a corresponding CSS file

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

export function MedicineForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showExternalLink, setShowExternalLink] = useState(false);

  // 3. Create a single, generic handler for most form inputs
  // This reduces repetitive code and is more maintainable.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Special handler for medicine select to toggle the external link field
  const handleMedicineChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, medicineName: value }));
    setShowExternalLink(value === 'other');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // A more robust way to check for required fields
    const requiredFields = ['medicineName', 'startDate', 'endDate', 'reason', 'dosage'];
    const isFormValid = requiredFields.every(field => formData[field].trim() !== "");

    if (!isFormValid) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    console.log("Medicine prescription submitted:", formData);
    alert(`${formData.medicineName} has been prescribed successfully.`);
    
    // 4. Reset form using the initial state constant
    setFormData(INITIAL_FORM_STATE);
    setShowExternalLink(false);
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h3 className="form-title">
          {/* 5. Replaced emoji with a professional Lucide icon */}
          <ClipboardPlus className="form-icon" size={24} />
          Prescribe Medicine
        </h3>
      </div>

      <div className="form-content">
        <form onSubmit={handleSubmit} className="medicine-form">
          <div className="form-grid">
            {/* --- Medicine Name --- */}
            <div className="form-group">
              <label className="form-label" htmlFor="medicineName">Medicine Name *</label>
              <select
                id="medicineName"
                name="medicineName" // 6. Added 'name' attribute for the generic handler
                className="form-select"
                value={formData.medicineName}
                onChange={handleMedicineChange}
                required
              >
                <option value="">Select medicine...</option>
                {AVAILABLE_MEDICINES.map((medicine) => (
                  <option key={medicine} value={medicine}>{medicine}</option>
                ))}
                <option value="other">Other (specify with link)</option>
              </select>
            </div>

            {/* --- External Link (Conditional) --- */}
            {showExternalLink && (
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
              <label className="form-label" htmlFor="reason">Reason for Prescription *</label>
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

          <button type="submit" className="submit-button">
            <PlusCircle size={18} />
            Add Prescription
          </button>
        </form>
      </div>
    </div>
  );
}