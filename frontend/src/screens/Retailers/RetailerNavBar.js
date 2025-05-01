import React, { useContext, useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../NavBar.css"; // Ensure styles from NavBar are included
import logo from "../../media/logo.png"; // Adjust the path if needed
import locationIcon from "../../media/location.png"; // Adjust the path if needed
import defaultProfilePic from "../../media/default-profile.png"; // Default profile picture
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import notificationIcon from "../../media/notifications.png";
import menu_close from "../../media/menu-close.svg";
import menu from "../../media/menu.svg";

const API_KEY = "f08bb887cc0d42bb8b9fb21993c3a6d3"; // Your OpenCage API key

function RetailerNavBar() {
	const { auth, setAuth } = useContext(AuthContext); // Get auth context to access user info
	const [userLocation, setUserLocation] = useState("Fetching location...");
	const [showModal, setShowModal] = useState(false);
	const modalRef = useRef(null);
	const navigate = useNavigate();
	const profilePic = ""; // Logic to fetch user's profile picture URL
	const userFirstName = auth.user ? auth.user.firstName : "Guest";
	const userLastName = auth.user ? auth.user.lastName : "";

	const userName = userFirstName + " " + userLastName;
	const userPhone = auth.user ? auth.user.phone : "N/A";
	const userEmail = auth.user ? auth.user.email : "N/A";
	const [showMenu, setShowMenu] = useState(false);
	const handleMenuClose = () => {
		setShowMenu(!showMenu);
	};

	useEffect(() => {
		// Function to get the user's location
		const fetchLocation = () => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude } = position.coords;
						fetchCityName(latitude, longitude);
					},
					() => {
						setUserLocation("Location access denied");
					}
				);
			} else {
				setUserLocation("Geolocation not supported");
			}
		};

		fetchLocation();
	}, []);

	// Close modal when clicking outside of it
	useEffect(() => {
		function handleClickOutside(event) {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				setShowModal(false);
			}
		}

		if (showModal) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showModal]);

	// Function to fetch city name from OpenCage API
	const fetchCityName = async (latitude, longitude) => {
		try {
			const response = await fetch(
				`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
			);
			const data = await response.json();
			if (data.results.length > 0) {
				const city =
					data.results[0].components.city ||
					data.results[0].components.town ||
					"Unknown location";
				setUserLocation(city); // Update location text
			} else {
				setUserLocation("City not found");
			}
		} catch (error) {
			setUserLocation("Error fetching city name");
			console.error("Error fetching city name:", error);
		}
	};

	const handleProfileClick = () => {
		setShowModal(!showModal); // Toggle modal visibility
	};

	const handleSignOut = () => {
		setAuth({ token: null, user: null });
		localStorage.removeItem("token");
		navigate("/signin");
	};

	return (
		<header className="navbar-header">
			<div className="top-navbar">
				<div className="logo-container">
					<img src={logo} alt="Retailer Logo" className="nav-logo" />
					<div className="text-container">
						<div className="logo-text">AYURVEDIC</div>
						<div className="consultations-text">Consultations</div>
					</div>
				</div>
				<div className="search-signin">
					<div className="search-bar">
						<div className="dropdown">
							<select>
								<option value="doctor">Doctor</option>
								<option value="disease">Diseases</option>
								<option value="medicine">Medicines</option>
								<option value="diet-yoga">Diet And Yoga</option>
								<option value="blogs-videos">Blogs</option>
							</select>
						</div>
						<input type="text" placeholder="Search" className="search-input" />
					</div>
				</div>
				<div className="auth" onClick={handleProfileClick}>
					<div className="auth-username">{userName}</div>
					<img
						src={profilePic || defaultProfilePic}
						alt="Profile"
						className="profile-pic"
					/>
				</div>
				<NavLink to="/retailer-notifications" className="notification-icon">
					<img
						src={notificationIcon}
						alt="Notifications"
						className="notification-img"
					/>
				</NavLink>
			</div>

			{showModal && (
				<div className="profile-modal" ref={modalRef}>
					<h2>User Profile</h2>
					<div className="profile-details">
						<p>
							<strong>Name:</strong> {userName}
						</p>
						<p>
							<strong>Phone:</strong> {userPhone}
						</p>
						<p>
							<strong>Email:</strong> {userEmail}
						</p>
					</div>
					<button onClick={handleSignOut} className="signout-btn">
						Sign Out
					</button>
					<button onClick={handleProfileClick} className="close-btn">
						Close
					</button>
				</div>
			)}

			<nav className="navbar">
				<div className="left-item">
					<img
						src={locationIcon}
						alt="Location Icon"
						className="location-icon"
					/>
					<span className="location-text">{userLocation}</span>{" "}
					{/* Display user location */}
				</div>
				<div className="center-items">
					{showMenu && (
						<div className="nav-menu">
							<ul className="nav-sidebar" style={{ width: "60%" }}>
								<img
									src={menu_close}
									alt="menu_close"
									onClick={handleMenuClose}
									style={{ zIndex: 99 }}
								/>
								<li>
									<NavLink to="/retailer-home" activeClassName="active">
										Home
									</NavLink>
								</li>
								<li>
									<NavLink to="/products" activeClassName="active">
										Products
									</NavLink>
								</li>
								<li>
									<NavLink to="/orders" activeClassName="active">
										Orders
									</NavLink>
								</li>
								<li>
									<NavLink to="/analytics" activeClassName="active">
										Analytics
									</NavLink>
								</li>
							</ul>
						</div>
					)}
					<div className="nav-menu-button">
						<img src={menu} alt="menu" onClick={handleMenuClose} />
					</div>
					<ul className="nav-center-menu">
						<li>
							<NavLink to="/retailer-home" activeClassName="active">
								Home
							</NavLink>
						</li>
						<li>
							<NavLink to="/manage-products" activeClassName="active">
								Products
							</NavLink>
						</li>
						<li>
							<NavLink to="/my-orders" activeClassName="active">
								Orders
							</NavLink>
						</li>
						<li>
							<NavLink to="/retailer-analytics" activeClassName="active">
								Analytics
							</NavLink>
						</li>
            <li>
              <NavLink to="/customer-support" activeClassName="active">
                Customer Support
              </NavLink>
            </li>
					</ul>
				</div>
			</nav>
		</header>
	);
}

export default RetailerNavBar;
