import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ParkingList from "./pages/ParkingList";
import SlotList from "./pages/SlotList";
import MyBookings from "./pages/MyBookings";
import PaymentPage from "./pages/PaymentPage";
import ReceiptPage from "./pages/ReceiptPage";
import VerifyBooking from "./pages/VerifyBooking";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ParkingMap from "./pages/ParkingMap";
import AppLayout from "./components/AppLayout";
import UserDashboard from "./pages/UserDashboard";
import LotAdminDashboard from "./pages/LotAdminDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import ChatbotLauncher from "./components/chatbot/ChatbotLauncher";

const Protected = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <NotificationProvider>
      <NotificationContainer />
      <ChatbotLauncher />
      <BrowserRouter>
        <Routes>
          {/* Public Routes with standard Navbar (conditionally handles layout inside) */}
          <Route path="/" element={<><Navbar /><LandingPage /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/register" element={<><Navbar /><Register /></>} />
          <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
          <Route path="/admin/login" element={<><Navbar /><AdminLogin /></>} />

          {/* Protected SaaS Routes wrapped in AppLayout (Sidebar + Topbar) */}
          <Route path="/dashboard" element={<Protected><AppLayout><UserDashboard /></AppLayout></Protected>} />
          <Route path="/profile" element={<Protected><AppLayout><Profile /></AppLayout></Protected>} />
          <Route path="/settings" element={<Protected><AppLayout><Settings /></AppLayout></Protected>} />
          <Route path="/parking" element={<Protected><AppLayout><ParkingList /></AppLayout></Protected>} />
          <Route path="/map" element={<Protected><AppLayout><ParkingMap /></AppLayout></Protected>} />
          <Route path="/slots/:id" element={<Protected><AppLayout><SlotList /></AppLayout></Protected>} />
          <Route path="/payment/:bookingId" element={<Protected><AppLayout><PaymentPage /></AppLayout></Protected>} />
          <Route path="/receipt/:bookingId" element={<Protected><AppLayout><ReceiptPage /></AppLayout></Protected>} />
          <Route path="/verify/:bookingId" element={<Protected><AppLayout><VerifyBooking /></AppLayout></Protected>} />
          <Route path="/bookings" element={<Protected><AppLayout><MyBookings /></AppLayout></Protected>} />

          {/* Lot Admin Layout */}
          <Route path="/lot-admin" element={<Protected><AppLayout><LotAdminDashboard /></AppLayout></Protected>} />

          {/* Admin Layout */}
          <Route path="/admin" element={<Protected><AppLayout><AdminDashboard /></AppLayout></Protected>} />

        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
