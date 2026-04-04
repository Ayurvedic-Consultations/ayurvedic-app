import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordsData } from "./Patientdata";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  //   const handleUpdate = (id) => {
  //     navigate(`/patients/update/${id}`);
  //   };

  // Row click → go to details page
  const handleRowClick = (id) => {
    navigate(`/patients/${id}`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from local storage
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/patient-records/getAllRecords`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(data?.data?.records || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/auth/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error deleting user: ${response.status}`);
        }

        console.log(`User ${userId} deleted successfully`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div
      style={{
        padding: "20px",
        margin: "160px 50px 25px 50px",
        background: "white",
        borderRadius: "15px",
        overflow: "hidden",
      }}
    >
      <h2>Manage Users</h2>
      <div style={{ width: "100%", overflowX: "auto", padding: "0px 25px" }}>
        <table
          border="1"
          style={{ width: "90%", textAlign: "left", marginTop: "20px" }}
        >
          <thead>
            <tr>
              <th style={{ padding: "10px", background: "#8f9f6d" }}>Name</th>
              <th style={{ padding: "0px 10px", background: "#8f9f6d" }}>
                Email
              </th>
              <th style={{ padding: "0px 10px", background: "#8f9f6d" }}>
                Phone No.
              </th>
              <th style={{ padding: "0px 10px", background: "#8f9f6d" }}>
                Gender
              </th>
              <th style={{ padding: "0px 10px", background: "#8f9f6d" }}>
                Age
              </th>
              <th style={{ padding: "0px 10px", background: "#8f9f6d" }}>
                ZipCode
              </th>
              <th style={{ padding: "0px 10px", background: "#8f9f6d" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {recordsData.map((record) => {
              const patient = record.patient; // ✅ extract nested patient
              return (
                <tr
                  key={record._id}
                  onClick={() => handleRowClick(record._id)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ padding: "0px 10px" }}>
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td style={{ padding: "0px 10px" }}>{patient.email}</td>
                  <td style={{ padding: "0px 10px" }}>{patient.phone}</td>
                  <td style={{ padding: "0px 10px" }}>{patient.gender}</td>
                  <td style={{ padding: "0px 10px" }}>{patient.age}</td>
                  <td style={{ padding: "0px 10px" }}>{patient.zipCode}</td>
                  <td style={{ padding: "0px 10px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(record._id);
                      }}
                      style={{ marginLeft: "10px", color: "white" }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/patients/${record._id}`);
                      }}
                      style={{ marginLeft: "20px", color: "white" }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
