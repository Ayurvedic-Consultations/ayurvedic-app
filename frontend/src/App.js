import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomeScreen from './screens/HomeScreen';
import MedicinesScreen from './screens/Medicines';
import DietYogaScreen from './screens/Patients/DietYogaComponent';
import NavBar from './screens/Navbar';
import PatientNavBar from './screens/Patients/PatientNavBar';  // Patient specific navbar
import DoctorNavBar from './screens/Doctors/DoctorNavBar';    // Doctor specific navbar
import RetailerNavBar from './screens/Retailers/RetailerNavBar'; // Retailer specific navbar
import ChatbotWidget from './components/ChatbotWidget';

// import BlogsVideosScreen from './screens/BlogsVideosScreen';
import BlogsVideosScreen from './screens/BlogVideos/BlogsVideosScreen';

import CartScreen from './screens/Cart';
import PaymentScreen from './screens/Payment';
import BlogScreen from './screens/Blogs';
import Blog from './screens/BlogVideos/Blog';
import DoctorsScreen from './screens/DoctorsScreen';
import DoctorDetailPage from './screens/Patients/DoctorDetailPage';
import DoctorReviewsPage from './screens/Doctors/DoctorReviewsPage';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignUpPatientScreen from './screens/Patients/SignUpPatientScreen';
import SignUpDoctorScreen from './screens/Doctors/SignUpDoctorScreen';
import SignUpRetailerScreen from './screens/Retailers/SignUpRetailerScreen';
import PrakritiDetermination from './screens/Patients/PrakritiDetermination';
import TreatmentsScreen from './screens/Treatments';
import AppointedDoctor from './screens/Patients/Appointments/AppointedDoctor';
import Payment from './screens/Patients/Appointments/PaymentPage';
import PatientPage from './screens/Patients/PatientPage'
import OrderHistory from './screens/Patients/OrderHistory';
import DoctorHomeScreen from './screens/Doctors/DoctorHomeScreen';
import DoctorAnalytics from './screens/Doctors/DoctorAnalytics';
import CurrentRequests from './screens/Doctors/CurrentRequests';
import AppointmentSlots from './screens/Doctors/AppointmentSlots';
import PatientList from './screens/Doctors/PatientList';
import HealthBlogs from './screens/Doctors/HealthBlogs';
import TreatmentDetailsScreen from './screens/TreatmentDetailsScreen';
import CheckoutScreen from './screens/CheckoutScreen';

import AdminPage from './screens/admin/AdminPage';
import AdminUsers from './screens/admin/AdminUsers';
import AdminDoctors from './screens/admin/doctors/AdminDoctors';
import AdminRetailers from './screens/admin/Retailer/AdminRetailers';
import AdminNavBar from './screens/admin/AdminNavbar';
import AdminBlogs from './screens/admin/AdminBlogs';
import AdminBlogsUpdate from './screens/admin/AdminBlogsUpdate';

import RetailerDashboard from './screens/Retailers/RetailerDashboard';
import ManageProducts from './screens/Retailers/ManageProducts';
import RetailerAnalytics from './screens/Retailers/RetailerAnalytics';
import MyOrders from './screens/Retailers/MyOrders';
import CustomerSupport from './screens/Retailers/CustomerSupport';

import Footer from './screens/Footer';
import Notification from './screens/Patients/Notification'; // Patient notifications
import DoctorNotification from './screens/Doctors/DoctorNotification'; // Doctor notifications
import RetailerNotification from './screens/Retailers/RetailerNotification';
import { AuthContext } from './context/AuthContext';
import PaymentPage from './screens/Patients/Appointments/PaymentPage';

// make changes by myself
import PatientFullDetails from "./screens/admin/patient/PatientFullDetails";
import DoctorFullDetails from './screens/admin/doctors/DoctorFullDetails';
import Transactions from './screens/admin/transactions';
import RetailerManagement from './screens/admin/Retailer/RetailerManagement';
import Patientprofile from './screens/admin/patient/PatientProfile';
import DoctorList from './screens/admin/doctors/DoctorList';
import RetailerFullDetails from './screens/admin/Retailer/RetailerFullDetails';
import { PatientHeader } from './screens/Doctors/doctorPrescribe/PatientHeader';
import DoctorPrescribe from './screens/Doctors/doctorPrescribe/Doctor-Prescribe';
import PrescribeIndex from './screens/Doctors/doctorPrescribe/PrescribeIndex';
import PatientFeedback from './screens/Patients/PatientFeedback';
import BuyerFeedback from './screens/Patients/BuyerFeedback';

function App() {
  const { auth } = useContext(AuthContext);
  const renderNavBar = () => {
    switch (auth.role) {
      case 'patient':
        return <PatientNavBar />;
      case 'doctor':
        return <DoctorNavBar />;
      case 'retailer':
        return <RetailerNavBar />;
      case 'admin':
        return <AdminNavBar />;
      default:
        return <NavBar />;
    }
  };

  return (
    <Router>
      {renderNavBar()}
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/signin" element={<SignInScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/treatments" element={<TreatmentsScreen />} />
        <Route path="/treatment/:category" element={<TreatmentDetailsScreen />} />
        <Route path="/diet-yoga" element={<DietYogaScreen />} />
        <Route path="/blogs-videos" element={<BlogsVideosScreen />} />
        <Route path="/blogs" element={<BlogScreen />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/doctors" element={<DoctorsScreen />} />
        <Route path="/doctor-detail" element={<DoctorDetailPage />} />

        <Route path="/signup-patient" element={<SignUpPatientScreen />} />
        <Route path="/signup-doctor" element={<SignUpDoctorScreen />} />
        <Route path="/signup-retailer" element={<SignUpRetailerScreen />} />
        <Route path="/prakritidetermination" element={<PrakritiDetermination />} />
        <Route path="/appointed-doctor" element={<AppointedDoctor />} />
        <Route path="/payment2" element={<PaymentPage />} />
        <Route path="/patient-home" element={<PatientPage />} />

        <Route path="/admin-home" element={<AdminPage />} />
        <Route path="/admin/consultations" element={<DoctorList />} />
        <Route path="/admin/blogs" element={<AdminBlogs />} />
        <Route path="/admin/blogs/update/:id" element={<AdminBlogsUpdate />} />
        <Route path="/patients/:id" element={<Patientprofile />} />
        <Route path="/admin/consultations/:id" element={<DoctorFullDetails />} />
        <Route path="/admin/transactions" element={<Transactions />} />
        <Route path="/admin/medicine-orders" element={<RetailerManagement />} />
        <Route path="/admin/users" element={<PatientFullDetails />} />
        <Route path="/admin/medicine-orders/:id" element={<RetailerFullDetails />} />

        <Route path="/profile/doctor/:id" element={<DoctorFullDetails />} />
        <Route path="/profile/retailer/:id" element={<RetailerFullDetails />} />
        <Route path="/profile/patient/:id" element={<Patientprofile />} />



          

        <Route element={<ProtectedRoute />}>
          <Route path="/current-requests" element={<CurrentRequests />} />
          {/* my changes */}

          {/* <Route path ="/patient-header" element={<PatientHeader/>} />
          <Route path="/doctor-prescribe" element={<DoctorPrescribe/>} /> */}
          <Route path ="/PatientFeedback/:id" element={<PatientFeedback/>} />
          <Route path ="/BuyerFeedback/:id" element={<BuyerFeedback/>} />
          <Route path="/doctorsprescribe" element={<PrescribeIndex />}/>
          <Route path="/doctor-home" element={<DoctorHomeScreen />} />
          <Route path="/appointment-slots" element={<AppointmentSlots />} />
          <Route path="/doctor-analytics" element={<DoctorAnalytics />} />
          <Route path="/patient-list" element={<PatientList />} />
          <Route path="/health-blogs" element={<HealthBlogs />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/medicines" element={<MedicinesScreen />} />
          <Route path="/retailer-home" element={<RetailerDashboard />} />
          <Route path="/doctor-notifications" element={<DoctorNotification />} />
          <Route path="/manage-products" element={<ManageProducts />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/doctor-reviews" element={<DoctorReviewsPage />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/retailer-analytics" element={<RetailerAnalytics />} />
          <Route path="/retailer-notifications" element={<RetailerNotification />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/customer-support" element={<CustomerSupport />} />
        </Route>
      </Routes>
      <Footer />
      <ChatbotWidget />
    </Router>
  );
}

export default App;
