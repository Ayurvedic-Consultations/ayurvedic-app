// const PrakritiDetermination = require("../models/PrakritiDetermination");

// // Create a new Prakriti Determination entry
// exports.createPrakritiDetermination = async (req, res) => {
//     const { patientEmail, physicalTraits, physiologicalTraits, psychologicalTraits, behavioralTraits } = req.body;

//     try {
//         // Check if an entry already exists for the patient
//         const existingEntry = await PrakritiDetermination.findOne({ patientEmail });
//         if (existingEntry) {
//             return res.status(400).json({ error: "Prakriti Determination entry already exists for this patient." });
//         }

//         // Create a new entry
//         const newEntry = new PrakritiDetermination({
//             patientEmail,
//             physicalTraits,
//             physiologicalTraits,
//             psychologicalTraits,
//             behavioralTraits,
//         });

//         // Save to the database
//         await newEntry.save();

//         return res.status(201).json({
//             message: "Prakriti Determination entry created successfully",
//             entry: newEntry,
//         });
//     } catch (error) {
//         console.error("Error creating Prakriti Determination entry:", error);
//         return res.status(500).json({ error: "Server error" });
//     }
// };

// // Fetch Prakriti Determination for a specific patient
// exports.getPrakritiDetermination = async (req, res) => {
//     const { patientEmail } = req.params;

//     try {
//         const entry = await PrakritiDetermination.findOne({ patientEmail });
//         if (!entry) {
//             return res.status(404).json({ error: "Prakriti Determination entry not found for this patient." });
//         }

//         return res.status(200).json({
//             message: "Prakriti Determination entry retrieved successfully",
//             entry,
//         });
//     } catch (error) {
//         console.error("Error fetching Prakriti Determination entry:", error);
//         return res.status(500).json({ error: "Server error" });
//     }
// };

// // Update Prakriti Determination for a specific patient
// exports.updatePrakritiDetermination = async (req, res) => {
//     const { patientEmail } = req.params;
//     const updateData = req.body;

//     try {
//         const updatedEntry = await PrakritiDetermination.findOneAndUpdate(
//             { patientEmail },
//             updateData,
//             { new: true }
//         );

//         if (!updatedEntry) {
//             return res.status(404).json({ error: "Prakriti Determination entry not found for this patient." });
//         }

//         return res.status(200).json({
//             message: "Prakriti Determination entry updated successfully",
//             entry: updatedEntry,
//         });
//     } catch (error) {
//         console.error("Error updating Prakriti Determination entry:", error);
//         return res.status(500).json({ error: "Server error" });
//     }
// };

// // Delete Prakriti Determination for a specific patient
// exports.deletePrakritiDetermination = async (req, res) => {
//     const { patientEmail } = req.params;

//     try {
//         const deletedEntry = await PrakritiDetermination.findOneAndDelete({ patientEmail });
//         if (!deletedEntry) {
//             return res.status(404).json({ error: "Prakriti Determination entry not found for this patient." });
//         }

//         return res.status(200).json({
//             message: "Prakriti Determination entry deleted successfully",
//         });
//     } catch (error) {
//         console.error("Error deleting Prakriti Determination entry:", error);
//         return res.status(500).json({ error: "Server error" });
//     }
// };


const PrakritiAssessment = require("../models/PrakritiAssessment");
const Patient = require("../models/Patient");

// 1. Submit or Update an Assessment
exports.submitAssessment = async (req, res) => {
    try {
        const { answers, results } = req.body;
        const patientId = req.user._id || req.user.id;

        const responseArray = Object.keys(answers).map((id) => {
            let type = "";
            if (id.startsWith('k')) type = "kapha";
            else if (id.startsWith('p')) type = "pitta";
            else if (id.startsWith('v')) type = "vata";

            return {
                questionId: id,
                doshaType: type,
                score: answers[id]
            };
        });

        // Use findOneAndUpdate with { upsert: true }
        const assessment = await PrakritiAssessment.findOneAndUpdate(
            { patientId: patientId }, // Search criteria
            {
                responses: responseArray,
                calculatedScores: results.percentages,
                dominantDosha: results.prakritiType,
                isAssessmentComplete: true
            },
            {
                new: true,      // Return the updated doc
                upsert: true,   // Create if it doesn't exist
                runValidators: true // CRITICAL: Validate the Enums before saving
            }
        );

        await Patient.findByIdAndUpdate(patientId, {
            hasTakenAssessment: true,
            lastAssessmentDate: new Date()
        });

        return res.status(200).json({
            message: "Assessment saved/updated successfully",
            assessment
        });
    } catch (error) {
        console.error("Error saving assessment:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// 2. Fetch the latest Assessment for a patient
exports.getPrakritiAssessment = async (req, res) => {
    try {
        // We can find by patientId (extracted from token) or email
        const { patientEmail } = req.body;

        // Find the most recent assessment
        const assessment = await PrakritiAssessment.findOne({
            // If you have patientId in params, use that, otherwise lookup by email via Patient model
            patientId: req.user._id
        }).sort({ createdAt: -1 });

        if (!assessment) {
            return res.status(404).json({ message: "No assessment found" });
        }

        return res.status(200).json(assessment);
    } catch (error) {
        console.error("Error fetching assessment:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// 3. Delete Assessment (Optional)
exports.deleteAssessment = async (req, res) => {
    try {
        await PrakritiAssessment.findByIdAndDelete(req.params.id);

        // Optionally reset patient boolean if no other assessments exist
        const remaining = await PrakritiAssessment.countDocuments({ patientId: req.user.id });
        if (remaining === 0) {
            await Patient.findByIdAndUpdate(req.user.id, { hasTakenAssessment: false });
        }

        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
};