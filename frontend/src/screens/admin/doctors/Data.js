const doctor = {
  id: 101,
  name: "Dr. Evelyn Reed",
  email: "evelyn.reed@clinic.com",
  contact: "+1 (555) 0101",
  specialization: "Cardiology",
  experience: 15,
  location: "New York, NY",
  rating: 4.8,
  bio: "Dr. Evelyn Reed is a board-certified cardiologist with over 15 years of experience in diagnosing and treating cardiovascular diseases. She is dedicated to providing personalized care and helping her patients achieve a healthy heart.",
  languages: ["English", "Spanish"],
  research: ["Impact of diet on heart health", "New treatments for arrhythmia"],
  certifications: ["Board Certified in Cardiology", "Fellow of the American College of Cardiology"],
};

const dummyData = {
  prescriptions: [
    {
      id: 1,
      patientName: "John Doe",
      medicine: "Aspirin 81mg",
      dosage: "Once daily",
      date: "2024-10-20",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      medicine: "Metoprolol 25mg",
      dosage: "Twice daily",
      date: "2024-10-18",
    },
  ],
  appointments: [
    {
      id: 1,
      patientName: "Michael Brown",
      date: "2024-10-25",
      time: "10:30 AM",
      reason: "Follow-up",
    },
    {
      id: 2,
      patientName: "Emily Davis",
      date: "2024-10-25",
      time: "02:00 PM",
      reason: "New consultation",
    },
  ],
  feedback: [
    {
      id: 1,
      patientName: "Lisa Chen",
      rating: 5,
      comment: "Dr. Reed is incredibly knowledgeable and compassionate. She took the time to explain everything thoroughly.",
      date: "2024-09-15",
    },
    {
      id: 2,
      patientName: "David Wilson",
      rating: 4,
      comment: "Good experience, but the wait time was a bit long. The care itself was excellent.",
      date: "2024-09-10",
    },
  ],
};

export { doctor, dummyData };
