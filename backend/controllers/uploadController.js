const xlsx = require('xlsx');
const path = require('path');
const Doctor = require('../models/DoctorData'); // Your Mongoose model

exports.getAllDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.find();
		res.status(200).json(doctors);
	} catch (error) {
		console.error('❌ Error fetching doctors:', error.message);
		res.status(500).json({ message: 'Server error while fetching doctors.' });
	}
};

exports.uploadDoctorsFromGoogleSheet = async () => {
    try {
        const filePath = path.join(__dirname, 'doctors.xlsx'); // Excel file must be here
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // assumes first sheet
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);

        if (!rows || rows.length === 0) {
            console.log('ℹ️ Excel file is empty.');
            return;
        }

        const doctors = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const doctor = {
                    firstname: row.firstname || null,
                    lastname: row.lastname || null,
                    imageLink: row.imageLink || null,
                    gender: row.gender || null,
                    email: row.email || null,
                    whatsapp: row.whatsapp || null,
                    dob: row.dob || null,
                    experience: row.experience ? parseFloat(row.experience) : null,
                    location: {
                        pincode: row.pincode || null,
                        specific: row.location || null,
                    },
                    education: {
                        degree: row.degree || null,
                        college: row.college || null,
                    },
                    fee: row.fee ? parseFloat(row.fee) : null,
                    certificateLink: row.certificateLink || null,
                    specialization: row.specialization
                        ? row.specialization.split(',').map((s) => s.trim())
                        : [],
                    introduction: row.introduction || null,
                    languages: row.languages
                        ? row.languages.split(',').map((l) => l.trim())
                        : [],
                    timings: row.timings || null,
                    paymentMethods: row.paymentMethods
                        ? row.paymentMethods.split(',').map((p) => p.trim())
                        : [],
                };

                doctors.push(doctor);
            } catch (rowError) {
                console.warn(`⚠️ Skipping row ${i + 2}: ${rowError.message}`);
            }
        }

        if (doctors.length === 0) {
            console.log('⚠️ No valid doctor data to upload.');
            return;
        }

        await Doctor.insertMany(doctors);
        console.log(`✅ Uploaded ${doctors.length} doctors to MongoDB.`);
    } catch (error) {
        console.error('❌ Failed to upload doctors from Excel:', error.message);
    }
};
