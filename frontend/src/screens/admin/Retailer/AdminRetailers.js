import React, { useEffect, useState } from 'react';
import './AdminRetailers.css';

const AdminRetailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file.");
            return;
        }
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            const response = await fetch(`${process.env.AYURVEDA_BACKEND_URL}/api/auth/upload-retailers`, {
                method: "POST",
                body: formData, 
            });
    
            const result = await response.json();
            alert(result.message);
            fetchRetailers();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };
    

    useEffect(() => {
        fetchRetailers();
    }, []);

    const fetchRetailers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            console.log("Fetching retailers...");
            const response = await fetch(`${process.env.AYURVEDA_BACKEND_URL}/api/auth/retailers`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Response Status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched Data:", data); //  Debugging output
            setRetailers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching retailers:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this retailer?")) return;
    
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found.");
                return;
            }
    
            console.log("Deleting retailer with ID:", id);
            
            const response = await fetch(`${process.env.AYURVEDA_BACKEND_URL}/api/auth/retailers/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
    
            console.log("Delete Response Status:", response.status);
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            alert("Retailer deleted successfully.");
            fetchRetailers(); // Refresh list after deletion
        } catch (error) {
            console.error("Error deleting retailer:", error);
        }
    };    

    if (loading) return <p>Loading retailers...</p>;

    return (
        <div style={{ padding: '20px', margin: "160px 50px 25px 50px", background: "white", borderRadius: "15px" , overflow:"hidden"}}>
            <h2>Manage Retailers</h2>
            <div>
                <h3>Upload Retailers via Excel</h3>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload</button>
            </div>
            <div style={{ width: '100%', overflowX: 'auto', padding: "0px 25px" }}>
            <table border="1" style={{ width: '90%', textAlign: 'left', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '10px', background: "#8f9f6d" }}>Name</th>
                        <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Email</th>
                        <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Phone</th>
                        <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Age</th>
                        <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Gender</th>
                        <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Zip Code</th>
                        <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {retailers.length === 0 ? (
                        <tr><td colSpan="4">No retailers found.</td></tr>
                    ) : (
                        retailers.map(retailer => (
                            <tr key={retailer._id}>
                                <td style={{ padding: '0px 10px' }}>{retailer.firstName} {retailer.lastName}</td>
                                <td style={{ padding: '0px 10px' }}>{retailer.email}</td>
                                <td style={{ padding: '0px 10px' }}>{retailer.phone}</td>
                                <td style={{ padding: '0px 10px' }}>{retailer.age}</td>
                                <td style={{ padding: '0px 10px' }}>{retailer.gender}</td>
                                <td style={{ padding: '0px 10px' }}>{retailer.zipCode}</td>
                                <td style={{ padding: '0px 10px' }}>
                                    
                                    <button 
                                        onClick={() => handleDelete(retailer._id)} 
                                        style={{ marginLeft: '10px', color: 'red' }}
                                    >Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default AdminRetailers;
