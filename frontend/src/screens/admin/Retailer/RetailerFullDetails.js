import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RetailerOrdersTab from "./RetailerOrdersTab";
import RetailerProfileTab from "./RetailerProfileTab";
import RetailerFeedbackTab from "./RetailerFeedbackTab";
import RetailerTransactions from "./RetailerTrans";
import {
	ShoppingBag,
	MessageCircleMore,
	Mail,
	Phone,
	MapPin,
	Star,
	ArrowLeft,
	Briefcase,
	IndianRupee,
} from "lucide-react";


const dummyRetailerData = [
	{
		_id: "66e2c4d68b7573f0c2934a1b",
		firstName: "John",
		lastName: "Doe",
		BusinessName: "The Herbal Corner",
		email: "john.doe@example.com",
		phone: "123-456-7890",
		dob: "1985-05-15T00:00:00.000Z",
		licenseNumber: "LIC-A12345",
		age: 39,
		gender: "Male",
		zipCode: "10001",
		password: "hashedpassword1",
		status: "active",
	}
];

const fetchRetailerById = async (retailerId, setRetailer, setLoading, setError) => {
	setLoading(true);
	setError(null);
	try {
		const res = await fetch(
			`${process.env.REACT_APP_AYURVEDA_BACKEND_URL}/api/retailers/getSingleRetailer/${retailerId}`
		);

		if (!res.ok) {
			const errorData = await res.json();
			throw new Error(errorData.message || "Failed to fetch retailer");
		}

		const data = await res.json();
		setRetailer(data);
		console.log("Fetched retailer data:", data);
	} catch (error) {
		console.error("❌ Error fetching retailer:", error);
		setError(error.message);
	} finally {
		setLoading(false);
	}
};

const RetailerFullDetails = () => {
	const navigate = useNavigate();
	const { id: retailerId } = useParams();
	const [activeTab, setActiveTab] = useState("Profile");
	const [retailer, setRetailer] = useState(dummyRetailerData.find(r => r._id === "66e2c4d68b7573f0c2934a1b"));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
	    if (retailerId) {
	        fetchRetailerById(retailerId, setRetailer, setLoading, setError);
	    }
	}, [retailerId]);

	// Define the tabs for the retailer page
	const tabs = [
		{ name: "Profile", icon: Briefcase },
		{ name: "Orders", icon: ShoppingBag },
		// { name: "Transactions", icon: IndianRupee },
		{ name: "Feedback", icon: MessageCircleMore },
	];

	// Render the correct tab content based on the active tab
	const renderContent = () => {
		switch (activeTab) {
			case "Profile":
				return <RetailerProfileTab retailer={retailer} />;
			case "Orders":
				return <RetailerOrdersTab retailerId={retailerId} />;
			// case "Transactions":
			// 	return <RetailerTransactions retailerId={retailerId} />;
			case "Feedback":
				return <RetailerFeedbackTab retailerId={retailerId} />;
			default:
				return null;
		}
	};

	if (!retailer) {
		return <div style={{ textAlign: 'center', marginTop: '150px' }}>Retailer not found.</div>;
	}

	return (
		<div className="profile-page">
			<button className="back-btn" onClick={() => navigate(-1)}>
				<ArrowLeft size={16} /> Back to Retailers
			</button>

			<h1>Retailer Profile</h1>
			<p className="subtitle">Detailed information and activity</p>

			<div className="profile-container">
				<div className="left-panel">
					<div className="avatar">{retailer.firstName.charAt(0)}</div>
					<h2>{retailer.firstName} {retailer.lastName}</h2>
					<p className="muted">{retailer.BusinessName}</p>

					<div className="info">
						<p>
							<Mail size={16} /> {retailer.email}
						</p>
						<p>
							<Phone size={16} /> {retailer.phone}
						</p>
						<p>
							<MapPin size={16} /> ZipCode - {retailer.zipCode}
						</p>
					</div>

					{/* <div className="stats">
						<div>
							<p className="stat-value">N/A</p>
							<p className="stat-label">
								<Star size={14} fill="#FFD700" color="#FFD700" /> Rating
							</p>
						</div>
						<div>
							<p className="stat-value">N/A</p>
							<p className="stat-label">Years in Business</p>
						</div>
					</div> */}
				</div>

				{/* Right Panel - Tabbed Content */}
				<div className="right-panel">
					<div className="tabs-container">
						{tabs.map((tab) => (
							<button
								key={tab.name}
								className={`tab-btn ${activeTab === tab.name ? "active" : ""}`}
								onClick={() => setActiveTab(tab.name)}
							>
								<tab.icon size={16} strokeWidth={2.5} />
								{tab.name}
							</button>
						))}
					</div>
					<div className="tab-content">{renderContent()}</div>
				</div>
			</div>
		</div>
	);
};

export default RetailerFullDetails;
