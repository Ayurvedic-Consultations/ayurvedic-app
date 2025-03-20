import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import "./DoctorAnalytics.css"; // Ensure this CSS file is linked

function DoctorAnalytics() {
  const [activeTab, setActiveTab] = useState("Gender");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = localStorage.getItem("email"); // Assuming the doctor's email is stored in localStorage

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/bookings/bookings");
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        // Filter bookings for the logged-in doctor
        const doctorBookings = data.bookings.filter(
          (booking) => booking.doctorEmail === email
        );
        setBookings(doctorBookings);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [email]);

  // Data for Gender Pie Chart
  const genderData = [
    { name: "Male", value: bookings.filter((b) => b.patientGender === "Male").length },
    { name: "Female", value: bookings.filter((b) => b.patientGender === "Female").length },
    { name: "Other", value: bookings.filter((b) => b.patientGender === "Other").length },
  ];

  // Data for Age Line Graph
  const ageData = [
    { ageGroup: "0-10", count: bookings.filter((b) => b.patientAge >= 0 && b.patientAge <= 10).length },
    { ageGroup: "11-20", count: bookings.filter((b) => b.patientAge >= 11 && b.patientAge <= 20).length },
    { ageGroup: "21-30", count: bookings.filter((b) => b.patientAge >= 21 && b.patientAge <= 30).length },
    { ageGroup: "31-40", count: bookings.filter((b) => b.patientAge >= 31 && b.patientAge <= 40).length },
    { ageGroup: "41-50", count: bookings.filter((b) => b.patientAge >= 41 && b.patientAge <= 50).length },
    { ageGroup: "51+", count: bookings.filter((b) => b.patientAge >= 51).length },
  ];

  // Data for Monthly Bar Graph
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month: new Date(2023, i).toLocaleString("default", { month: "short" }),
      count: bookings.filter(
        (b) => new Date(b.dateOfAppointment).getMonth() === i
      ).length,
    };
  });

  // Data for Rating Scatter Plot
  const ratingData = bookings
    .filter((b) => b.rating !== null)
    .map((b) => ({ rating: b.rating, date: new Date(b.dateOfAppointment).toLocaleDateString() }));

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="doctor-analytics-container">
      <h1>Doctor Analytics</h1>

      {/* Tabs for Different Graphs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab("Gender")}
          className={`tab ${activeTab === "Gender" ? "active" : ""}`}
        >
          Gender Distribution
        </button>
        <button
          onClick={() => setActiveTab("Age")}
          className={`tab ${activeTab === "Age" ? "active" : ""}`}
        >
          Age Distribution
        </button>
        <button
          onClick={() => setActiveTab("Monthly")}
          className={`tab ${activeTab === "Monthly" ? "active" : ""}`}
        >
          Monthly Appointments
        </button>
        <button
          onClick={() => setActiveTab("Rating")}
          className={`tab ${activeTab === "Rating" ? "active" : ""}`}
        >
          Patient Ratings
        </button>
      </div>

      {/* Gender Pie Chart */}
      {activeTab === "Gender" && (
        <div className="chart-container">
          <h2>Gender Distribution of Patients</h2>
          <PieChart width={400} height={400}>
            <Pie
              data={genderData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#0088FE", "#00C49F", "#FFBB28"][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      )}

      {/* Age Line Graph */}
      {activeTab === "Age" && (
        <div className="chart-container">
          <h2>Age Distribution of Patients</h2>
          <LineChart width={600} height={300} data={ageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ageGroup" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
      )}

      {/* Monthly Bar Graph */}
      {activeTab === "Monthly" && (
        <div className="chart-container">
          <h2>Monthly Appointments</h2>
          <BarChart width={600} height={300} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>
      )}

      {/* Rating Scatter Plot */}
      {activeTab === "Rating" && (
        <div className="chart-container">
          <h2>Patient Ratings Over Time</h2>
          <ScatterChart width={600} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" name="Date" />
            <YAxis dataKey="rating" name="Rating" domain={[1, 5]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Ratings" data={ratingData} fill="#8884d8" />
          </ScatterChart>
        </div>
      )}
    </div>
  );
}

export default DoctorAnalytics;
