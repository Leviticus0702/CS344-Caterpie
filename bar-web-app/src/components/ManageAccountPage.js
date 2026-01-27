import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation for detecting route
import { useWebSocket } from "../contexts/WebSocketContext"; // Assuming WebSocket context is available

const ManageAccountPage = () => {
  // State to handle the current section
  const [activeSection, setActiveSection] = useState("Account Info"); // Default to "Account Info"
  const [newUsername, setNewUsername] = useState(""); // Store new username
  const [password, setPassword] = useState(""); // New password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal for confirming changes
  const [modalType, setModalType] = useState(""); // Type of modal: username or password

  const navigate = useNavigate();
  const socket = useWebSocket();
  const location = useLocation();

  // Retrieve role from the state passed in the navigation
  const role = location.state?.role || "M"; // Default to "M" if no state is passed

  // Function to navigate back to the correct dashboard
  const goToDashboard = () => {
    if (role === "A") {
      navigate("/admin-home"); // Navigate to Admin Dashboard
    } else {
      socket.send("viewOrdersMenu");
      navigate("/merchant-dashboard"); // Navigate to Merchant Dashboard
    }
  };

  // Open confirmation modal for either username or password change
  const openConfirmModal = (type) => {
    setModalType(type);
    setShowConfirmModal(true);
  };

  // Close confirmation modal
  const closeModal = () => {
    setShowConfirmModal(false);
  };

  // Handle confirming username change
  const confirmUsernameChange = () => {
    socket.send(`updateUsername,${role},${newUsername}`);
    alert(`Username updated to: ${newUsername}`);
    setNewUsername(""); // Clear the username field after change
    closeModal();
  };

  // Handle confirming password change
  const confirmPasswordChange = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    socket.send(`updatePassword,${role},${password}`);
    alert("Password updated successfully.");
    setPassword(""); // Clear password fields after change
    setConfirmPassword("");
    closeModal();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Black Band */}
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <h3 className="text-xl font-bold">Pourtal Account</h3>
        <button
          onClick={goToDashboard}
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          {role === "A" ? "Back to Admin Dashboard" : "Back to Merchants"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-200 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection("Account Info")}
                className={`w-full text-left p-2 rounded-md ${
                  activeSection === "Account Info" ? "bg-gray-300" : ""
                }`}
              >
                Account Info
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("Security")}
                className={`w-full text-left p-2 rounded-md ${
                  activeSection === "Security" ? "bg-gray-300" : ""
                }`}
              >
                Security
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-8">
          {activeSection === "Account Info" && (
            <>
              <h2 className="text-3xl font-bold mb-6">Account Info</h2>

              {/* Profile Picture */}
              <div className="flex items-center mb-6">
                <img
                  src="/default-profile.png" // Placeholder image
                  alt="Profile"
                  className="w-16 h-16 rounded-full mr-4"
                />
                <button className="bg-gray-300 text-sm px-4 py-2 rounded-md">
                  Browse...
                </button>
                <span className="ml-2 text-gray-600">No file selected.</span>
              </div>

              {/* Username Field */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)} // Allow editing
                    className="border border-gray-300 p-2 rounded-lg w-full"
                  />
                </div>
                <button
                  onClick={() => openConfirmModal("username")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                >
                  Confirm Username Change
                </button>
              </div>
            </>
          )}

          {activeSection === "Security" && (
            <>
              <h2 className="text-3xl font-bold mb-6">Security</h2>

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    className="border border-gray-300 p-2 rounded-lg w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="border border-gray-300 p-2 rounded-lg w-full"
                  />
                </div>

                <button
                  onClick={() => openConfirmModal("password")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                >
                  Change Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transition transform hover:-translate-y-1 hover:shadow-xl">
            <p className="text-xl font-semibold mb-6 text-gray-800">
              {modalType === "username"
                ? "Are you sure you want to change your username?"
                : "Are you sure you want to change your password?"}
            </p>
            <div className="flex justify-center">
              <button
                onClick={
                  modalType === "username"
                    ? confirmUsernameChange
                    : confirmPasswordChange
                }
                className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg transition transform hover:bg-green-600 hover:-translate-y-1 hover:shadow-xl mr-2"
              >
                Yes, Confirm
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-lg transition transform hover:bg-gray-400 hover:-translate-y-1 hover:shadow-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccountPage;
