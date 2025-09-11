const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Retailer = require("../models/Retailer");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

exports.getAllRetailers = async (req, res) => {
    try {
        const retailers = await Retailer.find();

        if (!retailers || retailers.length === 0) {
            return res.status(404).json({
                message: "No retailers found in the database",
            });
        }

        res.status(200).json(retailers);
    } catch (error) {
        console.error("Error fetching retailers:", error);
        res.status(500).json({
            message: "Failed to fetch retailers",
            error: error.message,
        });
    }
};

exports.getSingleRetailer = async (req, res) => {
    try {
        const { id } = req.params;

        const retailer = await Retailer.findById(id);

        if (!retailer) {
            return res.status(404).json({
                message: "Retailer not found with the given ID",
            });
        }

        res.status(200).json(retailer);
    } catch (error) {
        console.error("Error fetching single retailer:", error);
        res.status(500).json({
            message: "Failed to fetch retailer",
            error: error.message,
        });
    }
};

