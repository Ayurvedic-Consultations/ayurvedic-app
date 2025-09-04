import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

// Import your tab components
import RetailerOrdersTab from "./RetailerOrdersTab";
import RetailerProfileTab from "./RetailerProfileTab";
import RetailerFeedbackTab from "./RetailerFeedbackTab";
import RetailerTransactions from "./RetailerTrans";

// Import your retailer data
import retailers from "./RetailerData";

const RetailerFullDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Profile");

  // Find the specific retailer from the data using the ID from the URL
  const retailer = retailers.find((r) => String(r.id) === id);

  // If no retailer is found, display a message
  if (!retailer) {
    return <div>No retailer found for id {id}</div>;
  }

  // Define the tabs for the retailer page
  const tabs = [
    { name: "Profile", icon: Briefcase },
    { name: "Orders", icon: ShoppingBag },
    { name: "Transactions", icon: IndianRupee },
    { name: "Feedback", icon: MessageCircleMore },
  ];

  // Render the correct tab content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return <RetailerProfileTab retailer={retailer} />;
      case "Orders":
        return <RetailerOrdersTab orders={retailer.orders} />;
      case "Transactions":
        return <RetailerTransactions retailer={retailer} />;
      case "Feedback":
        return <RetailerFeedbackTab feedback={retailer.feedback} />;
      default:
        return null;
    }
  };

  return (
    // Use the same class names as the Doctor's page for consistent styling
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Retailers
      </button>

      <h1>Retailer Profile</h1>
      <p className="subtitle">Detailed information and activity</p>

      <div className="profile-container">
        {/* Left Panel - Retailer Summary */}
        <div className="left-panel">
          <div className="avatar">{retailer.name.charAt(0)}</div>
          <h2>{retailer.name}</h2>
          <p className="muted">{retailer.storeName}</p>

          <div className="info">
            <p>
              <Mail size={16} /> {retailer.email}
            </p>
            <p>
              <Phone size={16} /> {retailer.contact}
            </p>
            <p>
              <MapPin size={16} /> {retailer.location}
            </p>
          </div>

          <div className="stats">
            <div>
              <p className="stat-value">{retailer.rating}</p>
              <p className="stat-label">
                <Star size={14} fill="#FFD700" color="#FFD700" /> Rating
              </p>
            </div>
            <div>
              <p className="stat-value">{retailer.yearsInBusiness}</p>
              <p className="stat-label">Years in Business</p>
            </div>
          </div>
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