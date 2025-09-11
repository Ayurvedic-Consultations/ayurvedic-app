const Admin = require('../models/Admin'); // Import Admin model
const Doctor = require('../models/Doctor');
const Retailer = require('../models/Retailer');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (user) => {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register Admin (Manually done by an existing admin)
exports.registerAdmin = async (req, res) => {
	const { firstName, lastName, email, phone, password } = req.body;

	try {
		const existingAdmin = await Admin.findOne({ email });
		if (existingAdmin) {
			return res.status(400).json({ error: 'Admin already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const admin = new Admin({ firstName, lastName, email, phone, password: hashedPassword, role: 'admin' });

		await admin.save();
		const token = generateToken(admin);

		res.status(201).json({
			message: 'Admin registered successfully', token, user: {
				id: admin._id,
				firstName: admin.firstName,
				lastName: admin.lastName,
				role: 'admin',
			}
		});
	} catch (error) {
		res.status(500).json({ error: 'Registration failed' });
	}
};

// Login User (Including Admin)
exports.loginUser = async (req, res) => {
	const { email, password, role } = req.body;
	let user;

	try {
		if (role === 'doctor') {
			user = await Doctor.findOne({ email });
		} else if (role === 'retailer') {
			user = await Retailer.findOne({ email });
		} else if (role === 'patient') {
			user = await Patient.findOne({ email });
		} else if (role === 'admin') {
			user = await Admin.findOne({ email });
		}

		if (!user) {
			return res.status(400).json({ message: 'User not found' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const token = generateToken(user);
		res.status(200).json({
			message: 'Login successful', token, user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				role,
			}
		});
	} catch (error) {
		res.status(500).json({ error: 'Login failed' });
	}
};

// Register a new doctor
exports.registerDoctor = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		phone,
		dob,
		age,
		experience,
		specialization,
		gender,
		zipCode,
		education,
		designation,
		price,
		password
	} = req.body;
	const certificate = req.files?.certificate ? req.files.certificate[0].path : null;
	const qrCode = req.files?.qrCode ? req.files.qrCode[0].path : null;

	// Check if files are uploaded
	if (!certificate || !qrCode) {
		return res.status(400).json({ error: 'Both certificate and qrCode files are required.' });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		let specializationArray = [];
		if (specialization) {
			specializationArray = Array.isArray(specialization)
				? specialization
				: specialization.split(",").map(item => item.trim());
		} else {
			specializationArray = [];
		}
		const doctor = new Doctor({
			firstName,
			lastName,
			email,
			phone,
			dob,
			age,
			experience,
			gender,
			specialization: specializationArray, 
			zipCode,
			education,
			designation,
			price,
			password: hashedPassword,
			certificate,
			qrCode
		});
		await doctor.save();
		const token = generateToken(doctor);
		res.status(201).json({
			message: 'Doctor registered successfully', token, user: {
				id: doctor._id,
				firstName: doctor.firstName,
				lastName: doctor.lastName,
				role: 'doctor',
			},
		});
	} catch (error) {
		res.status(500).json({ error: 'Registration failed' });
	}
};

// Register a new retailer
exports.registerRetailer = async (req, res) => {
	console.log("Registering retailer with data:", req.body);
	const { firstName, lastName, BusinessName, email, phone, dob, licenseNumber, age, gender, zipCode, password } = req.body;

	try {
		console.log("Creating retailer:", firstName, lastName, BusinessName, email);
		const hashedPassword = await bcrypt.hash(password, 10);
		const retailer = new Retailer({ firstName, lastName, BusinessName, email, phone, dob, licenseNumber, age, gender, zipCode, password: hashedPassword, status:"active" });
		await retailer.save();
		const token = generateToken(retailer);
		res.status(201).json({
			message: 'Retailer registered successfully', token, user: {
				id: retailer._id,
				firstName: retailer.firstName,
				lastName: retailer.lastName,
				role: 'doctor',
			},
		});
	} catch (error) {
		res.status(500).json({ error: 'Registration failed' });
	}
};

// Register a new patient
exports.registerPatient = async (req, res) => {
	const { firstName, lastName, email, phone, dob, age, gender, zipCode, password } = req.body;

	try {
		console.log("Registering patient:", firstName, lastName, email);
		const hashedPassword = await bcrypt.hash(password, 10);
		const patient = new Patient({ firstName, lastName, email, phone, dob, age, gender, zipCode, password: hashedPassword });
		await patient.save();
		const token = generateToken(patient);
		console.log("Patient registered successfully:", patient);
		res.status(201).json({
			message: 'Patient registered successfully', token, user: {
				id: patient._id,
				firstName: patient.firstName,
				lastName: patient.lastName,
				role: 'patient',
			},
		});
	} catch (error) {
		console.error("Error registering patient:", error);
		res.status(500).json({ error: 'Registration failed' });
	}
};
