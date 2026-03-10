const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Nexon:A6uX1wYwB01VIFzB@cluster0.e8iyl.mongodb.net/Ayurveda?retryWrites=true&w=majority&appName=Cluster0").then(async () => {
    const Patient = require('./models/Patient');
    const pt = await Patient.findById("69ab1681099cc3ec1f57a38d");
    console.log("Patient: ", pt);
    process.exit(0);
}).catch(console.error);
