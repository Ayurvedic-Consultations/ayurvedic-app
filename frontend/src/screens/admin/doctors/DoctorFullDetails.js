import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  CalendarCheck2,
  MessageCircleMore,
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Star,
  ArrowLeft,
  Briefcase,
IndianRupee
} from 'lucide-react';

import { doctor, dummyData } from './Data';
import DoctorDetails from './DoctorDetails';
import AppointmentsTab from './Appointment';
import FeedbackTab from './DoctorFeedback';
import PrescriptionsTab from "./Precription";
// import DoctorTrans from  "./DoctorTrans";
import Transactions from "./DoctorTrans";
// import PrescriptionTab from './Prescription'; // Removed as per user request 



const DoctorFullDetails = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Details");

  const tabs = [
    { name: "Details", icon: Briefcase },
    { name: "Prescriptions", icon: Pill },
    { name: "Appointments", icon: CalendarCheck2 },
    { name: "Transction", icon:IndianRupee },
    { name: "Feedback", icon: MessageCircleMore },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Details":
        return <DoctorDetails doctor={doctor} />;
      case "Prescriptions":
        // PrescriptionTab content is now inline to follow the user's new request for a Pills page
        return (
          <PrescriptionsTab />
        );
      case "Appointments":
        return <AppointmentsTab/>;
      case "Transction":
        return <Transactions />;
      case "Feedback":
        return <FeedbackTab />;
      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Doctors
      </button>

      <h1>Doctor Profile</h1>
      <p className="subtitle">Detailed information and activity</p>

      <div className="profile-container">
        {/* Left Panel - Summary */}
        <div className="left-panel">
          <div className="avatar">{doctor.name.charAt(4)}</div>
          <h2>{doctor.name}</h2>
          <p className="muted">{doctor.specialization}</p>

          <div className="info">
            <p><Mail size={16} /> {doctor.email}</p>
            <p><Phone size={16} /> {doctor.contact}</p>
            <p><MapPin size={16} /> {doctor.location}</p>
          </div>

          <div className="stats">
            <div>
              <p className="stat-value">{doctor.rating}</p>
              <p className="stat-label"><Star size={14} fill="#FFD700" color="#FFD700" /> Rating</p>
            </div>
            <div>
              <p className="stat-value">{doctor.experience}</p>
              <p className="stat-label">Years of Exp</p>
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

export default DoctorFullDetails;
