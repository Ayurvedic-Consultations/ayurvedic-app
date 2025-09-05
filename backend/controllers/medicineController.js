const Medicine = require('../models/Medicine');

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const AdmZip = require('adm-zip');

// Add Medicines from Zip File (Excel + Images)
exports.addMedicinesFromZip = async (req, res) => {
  const retailerId = req.user._id; // Get retailer ID from authenticated user
  const zipFilePath = req.file.path;

  try {
    // Unzip the file
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();

    // Find the Excel file in the zip
    const excelEntry = zipEntries.find(entry => entry.entryName.endsWith('.xlsx') || entry.entryName.endsWith('.xls'));
    if (!excelEntry) {
      return res.status(400).json({ message: 'Excel file not found in zip' });
    }

    // Parse the Excel file
    const workbook = xlsx.read(zip.readFile(excelEntry), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Process each entry in the Excel file
    const medicines = [];
    for (const item of data) {
      const imageFileName = item.imageFileName;
      const imageEntry = zipEntries.find(entry => entry.entryName === imageFileName);

      let imagePath = null;
      if (imageEntry) {
        imagePath = path.join('uploads/medicines', imageFileName);
        fs.writeFileSync(imagePath, zip.readFile(imageEntry));
      }

      // Create a medicine entry according to the schema
      medicines.push({
        name: item.name, 
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        prescription: item.prescription === 'yes' || item.prescription === true, // Convert to boolean
        image: imagePath, // Save image path
        retailerId: retailerId, // Reference to the retailer
      });
    }
    

    // Save all medicines in the database
    await Medicine.insertMany(medicines);
    res.status(201).json({ message: 'Medicines added successfully', medicines });

  } catch (error) {
    console.error('Error adding medicines from zip:', error);
    res.status(500).json({ message: 'Failed to add medicines from zip', error: error.message });
  } finally {
    // Cleanup: remove the uploaded zip file
    fs.unlinkSync(zipFilePath);
  }
};


// Add Medicine (Retailer Only)
exports.addMedicine = async (req, res) => {
  const { name, price, quantity ,category, prescription} = req.body;
  const image = req.file.path;
  const retailerId = req.user._id; // Get retailer ID from authenticated user

  try {
    const newMedicine = new Medicine({ name, price, quantity ,category, prescription, image, retailerId });
    await newMedicine.save();
    res.status(201).json({ message: 'Medicine added successfully', medicine: newMedicine });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to add medicine', error: error.message });
  }
};

// Get All Medicines (Public)
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().populate('retailerId', 'firstName lastName');
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medicines', error: error.message });
  }
};

// Get Retailer's Medicines (Retailer Only)
exports.getMyMedicines = async (req, res) => {
  const retailerId = req.user._id;

  try {
    const medicines = await Medicine.find({ retailerId });
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your medicines', error: error.message });
  }
};

// Delete Medicine (Retailer Only)
exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medicine', error: error.message });
  }
};
