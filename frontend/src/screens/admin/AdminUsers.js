import React, { useEffect, useState } from 'react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

            const response = await fetch("http://localhost:8080/api/auth/users", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched users:", data);
            setUsers(data.users || data);
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
                const response = await fetch(`${process.env.AYURVEDA_BACKEND_URL}/api/auth/users/${userId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

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
        <div style={{ padding: '20px', margin: "160px 50px 25px 50px", background: "white", borderRadius: "15px", overflow:"hidden" }}>
            <h2>Manage Users</h2>
            <div style={{ width: '100%', overflowX: 'auto', padding: "0px 25px" }}>
                <table border="1" style={{ width: '90%', textAlign: 'left', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', background: "#8f9f6d" }}>Name</th>
                            <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Email</th>
                            <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Phone No.</th>
                            <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Gender</th>
                            <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Age</th>
                            <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>ZipCode</th>
                            <th style={{ padding: '0px 10px', background: "#8f9f6d" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td style={{ padding: '0px 10px' }}>{user.firstName} {user.lastName}</td>
                                <td style={{ padding: '0px 10px' }}>{user.email}</td>
                                <td style={{ padding: '0px 10px' }}>{user.phone}</td>
                                <td style={{ padding: '0px 10px' }}>{user.gender}</td>
                                <td style={{ padding: '0px 10px' }}>{user.age}</td>
                                <td style={{ padding: '0px 10px' }}>{user.zipCode}</td>
                                <td style={{ padding: '0px 10px' }}>
                                    <button onClick={() => handleDelete(user._id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
