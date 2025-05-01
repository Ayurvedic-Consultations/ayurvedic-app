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
                const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
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
        <div style={{ padding: '20px', marginTop: '150px' }}>
            <h2>Manage Users</h2>
            <table border="1" style={{ width: '100%', textAlign: 'left', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone No.</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>ZipCode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.gender}</td>
                            <td>{user.age}</td>
                            <td>{user.zipCode}</td>
                            <td>
                                <button onClick={() => handleDelete(user._id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;
