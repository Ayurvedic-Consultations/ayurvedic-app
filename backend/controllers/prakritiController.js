const PrakritiDetermination = require("../models/PrakritiDetermination");

// Create a new Prakriti Determination entry
exports.createPrakritiDetermination = async (req, res) => {
    const { patientEmail, physicalTraits, physiologicalTraits, psychologicalTraits, behavioralTraits } = req.body;

    try {
        // Check if an entry already exists for the patient
        const existingEntry = await PrakritiDetermination.findOne({ patientEmail });
        if (existingEntry) {
            return res.status(400).json({ error: "Prakriti Determination entry already exists for this patient." });
        }

        // Create a new entry
        const newEntry = new PrakritiDetermination({
            patientEmail,
            physicalTraits,
            physiologicalTraits,
            psychologicalTraits,
            behavioralTraits,
        });

        // Save to the database
        await newEntry.save();

        return res.status(201).json({
            message: "Prakriti Determination entry created successfully",
            entry: newEntry,
        });
    } catch (error) {
        console.error("Error creating Prakriti Determination entry:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Fetch Prakriti Determination for a specific patient
exports.getPrakritiDetermination = async (req, res) => {
    const { patientEmail } = req.params;

    try {
        const entry = await PrakritiDetermination.findOne({ patientEmail });
        if (!entry) {
            return res.status(404).json({ error: "Prakriti Determination entry not found for this patient." });
        }

        return res.status(200).json({
            message: "Prakriti Determination entry retrieved successfully",
            entry,
        });
    } catch (error) {
        console.error("Error fetching Prakriti Determination entry:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Update Prakriti Determination for a specific patient
exports.updatePrakritiDetermination = async (req, res) => {
    const { patientEmail } = req.params;
    const updateData = req.body;

    try {
        const updatedEntry = await PrakritiDetermination.findOneAndUpdate(
            { patientEmail },
            updateData,
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Prakriti Determination entry not found for this patient." });
        }

        return res.status(200).json({
            message: "Prakriti Determination entry updated successfully",
            entry: updatedEntry,
        });
    } catch (error) {
        console.error("Error updating Prakriti Determination entry:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Delete Prakriti Determination for a specific patient
exports.deletePrakritiDetermination = async (req, res) => {
    const { patientEmail } = req.params;

    try {
        const deletedEntry = await PrakritiDetermination.findOneAndDelete({ patientEmail });
        if (!deletedEntry) {
            return res.status(404).json({ error: "Prakriti Determination entry not found for this patient." });
        }

        return res.status(200).json({
            message: "Prakriti Determination entry deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting Prakriti Determination entry:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
