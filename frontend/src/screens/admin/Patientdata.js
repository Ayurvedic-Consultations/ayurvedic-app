// data.js

// Patients Data
const recordsData = [
  {
    _id: "60a123456789abcdef0123456",
    patient: {
      _id: "60a987654321fedcba987654",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-1234",
      dob: "1990-05-15T00:00:00.000Z",
      age: 34,
      gender: "Male",
      zipCode: "90210",
    },
    doctorsConnected: [
      {
        doctor: "60a111111111111111111111",
        feedback: "Great doctor, very helpful.",
        connectedAt: "2024-05-15T10:00:00.000Z",
        prescriptions: [
          {
            medicineName: "Amoxicillin",
            dosage: "500mg/day",
            duration: "7 days",
            _id: "60a123456789abcdef0123457",
          },
        ],
        recommendations: [],
      },{
        doctor: "60a111111111111111111111",
        feedback: "Great doctor, very helpful.",
        connectedAt: "2024-05-15T10:00:00.000Z",
        prescriptions: [
          {
            medicineName: "Amoxicillin",
            dosage: "500mg/day",
            duration: "7 days",
            _id: "60a123456789abcdef0123457",
          },
        ],
        recommendations: [],
      },{
        doctor: "60a111111111111111111111",
        feedback: "Great doctor, very helpful.",
        connectedAt: "2024-05-15T10:00:00.000Z",
        prescriptions: [
          {
            medicineName: "Amoxicillin",
            dosage: "500mg/day",
            duration: "7 days",
            _id: "60a123456789abcdef0123457",
          },
        ],
        recommendations: [],
      },
    ],
    transactions: [
      {
        amount: 75,
        date: "2024-05-15T11:00:00.000Z",
        details: "Consultation fee",
        _id: "60a123456789abcdef0123458",
      },{
        amount: 75,
        date: "2024-05-15T11:00:00.000Z",
        details: "Consultation fee",
        _id: "60a123456789abcdef0123458",
      },{
        amount: 75,
        date: "2024-05-15T11:00:00.000Z",
        details: "Consultation fee",
        _id: "60a123456789abcdef0123458",
      },
    ],
    createdAt: "2024-05-15T10:00:00.000Z",
    updatedAt: "2024-05-15T11:00:00.000Z",
  },
  {
    _id: "60a123456789abcdef0123459",
    patient: {
      _id: "60a987654321fedcba987655",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "555-5678",
      dob: "1995-03-20T00:00:00.000Z",
      age: 29,
      gender: "Female",
      zipCode: "10001",
    },
    doctorsConnected: [],
    transactions: [],
    createdAt: "2024-06-01T09:00:00.000Z",
    updatedAt: "2024-06-01T09:00:00.000Z",
  },
];

// Doctors Data
const doctorsData = [
  {
    _id: "6894b692ca05c5902ca97349",
    firstName: "Amit",
    lastName: "Sharma",
    email: "amit.sharma@hospital.com",
    phone: "+91 9876543210",
    specialization: "Cardiologist",
    experience: 12,
    address: "Apollo Hospital, New Delhi",
    availableDays: ["Monday", "Wednesday", "Friday"],
    fee: 800,
  },
  {
    _id: "7894c123da05c5902ca97350",
    firstName: "Priya",
    lastName: "Mehta",
    email: "priya.mehta@hospital.com",
    phone: "+91 9123456789",
    specialization: "Dermatologist",
    experience: 8,
    address: "Fortis Hospital, Mumbai",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    fee: 600,
  },
  {
    _id: "8894d456ea05c5902ca97351",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@hospital.com",
    phone: "+91 9811122233",
    specialization: "Orthopedic Surgeon",
    experience: 15,
    address: "AIIMS, Delhi",
    availableDays: ["Monday", "Tuesday", "Thursday"],
    fee: 1000,
  },
  {
    _id: "9894e789fa05c5902ca97352",
    firstName: "Neha",
    lastName: "Gupta",
    email: "neha.gupta@hospital.com",
    phone: "+91 9098765432",
    specialization: "Gynecologist",
    experience: 10,
    address: "Medanta Hospital, Gurugram",
    availableDays: ["Wednesday", "Friday", "Sunday"],
    fee: 700,
  },
  {
    _id: "1094f890ba05c5902ca97353",
    firstName: "Arjun",
    lastName: "Verma",
    email: "arjun.verma@hospital.com",
    phone: "+91 9001234567",
    specialization: "Neurologist",
    experience: 18,
    address: "Max Hospital, Bangalore",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    fee: 1200,
  },
];

// Export both
export { recordsData, doctorsData };
