import React, { useState, Suspense, lazy, useEffect } from "react";
import { AiFillHome, AiOutlineMenu } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { useWebSocket } from "../contexts/WebSocketContext"; // Import WebSocket context

// Lazy load components
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const Specials = lazy(() => import("./Specials"));
const EditMenu = lazy(() => import("./EditMenu"));

const AdminHomePage = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [specialsData, setSpecialsData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [username, setUsername] = useState("Admin"); // Add state for username
  const navigate = useNavigate();
  const socket = useWebSocket(); // Get WebSocket instance

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("viewAccountDetails,A"); // Send account details request
    }

    // Handle incoming messages for account details
    const handleIncomingMessage = (event) => {
      const message = event.data;

      // Assuming the message format is something like: "accountDetails:<username>"
      if (message.startsWith("Username :")) {
        const fetchedUsername = message.replace("Username :", "").trim();
        setUsername(fetchedUsername); // Set the fetched username
      }
    };

    socket.addEventListener("message", handleIncomingMessage);

    // Cleanup listener on unmount
    return () => {
      socket.removeEventListener("message", handleIncomingMessage);
    };
  }, [socket]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <AdminDashboard
            searchInput={searchInput}
            setInventoryData={setInventoryData}
            inventoryData={inventoryData}
          />
        );
      case "specials":
        return (
          <Specials
            searchInput={searchInput}
            setSpecialsData={setSpecialsData}
            specialsData={specialsData}
          />
        );
      case "editMenu":
        return (
          <EditMenu
            searchInput={searchInput}
            setMenuData={setMenuData}
            menuData={menuData}
          />
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <div className="flex items-center space-x-4">
          <AiOutlineMenu
            className="text-3xl cursor-pointer"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          />
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Pourtal
          </h2>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-96"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "inventory"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } rounded`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "specials"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } rounded`}
            onClick={() => setActiveTab("specials")}
          >
            Specials
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "editMenu"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            } rounded`}
            onClick={() => setActiveTab("editMenu")}
          >
            Edit Menu
          </button>
          <Link
            to="/login"
            className="flex flex-col items-center text-gray-700"
            onClick={() => {
              navigate("/login");
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send("viewOrdersMenu"); // Send message before navigating
              }
            }}
          >
            <AiFillHome className="text-3xl" />
            <span className="text-sm">Home</span>
          </Link>
        </div>
      </header>

      {/* Sidebar Panel */}
      {isSidebarOpen && (
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 z-50`}
        >
          <div className="flex justify-end">
            <AiOutlineClose
              className="text-2xl cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
          <h3 className="text-2xl font-bold mb-4">{username}</h3>{" "}
          {/* Display username */}
          <button
            onClick={() =>
              navigate("/manage-account", { state: { role: "A" } })
            }
            className="text-gray-700 hover:text-blue-500"
          >
            Manage Account
          </button>
          <button
            onClick={() => navigate("/order-history")}
            className="text-gray-700 hover:text-blue-500 mt-4"
          >
            Order History
          </button>
        </div>
      )}

      {/* Main Content */}
      <Suspense fallback={<div>Loading...</div>}>
        <div className="bg-white p-4 rounded shadow-md">
          {renderActiveTab()}
        </div>
      </Suspense>
    </div>
  );
};

export default AdminHomePage;
