import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import CreateAccountPage from "./components/CreateAccountPage";
import MerchantDashboard from "./components/MerchantDashboard";
import { WebSocketProvider } from "./contexts/WebSocketContext"; // Import the WebSocket context provider
import AdminHomePage from "./components/AdminHomePage";
import ManageAccountPage from "./components/ManageAccountPage";
import OrderHistory from "./components/OrderHistory"; // Import the OrderHistory component
import SetupPage from './pages/SetupPage';
import DeclinedOrders from './components/DeclinedOrders';

function App() {
  return (
    <WebSocketProvider>
      {" "}
      {/* Wrap the entire Router with WebSocketProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
          <Route path="/admin-home" element={<AdminHomePage />} />
          <Route path="/manage-account" element={<ManageAccountPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/declined-orders" element={<DeclinedOrders />} />
          {/* Add the Orders route here if needed */}
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
