const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const DoctorData = require('../models/DoctorData');
// Add other models if necessary, e.g., Medicine, Blog, etc.

/**
 * @route GET /api/knowledge-base/export
 * @desc Generates a comprehensive, automatically updated Knowledge Base string (Markdown text)
 *       that can be fed directly to InfuseAI or used as a system prompt addition.
 */
router.get('/export', async (req, res) => {
    try {
        // Fetch dynamic data
        const doctors = await Doctor.find().lean();
        const doctorDatas = await DoctorData.find().lean();

        let markdown = `# Ayurvedic AI Platform - Live Knowledge Base\n\n`;
        markdown += `_Last Updated: ${new Date().toISOString()}_\n\n`;

        // ------------------------------------------
        // 1. Platform Overview
        // ------------------------------------------
        markdown += `## 1. Platform Overview\n`;
        markdown += `The Ayurvedic Platform is a comprehensive telemedicine and wellness application that connects patients with certified Ayurvedic doctors, provides AI-driven health evaluations, manages appointments, and offers curated wellness content.\n\n`;

        markdown += `### Key Features:\n`;
        markdown += `- **AI Health Assistant:** Sanjeevani AI — a native chatbot that provides empathy-driven preliminary health assessments.\n`;
        markdown += `- **Doctor Consultations:** Patients can view, filter, and book appointments with specialized Ayurvedic practitioners.\n`;
        markdown += `- **Wellness Resources:** Provides curated yoga, diet tips, and related YouTube wellness videos based on health conditions.\n`;
        markdown += `- **Ecommerce / Medicines:** Supports adding prescribed Ayurvedic medications to a cart and placing orders securely.\n`;
        markdown += `- **Prakriti Determination:** Tools for determining patients' unique Ayurvedic body constitution (Vata, Pitta, Kapha).\n\n`;

        // ------------------------------------------
        // 2. Doctors Roster (Automatically Updated)
        // ------------------------------------------
        markdown += `## 2. Certified Ayurvedic Doctors (${doctors.length + doctorDatas.length} Total)\n`;
        markdown += `The following doctors are currently available on the platform for booking:\n\n`;

        // Consolidate both collections for the knowledge base
        const allDocs = [];

        doctors.forEach(doc => {
            allDocs.push({
                name: `Dr. ${doc.firstName} ${doc.lastName}`,
                specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization,
                experience: doc.experience ? `${doc.experience} years` : 'Experienced',
                education: doc.education || 'BAMS',
                price: doc.price || 0,
                email: doc.email
            });
        });

        doctorDatas.forEach(doc => {
            allDocs.push({
                name: `Dr. ${doc.firstname} ${doc.lastname}`,
                specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization,
                experience: doc.experience ? `${doc.experience} years` : 'Experienced',
                education: doc.education || 'BAMS',
                price: doc.fee || 0,
                email: doc.email
            });
        });

        allDocs.forEach(doc => {
            markdown += `### ${doc.name}\n`;
            markdown += `- **Specialization:** ${doc.specialization}\n`;
            markdown += `- **Experience:** ${doc.experience}\n`;
            markdown += `- **Education:** ${doc.education}\n`;
            markdown += `- **Consultation Fee:** ₹${doc.price}\n`;
            markdown += `- **Contact Email:** ${doc.email}\n\n`;
        });

        // ------------------------------------------
        // 3. AI Safety and Medical Guidelines
        // ------------------------------------------
        markdown += `## 3. AI Safety & Medical Guidelines\n`;
        markdown += `- The AI Assistant must NEVER prescribe specific medicinal formulations or exact dosages.\n`;
        markdown += `- The AI must ALWAYS state that its suggestions are from an "Ayurvedic perspective" and not a definitive medical diagnosis.\n`;
        markdown += `- For chronic illness, severe pain, or emergency symptoms (e.g., chest pain, breathing issues), the AI must immediately advise visiting a hospital.\n`;
        markdown += `- Recommend booking a consultation with one of the doctors listed above if symptoms are persistent.\n\n`;

        res.set('Content-Type', 'text/markdown');
        res.status(200).send(markdown);

    } catch (error) {
        console.error('Error generating Knowledge Base:', error);
        res.status(500).json({ error: 'Failed to generate Knowledge Base' });
    }
});

/**
 * @route GET /api/knowledge-base/json
 * @desc Returns the knowledge base as a structured JSON object
 */
router.get('/json', async (req, res) => {
    try {
        const doctors = await Doctor.find().lean();
        const doctorDatas = await DoctorData.find().lean();

        const allDocs = [];
        // Map data similarly
        doctors.forEach(doc => allDocs.push({
            name: `Dr. ${doc.firstName} ${doc.lastName}`,
            specialization: Array.isArray(doc.specialization) ? doc.specialization : [doc.specialization],
            experience: doc.experience || 0,
            fee: doc.price || 0
        }));
        doctorDatas.forEach(doc => allDocs.push({
            name: `Dr. ${doc.firstname} ${doc.lastname}`,
            specialization: Array.isArray(doc.specialization) ? doc.specialization : [doc.specialization],
            experience: doc.experience || 0,
            fee: doc.fee || 0
        }));

        res.status(200).json({
            platform: "Ayurvedic AI Telemedicine",
            timestamp: new Date().toISOString(),
            features: [
                "AI Health Assistant",
                "Doctor Consultations",
                "Ecommerce for Medicines",
                "Prakriti Determination"
            ],
            doctors: allDocs
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate Knowledge Base JSON' });
    }
});

module.exports = router;
