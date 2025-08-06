import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
	const navigate = useNavigate();

	const sections = [
		{ name: 'Patient Management', path: '/admin/users' },
		{ name: 'Doctor Management', path: '/admin/consultations' },
		{ name: 'Retailer Management', path: '/admin/medicine-orders' },
		{ name: 'Transactions', path: '/admin/transactions' },
		{ name: 'Blogs', path: '/admin/blogs' }
	];

	return (
		<div style={{ textAlign: 'center', marginTop: '165px', padding: "25px", boxSizing: "border-box", marginLeft: "50px", marginRight: "50px", marginBottom:"25px", background:"white", borderRadius:"15px" }}>
			<h1>Admin Dashboard</h1>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '20px' }}>
				{sections.map((section, index) => (
					<div
						key={index}
						style={{
							padding: '20px',
							backgroundColor: '#f8f9fa',
							borderRadius: '10px',
							cursor: 'pointer',
							boxShadow: '0px 4px 6px rgba(0,0,0,0.1)'
						}}
						onClick={() => navigate(section.path)}
					>
						<h3>{section.name}</h3>
					</div>
				))}
			</div>
		</div>
	);
};

export default AdminDashboard;
