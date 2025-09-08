const Doctor = require("../models/Doctor");
const DoctorData = require("../models/DoctorData");

// Get All Doctors (Public)
exports.getAllDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.find();

		const doctorsWithQrUrls = doctors.map((doc) => {
			return {
				...doc._doc,
				qrCode: doc.qrCode
					? `${process.env.BASE_URL || "http://localhost:5000"}/${doc.qrCode}`
					: null,
			};
		});

		res.status(200).json(doctorsWithQrUrls);
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch Doctors",
			error: error.message,
		});
	}
};

// Helper function to calculate age from DOB	
const calculateAge = (dob) => {
	if (!dob) return null;
	const birthDate = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
};

// Get All Doctors from both collections (Public)
exports.getAllDoctorsData = async (req, res) => {
	try {
		const doctors = await Doctor.find();
		const doctorData = await DoctorData.find();

		const formattedDoctors = doctors.map((doc) => ({
			_id: doc._id,
			source: "Doctor",
			firstName: doc.firstName,
			lastName: doc.lastName,
			email: doc.email,
			phone: doc.phone,
			age: doc.age,
			gender: doc.gender,
			zipCode: doc.zipCode || doc.location?.pincode || "Not specified",
			designation: doc.designation,
			specialization: Array.isArray(doc.specialization) && doc.specialization.length > 0
				? doc.specialization
				: doc.specialization
					? [doc.specialization]
					: ["Not specified"],
			experience: doc.experience,
			certificate: doc.certificate,
			price: doc.price,
			education: doc.education,
			dob: doc.dob,
			qrCode: doc.qrCode
				? `${process.env.BASE_URL || "http://localhost:5000"}/${doc.qrCode}`
				: null,
		}));

		const formattedDoctorData = doctorData.map((doc) => ({
			_id: doc._id,
			source: "DoctorData",
			firstName: doc.firstname,
			lastName: doc.lastname,
			email: doc.email,
			phone: doc.whatsapp,
			age: calculateAge(doc.dob),
			gender: doc.gender,
			zipCode: doc.location?.pincode || doc.zipCode || "Not specified",
			designation: doc.education?.degree,
			specialization: Array.isArray(doc.specialization) && doc.specialization.length > 0
				? doc.specialization
				: doc.specialization
					? [doc.specialization]
					: ["Not specified"],
			experience: doc.experience,
			certificate: doc.certificateLink,
			price: doc.fee,
			education: doc.education?.college,
			dob: doc.dob,
			qrCode: doc.imageLink
				? `${process.env.BASE_URL || "http://localhost:5000"}/${doc.imageLink}`
				: null,
		}));

		const allDoctors = [...formattedDoctors, ...formattedDoctorData];

		res.status(200).json(allDoctors);
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch Doctors",
			error: error.message,
		});
	}
};

// Get Doctor by ID (Public)
exports.getDoctorById = async (req, res) => {
	const { id } = req.params;

	try {
		let doc = await Doctor.findById(id);

		if (doc) {
			const formattedDoctor = {
				_id: doc._id,
				source: "Doctor",
				firstName: doc.firstName,
				lastName: doc.lastName,
				email: doc.email,
				phone: doc.phone,
				age: doc.age,
				gender: doc.gender,
				zipCode: doc.zipCode || doc.location?.pincode || "Not specified",
				designation: doc.designation,
				specialization: Array.isArray(doc.specialization) && doc.specialization.length > 0
					? doc.specialization
					: doc.specialization
						? [doc.specialization]
						: ["Not specified"],
				experience: doc.experience,
				certificate: doc.certificate,
				price: doc.price,
				education: doc.education,
				dob: doc.dob,
				qrCode: doc.qrCode
					? `${process.env.BASE_URL || "http://localhost:5000"}/${doc.qrCode}`
					: null,
			};
			return res.status(200).json(formattedDoctor);
		}

		doc = await DoctorData.findById(id);

		if (doc) {
			const formattedDoctorData = {
				_id: doc._id,
				source: "DoctorData",
				firstName: doc.firstname,
				lastName: doc.lastname,
				email: doc.email,
				phone: doc.whatsapp,
				age: calculateAge(doc.dob),
				gender: doc.gender,
				zipCode: doc.location?.pincode || doc.zipCode || "Not specified",
				designation: null,
				specialization: Array.isArray(doc.specialization) && doc.specialization.length > 0
					? doc.specialization
					: doc.specialization
						? [doc.specialization]
						: ["Not specified"],
				experience: doc.experience,
				certificate: doc.certificateLink,
				price: doc.fee,
				education: doc.education?.degree,
				dob: doc.dob,
				qrCode: doc.imageLink
					? `${process.env.BASE_URL || "http://localhost:5000"}/${doc.imageLink}`
					: null,
			};
			return res.status(200).json(formattedDoctorData);
		}

		return res.status(404).json({ message: "Doctor not found" });

	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch doctor",
			error: error.message,
		});
	}
};
