import React, { useState } from "react";
import "./RetailerManagement.css"; // same CSS structure as DoctorList.css but you can tweak colors/icons
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Search,
  ArrowLeft,
  X,
  Pencil,
  Store,
} from "lucide-react";

// Dummy retailer data
const initialRetailersData = [
  {
    id: 1,
    name: "MediMart",
    email: "medimart@example.com",
    phone: "9876543210",
    status: "Active",
  },
  {
    id: 2,
    name: "PharmaSupply",
    email: "pharmasupply@example.com",
    phone: "9123456780",
    status: "Inactive",
  },
  {
    id: 3,
    name: "HealthPlus Store",
    email: "healthplus@example.com",
    phone: "9988776655",
    status: "Active",
  },
];

const RetailerManagement = () => {
  const [retailers, setRetailers] = useState(initialRetailersData);
  const [search, setSearch] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [retailerToEdit, setRetailerToEdit] = useState(null);

  const navigate = useNavigate();

  // Filter by search term
  const filteredRetailers = retailers.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.phone.includes(term)
    );
  });

  const handleRowClick = (id) => navigate(`/admin/medicine-orders/${id}`);

  const handleEditClick = (e, retailer) => {
    e.stopPropagation();
    setRetailerToEdit(retailer);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = (updatedRetailer) => {
    setRetailers(
      retailers.map((r) =>
        r.id === updatedRetailer.id ? updatedRetailer : r
      )
    );
    setIsEditModalOpen(false);
    setRetailerToEdit(null);
  };

  return (
    <div className="management-container">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Retailer Management</h2>
      </div>

      <div className="controls-container">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>
                <div className="th-content">
                  <Store size={16} />
                  <span>Retailer Name</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>Status</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <Mail size={16} />
                  <span>Email</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <Phone size={16} />
                  <span>Phone</span>
                </div>
              </th>
              <th>
                <div className="th-content">
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRetailers.length > 0 ? (
              filteredRetailers.map((retailer) => (
                <tr
                  key={retailer.id}
                  onClick={() => handleRowClick(retailer.id)}
                >
                  <td data-label="Retailer Name">
                    <div className="retailer-name-cell">
                      <div className="avatar-sm">
                        {retailer.name.charAt(0)}
                      </div>
                      <div>{retailer.name}</div>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`status-pill ${
                        retailer.status.toLowerCase() === "active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {retailer.status}
                    </span>
                  </td>
                  <td data-label="Email">{retailer.email}</td>
                  <td data-label="Phone">{retailer.phone}</td>
                  <td data-label="Actions" className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={(e) => handleEditClick(e, retailer)}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No retailers found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {retailerToEdit && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          retailer={retailerToEdit}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

const EditModal = ({ isOpen, onClose, retailer, onSave }) => {
  const [formData, setFormData] = useState(retailer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Retailer Details</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Retailer Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetailerManagement;
