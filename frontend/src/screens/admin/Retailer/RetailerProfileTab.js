import React from "react";
import { Briefcase, CheckCircle2, User, AtSign, Phone, MapPin } from "lucide-react";
import "./RetailerProfileTab.css";

const RetailerProfileTab = ({ retailer }) => {
  // If no retailer data is passed, don't render anything.
  if (!retailer) {
    return (
      <div className="loading-message">
        <p>Retailer data is not available.</p>
      </div>
    );
  }

  return (
    <div className="retailer-profile-row">
      {/* Left Card: Business Information */}
      <div className="retailer-card">
        <h3>
          <Briefcase size={20} /> Business Information
        </h3>
        <p>
          <span className="label">Business Name</span>
          <span className="value">{retailer.storeName}</span>
        </p>
        <p>
          <span className="label">License Number</span>
          <span className="value">BP-2023-001</span>
        </p>
        <p>
          <span className="label">Joined Date</span>
          <span className="value">2023-01-15</span>
        </p>
        <p>
          <span className="label">Status</span>
          <span className="value status-active">
            <CheckCircle2 size={16} /> Active
          </span>
        </p>
      </div>

      {/* Right Card: Contact Information */}
      <div className="retailer-card">
        <h3>
          <User size={20} /> Contact Information
        </h3>
        <p>
          <span className="label"><AtSign size={14} /> Email</span>
          <span className="value">{retailer.email}</span>
        </p>
        <p>
          <span className="label"><Phone size={14} /> Phone</span>
          <span className="value">{retailer.contact}</span>
        </p>
        <p>
          <span className="label"><MapPin size={14} /> Address</span>
          <span className="value">{retailer.location}</span>
        </p>
      </div>
    </div>
  );
};

export default RetailerProfileTab;
