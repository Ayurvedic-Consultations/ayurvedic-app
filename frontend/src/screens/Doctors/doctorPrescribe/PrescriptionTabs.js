import React, { useState } from 'react';
import { Pill, Salad, HeartPulse } from 'lucide-react';
import './PrescriptionTabs.css';
import { MedicineForm } from './MedicineForm';
import { DietPlanForm } from './DietPlanForm';
import { YogaPlanForm } from './YogaPlanForm';

const tabs = [
	{ id: 'medicine', label: 'Medicine', Icon: Pill },
	{ id: 'diet', label: 'Diet Plan', Icon: Salad },
	{ id: 'yoga', label: 'Yoga / Wellness', Icon: HeartPulse },
];

export function PrescriptionTabs({ bookingId, patientId, doctorId }) {
	const [activeTab, setActiveTab] = useState('medicine');

	const renderForm = () => {
		switch (activeTab) {
			case 'medicine':
				return <MedicineForm bookingId={bookingId} patientId={patientId} doctorId={doctorId} />;
			case 'diet':
				return <DietPlanForm bookingId={bookingId} patientId={patientId} doctorId={doctorId}/>;
			case 'yoga':
				return <YogaPlanForm bookingId={bookingId} patientId={patientId} doctorId={doctorId}/>;
			default:
				return null;
		}
	};

	return (
		<div className="tabs-containers">
			<div className="tab-list">
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
