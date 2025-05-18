import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddItem = () => {
	const [file, setFile] = useState(null);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!file) {
			setError("Please upload a zip file.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${process.env.AYURVEDA_BACKEND_URL}/api/medicines/add`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (response.ok) {
				navigate("/my-items");
			} else {
				const data = await response.json();
				setError(data.message || "Failed to add items from zip");
			}
		} catch (error) {
			setError("An error occurred while uploading the zip file");
		}
	};

	return (
		<form className="add-item-form" onSubmit={handleSubmit}>
			{error && <p style={{ color: "red" }}>{error}</p>}

			<div className="add-iten-form-uploader">
				<label htmlFor="file">Upload Zip File (Excel + Images):</label>
				<input
					id="file"
					name="file"
					type="file"
					accept=".zip"
					onChange={handleFileChange}
					required
				/>
			</div>

			<button type="submit">Upload Medicines from Zip</button>
		</form>
	);
};

export default AddItem;
