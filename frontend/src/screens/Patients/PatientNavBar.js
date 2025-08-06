import React, { useContext, useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../NavBar.css";
import "./PatientNavBar.css";
import logo from "../../media/logo.png";
import locationIcon from "../../media/location.png";
import defaultProfilePic from "../../media/default-profile.png";
import notificationIcon from "../../media/notifications.png";
import { AuthContext } from "../../context/AuthContext";
import menu from "../../media/menu.svg";
import menu_close from "../../media/menu-close.svg";

const API_KEY = "f08bb887cc0d42bb8b9fb21993c3a6d3"; // Replace with your OpenCage API key

function PatientNavBar() {
	const navigate = useNavigate();
	const { auth, setAuth } = useContext(AuthContext);
	const [showModal, setShowModal] = useState(false);
	const modalRef = useRef(null);
	const [userLocation, setUserLocation] = useState("Fetching location...");
	const [cityName, setCityName] = useState(""); // State for city name
	const [userAddress, setUserAddress] = useState(
		auth.user?.address || "Not available"
	);

	const profilePic = "";
	const userFirstName = auth.user ? auth.user.firstName : "Guest";
	const userLastName = auth.user ? auth.user.lastName : "";
	const userName = userFirstName + " " + userLastName;
	const userPhone = auth.user ? auth.user.phone : "N/A";
	const userEmail = auth.user ? auth.user.email : "N/A";

	const [showMenu, setShowMenu] = useState(false);
	const handleMenuClose = () => {
		setShowMenu(!showMenu);
	};

	const handleSignOut = () => {
		setAuth({ token: null, user: null });
		localStorage.removeItem("token");
		navigate("/signin");
	};

	useEffect(() => {
		// Function to get the user's location
		const fetchLocation = () => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude } = position.coords;
						setUserLocation(`Lat: ${latitude}, Lon: ${longitude}`);
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
				setCityName(city);
			} else {
				setCityName("City not found");
			}
		} catch (error) {
			setCityName("Error fetching city name");
			console.error("Error fetching city name:", error);
		}
	};

	const handleProfileClick = () => {
		setShowModal(!showModal);
	};

	const handleChangeAddress = () => {
		// Add functionality to update address via a form or API call
		const newAddress = prompt("Enter new address:", userAddress);
		if (newAddress && newAddress !== userAddress) {
			setUserAddress(newAddress);
			// Call an API to update the user's address in the database
		}
	};

	return (
		<header className="navbar-header">
			<div className="top-navbar">
				<div className="logo-container">
					<img src={logo} alt="Ayurvedic Logo" className="nav-logo" />
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
					<span className="topnav-username">{userName}</span>
					<img
						src={profilePic || defaultProfilePic}
						alt="Profile"
						className="profile-pic"
					/>
				</div>

				<NavLink to="/notifications" className="notification-icon">
					<img
						src={notificationIcon}
						alt="Notifications"
						className="notification-img"
					/>
				</NavLink>
			</div>

			{
				showModal && (
					<div className="profile-shadow" style={{
						height: "100vh", width: "100vw", backdropFilter: "blur(15px)",
						position: "absolute", top: "0", zIndex: "-100"
					}}></div>
				)
			}

			{showModal && (
				<div className="profile-modal" ref={modalRef}>
					<div className="close-modal" onClick={handleProfileClick}>
						&times;
					</div>
					<div className="user-profile" >
						<img src="https://images.unsplash.com/photo-1458696352784-ffe1f47c2edc?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="imgae" /></div>
					<h2>User Profile</h2>
					<div className="profile-details">
						<p>
							<strong>Name:</strong> {userName}
						</p>
						<p>
							<strong>Email:</strong> {userEmail}
						</p>
						<p>
							<strong>Phone:</strong> {userPhone}
						</p>
						<p>
							<strong>Address: </strong> {userAddress}
							<a
								href="#"
								onClick={handleChangeAddress}
								className="change-address-link"
							>
								{" "}
								(Change){" "}
							</a>
						</p>
					</div>
					<div className="modal-btn-container">
						<button onClick={handleSignOut} className="signout-btn">
							Sign Out
						</button>
					</div>
				</div>
			)}

			<nav className="navbar">
				<div className="left-item">
					<img
						src={locationIcon}
						alt="Location Icon"
						className="location-icon"
					/>
					<span className="location-text">{cityName || userLocation}</span>
				</div>
				<div className="center-items">
					{showMenu && (
						<div className="nav-menu">
							<ul className="nav-sidebar" style={{ width: "60%" }}>
								<img
									src={menu_close}
									alt="menu_close"
									onClick={handleMenuClose}
									style={{
										zIndex: "99",
									}}
								/>
								<li>
									<NavLink to="/patient-home" activeClassName="active">
										Home
									</NavLink>
								</li>
								<li>
									<NavLink to="/treatments" activeClassName="active">
										Treatments
									</NavLink>
								</li>
								<li>
									<NavLink to="/doctors" activeClassName="active">
										Doctors
									</NavLink>
								</li>
								<li>
									<NavLink to="/medicines" activeClassName="active">
										Medicines
									</NavLink>
								</li>
								<li>
									<NavLink to="/diet-yoga" activeClassName="active">
										Diet and Yoga Plan
									</NavLink>
								</li>
								<li>
									<NavLink to="/blogs-videos" activeClassName="active">
										Blogs and Videos
									</NavLink>
								</li>
								<li>
									<NavLink to="/cart" activeClassName="active">
										Cart
									</NavLink>
								</li>
								<li>
									<NavLink to="/order-history" activeClassName="active">
										Orders
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
							<NavLink to="/patient-home" activeClassName="active">
								Home
							</NavLink>
						</li>
            <li>
              <NavLink to="/appointed-doctor" activeClassName="active">
                Appointed Doctor
              </NavLink>
            </li>
						<li>
							<NavLink to="/treatments" activeClassName="active">
								Treatments
							</NavLink>
						</li>
						<li>
							<NavLink to="/doctors" activeClassName="active">
								Doctors
							</NavLink>
						</li>
						<li>
							<NavLink to="/medicines" activeClassName="active">
								Medicines
							</NavLink>
						</li>
						<li>
							<NavLink to="/diet-yoga" activeClassName="active">
								Diet and Yoga Plan
							</NavLink>
						</li>
						<li>
							<NavLink to="/blogs-videos" activeClassName="active">
								Blogs and Videos
							</NavLink>
						</li>
						<li>
							<NavLink to="/cart" activeClassName="active">
								Cart
							</NavLink>
						</li>
						<li>
							<NavLink to="/order-history" activeClassName="active">
								Orders
							</NavLink>
						</li>
					</ul>
				</div>
			</nav>
		</header>
	);
}

export default PatientNavBar;
