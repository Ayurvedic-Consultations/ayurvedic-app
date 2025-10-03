import React, { useState } from 'react';
import { Pill, Salad, HeartPulse } from 'lucide-react'; // 1. Import icons
import './PrescriptionTabs.css';
import { MedicineForm } from './MedicineForm';
import { DietPlanForm } from './DietPlanForm';
import { YogaPlanForm } from './YogaPlanForm';

// 2. Create an array for tab data to make the component scalable
const tabs = [
  { id: 'medicine', label: 'Medicine', Icon: Pill },
  { id: 'diet', label: 'Diet Plan', Icon: Salad },
  { id: 'yoga', label: 'Yoga / Wellness', Icon: HeartPulse },
];

export function PrescriptionTabs() {
  const [activeTab, setActiveTab] = useState('medicine');

  const renderForm = () => {
    switch (activeTab) {
      case 'medicine':
        return <MedicineForm />;
      case 'diet':
        return <DietPlanForm />;
      case 'yoga':
        return <YogaPlanForm />;
      default:
        return null;
    }
  };

  return (
    <div className="tabs-containers">
      <div className="tab-list">
        {/* 3. Map over the tabs array to render buttons dynamically */}
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab-trigger ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="tab-icon" size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderForm()}
      </div>
    </div>
  );
}