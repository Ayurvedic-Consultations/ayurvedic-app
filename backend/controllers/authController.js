const Admin = require('../models/Admin'); // Import Admin model
const Doctor = require('../models/Doctor');
const Retailer = require('../models/Retailer');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPWhatsApp } = require('../scheduler');

// Helper function to generate JWT token
const generateToken = (user) => {
	console.log("generating token : user : ", user.role);
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


		console.log("before token : user - ", user);
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
		registrationNumber,
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
	// if (!certificate || !qrCode) {
	// 	return res.status(400).json({ error: 'Both certificate and qrCode files are required.' });
	// }

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
			registrationNumber,
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
			qrCode,
			role: 'doctor'
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
		const retailer = new Retailer({ firstName, lastName, BusinessName, role: 'retailer', email, phone, dob, licenseNumber, age, gender, zipCode, password: hashedPassword, status: "active" });
		await retailer.save();
		const token = generateToken(retailer);
		res.status(201).json({
			message: 'Retailer registered successfully', token, user: {
				id: retailer._id,
				firstName: retailer.firstName,
				lastName: retailer.lastName,
				role: 'retailer',
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
		const patient = new Patient({ firstName, lastName, email, phone, dob, role: 'patient', age, gender, zipCode, password: hashedPassword });
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


// Password reset email verification and OTP generation
const modelMap = {
	patient: Patient,
	doctor: Doctor,
	retailer: Retailer
};
exports.handleForgotPassword = async (req, res) => {
	try {
		const { email, role } = req.body;

		// 1. Select the correct model based on role
		const Model = modelMap[role];
		if (!Model) {
			return res.status(400).json({ message: "Invalid role selected." });
		}

		// 2. Check if email exists
		const user = await Model.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "No account found with that email address." });
		}

		// 3. Generate 5-digit Numeric OTP
		const otp = Math.floor(10000 + Math.random() * 90000).toString();

		// 4. Save to Database with 15-minute expiry
		user.resetPasswordOTP = otp;
		user.resetPasswordOTPExpires = Date.now() + 15 * 60 * 1000; // 15 mins
		user.isOTPVerified = false;
		await user.save();

		// 5. Trigger WhatsApp Message
		const userPhone = user.phone.toString();

		// await sendOTPWhatsApp(userPhone, user.firstName, otp);

		return res.status(200).json({
			message: "Success! OTP sent to WhatsApp.",
		});

	} catch (error) {
		console.error("Forgot Password Controller Error:", error);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

// OTP verification for password reset
exports.verifyOTP = async (req, res) => {
	try {
		const { email, role, otp } = req.body;

		// 1. Identify the correct collection
		const Model = modelMap[role];
		if (!Model) {
			return res.status(400).json({ message: "Invalid role provided." });
		}

		// 2. Find the user
		const user = await Model.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		// 3. Check if OTP exists and matches
		if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
			return res.status(400).json({ message: "Invalid OTP. Please check your WhatsApp." });
		}

		// 4. Check if OTP has expired (Current time > Expiry time)
		if (new Date() > user.resetPasswordOTPExpires) {
			return res.status(400).json({ message: "OTP has expired. Please request a new one." });
		}

		// 5. Success! "Unlock" the password change permission
		user.isOTPVerified = true;
		// Optional: You can clear the OTP now or wait until the password is changed
		await user.save();

		return res.status(200).json({
			message: "OTP verified successfully. You can now reset your password."
		});

	} catch (error) {
		console.error("Verify OTP Error:", error);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

// Final password reset after OTP verification
exports.resetPassword = async (req, res) => {
	try {
		const { email, role, newPassword } = req.body;

		const Model = modelMap[role];
		if (!Model) return res.status(400).json({ message: "Invalid role." });

		// 1. Find user and check the verification flag
		const user = await Model.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		// CRITICAL SECURITY CHECK
		if (!user.isOTPVerified) {
			return res.status(403).json({
				message: "Security violation: OTP was not verified for this account."
			});
		}

		// 2. Hash the new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// 3. Update the user and CLEAR ALL RESET FIELDS
		user.password = hashedPassword;
		user.resetPasswordOTP = null;
		user.resetPasswordOTPExpires = null;
		user.isOTPVerified = false;

		await user.save();

		return res.status(200).json({
			message: "Success! Your password has been updated. You can now log in."
		});

	} catch (error) {
		console.error("Final Reset Error:", error);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};