import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const AdminDoctors = () => {
    const [selectedTab, setSelectedTab] = useState("doctors");
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [file, setFile] = useState(null);

      const navigate = useNavigate();

    useEffect(() => {
        if (selectedTab === "doctors") fetchDoctors();
        if (selectedTab === "bookings") fetchBookings();
    }, [selectedTab]);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/doctors`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setDoctors(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/bookings`);
            if (!response.ok) {
                throw new Error(`Error fetching bookings: ${response.status}`);
            }
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleRowClick = (id) => {
    navigate(`/patients/${id}`);
    };



    const handleDelete = async (doctorId) => {
        if (!doctorId) {
            console.error("Invalid doctor ID:", doctorId);
            alert("Error: Invalid doctor ID.");
            return;
        }

        console.log("Deleting doctor with ID:", doctorId);

        if (window.confirm("Are you sure you want to delete this doctor?")) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/doctors/${doctorId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error deleting doctor: ${response.status}`);
                }

                console.log("Doctor deleted successfully");
                alert("Doctor deleted successfully!");

                // Update the UI by removing the deleted doctor
                setDoctors(doctors.filter((doctor) => doctor._id !== doctorId));
            } catch (error) {
                console.error("Error deleting doctor:", error);
                alert("Failed to delete doctor. Please check the console for details.");
            }
        }
    };


    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            console.error("No file selected for upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/doctors/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }, // Don't set 'Content-Type' for FormData
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error uploading doctors: ${response.status}`);
            }

            const result = await response.json();
            console.log("Upload success:", result);
            alert("Doctors uploaded successfully!");

            fetchDoctors();
        } catch (error) {
            console.error("Error uploading doctors:", error);
        }
    };



    if (loading) return <p>Loading doctors...</p>;

    return (
        <div style={{ padding: '20px', margin: "160px 50px 25px 50px", background: "white", borderRadius: "15px", overflow: "hidden" }}>

            <h2>Manage Doctors</h2>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
                <button onClick={() => setSelectedTab("doctors")}>Doctors</button>
                <button onClick={() => setSelectedTab("bookings")}>Bookings</button>
                <button onClick={() => setSelectedTab("upload")}>Onboard via Excel</button>
            </div>

            {selectedTab === "doctors" && (
                <div>
                    <h3>Doctors List</h3>
                    <div style={{ width: '100%', overflowX: 'auto', padding: "0px 25px" }}>
                        <table border="1" style={{ width: '90%', textAlign: 'left', marginTop: '20px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '10px', background: "#8f9f6d" }}>Name</th>
                                    <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Email</th>
                                    <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Phone</th>
                                    <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map((doctor) => (
                                    <tr 
                                      key={doctor._id}
                                      onClick={() => handleRowClick(doctor._id)}
                                      style={{ cursor: "pointer" }}
                                    
                                   >
                                        <td style={{ padding: '0px 10px' }}>{doctor.firstName} {doctor.lastName}</td>
                                        <td style={{ padding: '0px 10px' }}>{doctor.email}</td>
                                        <td style={{ padding: '0px 10px' }}>{doctor.phone}</td>
                                        <td style={{ padding: '0px 10px' }}>
                                             <button onClick={() => handleDelete(doctor._id)} style={{ marginLeft: '10px', color: 'blue' }}>Delete</button>
                                             <button   onClick={(e) => {
                                                   e.stopPropagation();
                                                   navigate(`/patients/${doctor._id}`);
                                                   }}
                                                  style={{ marginLeft: '50px', color: 'blue' }}>Update</button>
                                
                                                  </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedTab === "bookings" && (
                <div>
                    <h3>Booking Details</h3>
                    <div style={{ width: '100%', overflowX: 'auto', padding: "0px 25px" }}>
                        <table border="1" style={{ width: '90%', textAlign: 'left', marginTop: '20px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '10px', background: "#8f9f6d" }}>Patient Name</th>
                                    <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Doctor</th>
                                    <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Date</th>
                                    <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td style={{ padding: '0px 10px' }}>{booking.patientName}</td>
                                        <td style={{ padding: '0px 10px' }}>{booking.doctorName}</td>
                                        <td style={{ padding: '0px 10px' }}>{new Date(booking.dateOfAppointment).toLocaleDateString()}</td>
                                        <td style={{ padding: '0px 10px' }}>{booking.requestAccept === "o" ? "Pending" : booking.requestAccept}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedTab === "upload" && (
                <div>
                    <h3>Onboard Doctors via Excel</h3>
                    <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} />
                    <button style={{ marginLeft: "10px" }} onClick={handleUpload} >Upload</button>
                </div>
            )}
        </div>
    );
};

export default AdminDoctors;
