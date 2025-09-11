import React from "react";
import { Briefcase, CheckCircle2, User, AtSign, Phone, MapPin } from "lucide-react";
import "./RetailerProfileTab.css";

const RetailerProfileTab = ({ retailer }) => {
  if (!retailer) {
    return (
      <div className="loading-message">
        <p>Retailer data is not available.</p>
      </div>
    );
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="retailer-profile-row">
      {/* Left Card: Business Information */}
      <div className="retailer-card">
        <h3>
          <Briefcase size={20} /> Business Information
        </h3>
        <p>
          <span className="label">Business Name</span>
          <span className="value">{retailer.BusinessName}</span>
        </p>
        <p>
          <span className="label">License Number</span>
          <span className="value">{retailer.licenseNumber}</span>
        </p>
        <p>
          <span className="label">Date of Birth</span>
          <span className="value">{new Date(retailer.dob).toLocaleDateString()}</span>
        </p>
        <p>
          <span className="label">Status</span>
          <span className={`value status-${retailer.status}`}>
            <CheckCircle2 size={16} /> {capitalizeFirstLetter(retailer.status)}
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
          <span className="value">{retailer.phone}</span>
        </p>
        <p>
          <span className="label"><MapPin size={14} /> Address</span>
          <span className="value">{retailer.zipCode}</span>
        </p>
      </div>
    </div>
  );
};

export default RetailerProfileTab;
