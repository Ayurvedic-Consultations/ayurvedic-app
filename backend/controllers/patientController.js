const Patient = require("../models/Patient");
const DietYoga = require("../models/DietYoga");

// Get All Patients (Public)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

// Delete a Patient (Admin or authorized user)
exports.deletePatient = async (req, res) => {
  const { id } = req.params; 

  try {
    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ message: "Failed to delete patient", error: error.message });
  }
};

// Get Single Patient (Public or authorized)
exports.getPatientById = async (req, res) => {
  const { id } = req.params; 

  try {
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ message: "Failed to fetch patient", error: error.message });
  }
};

// Get diet & yoga plan for a specific patient
exports.getPatientDietYoga = async (req, res) => {
  const { patientId } = req.params; // Patient's ID from URL

  try {
    const dietYogaPlan = await DietYoga.findOne({ patient: patientId });

    if (!dietYogaPlan) {
      return res.status(404).json({
        message: "Patient has not subscribed to a diet & yoga plan yet",
      });
    }

    res.status(200).json(dietYogaPlan);
  } catch (error) {
    console.error("Error fetching diet & yoga plan:", error);
    res.status(500).json({
      message: "Failed to fetch diet & yoga plan",
      error: error.message,
    });
  }
};



// // Temporary uploader to add a dummy DietYoga entry with schema validation
// exports.addDietYoga = async (req, res) => {
//   try {
//     const data = req.body;

//     // 1️⃣ Required top-level fields
//     const requiredFields = [
//       "patient",
//       "doctor",
//       "patientEmail",
//       "patientName",
//       "doctorEmail",
//       "doctorName",
//       "bookingId",
//     ];
//     const missingFields = requiredFields.filter((field) => !data[field]);
//     if (missingFields.length > 0) {
//       return res.status(400).json({ message: "Missing required fields", missingFields });
//     }

//     // 2️⃣ Validate diet object if provided
//     if (data.diet) {
//       const dailyMeals = ["breakfast", "lunch", "dinner", "juices"];
//       if (data.diet.daily) {
//         dailyMeals.forEach((meal) => {
//           if (data.diet.daily[meal] && typeof data.diet.daily[meal] !== "string") {
//             return res.status(400).json({ message: `diet.daily.${meal} must be a string` });
//           }
//         });
//       }

//       if (data.diet.weekly) {
//         const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
//         days.forEach((day) => {
//           if (data.diet.weekly[day]) {
//             dailyMeals.forEach((meal) => {
//               if (data.diet.weekly[day][meal] && typeof data.diet.weekly[day][meal] !== "string") {
//                 return res.status(400).json({ message: `diet.weekly.${day}.${meal} must be a string` });
//               }
//             });
//           }
//         });
//       }

//       // Herbs validation
//       if (data.diet.herbs && !Array.isArray(data.diet.herbs)) {
//         return res.status(400).json({ message: "diet.herbs must be an array of strings" });
//       }
//     }
//     // 3️⃣ Validate yoga object if provided
//     if (data.yoga) {
//       if (data.yoga.morningPlan && typeof data.yoga.morningPlan !== "string") {
//         return res.status(400).json({ message: "yoga.morningPlan must be a string" });
//       }
//       if (data.yoga.eveningPlan && typeof data.yoga.eveningPlan !== "string") {
//         return res.status(400).json({ message: "yoga.eveningPlan must be a string" });
//       }
//     }

//     // 4️⃣ Everything valid, create the document
//     const newEntry = new DietYoga(data);
//     await newEntry.save();

//     res.status(201).json({ message: "DietYoga added successfully", dietYoga: newEntry });
//   } catch (error) {
//     console.error("Error adding DietYoga:", error);
//     res.status(500).json({ message: "Failed to add DietYoga", error: error.message });
//   }
// };


