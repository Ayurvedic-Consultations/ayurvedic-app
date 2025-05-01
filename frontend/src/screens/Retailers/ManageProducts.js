import React, { useState } from "react";
import AddItem from "./AddItem";
import MyItems from "./MyItems";
import "./ManageProducts.css"; // Ensure you have the appropriate CSS

function ManageProducts() {
	const [view, setView] = useState("add");

	return (
		<div className="manage-products-container">
			<h1>Manage Products</h1>
			<div className="tabs">
				<button
					onClick={() => setView("add")}
					className={`tab-btn ${view === "add" ? "active" : ""}`}
				>
					Add Item
				</button>
				<button
					onClick={() => setView("items")}
					className={`tab-btn ${view === "items" ? "active" : ""}`}
				>
					My Items
				</button>
			</div>

			{view === "add" ? <AddItem /> : <MyItems />}
		</div>
	);
}

export default ManageProducts;
