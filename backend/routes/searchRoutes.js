const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Medicine = require("../models/Medicine");
const Blog = require("../models/Blog");
const DietYoga = require("../models/DietYoga");

router.get("/", async (req, res) => {
  const { s, type } = req.query;
  if (!s || !type) return res.status(400).json({ message: "Missing query or type" });

  try {
    let results = [];
    const regex = new RegExp(s, "i");

    switch (type) {
      case "doctor":
        results = await Doctor.find({ $or: [{ firstName: regex }, { lastName: regex }] }).select("firstName lastName _id");
        results = results.map(doc => ({ id: doc._id, name: `${doc.firstName} ${doc.lastName}` }));
        break;
      case "medicine":
        results = await Medicine.find({ name: regex }).select("name");
        break;
      case "blogs-videos":
        results = await Blog.find({ title: regex }).select("title _id");
        break;
      case "diet-yoga":
        results = await DietYoga.find({ $or: [{ diet: regex }, { yoga: regex }] }).select("diet yoga _id");
        results = results.map(entry => ({ name: entry.diet || entry.yoga }));
        break;
      case "disease":
        // Placeholder — assuming treatment data is in a `Treatment` model
        results = await Treatment.find({ name: regex }).select("name _id");
        break;
    }

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

