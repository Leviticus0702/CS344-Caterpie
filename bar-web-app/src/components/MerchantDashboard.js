import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import { FaUserShield } from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai"; // Import the Close icon

const MerchantDashboard = () => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [searchInput, setSearchInput] = useState(""); // State for search input
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState(""); // State for storing the username

  const socket = useWebSocket();
  const navigate = useNavigate();

  const handleAdminRedirect = () => {
    navigate("/login", { state: { intendedPage: "/admin-home", role: "A" } }); // Include role A
  };
  const declineOrder = (orderId) => {
    const orderToDecline = incomingOrders.find((order) => order.id === orderId);
  
    if (orderToDecline) {
      // Send the decline message to the backend
      const declineMessage = `declineOrder,${orderToDecline.orderNumber},-`;
      console.log(declineMessage);
      socket.send(declineMessage);
  
      // Remove the declined order from the list of incoming orders
      setIncomingOrders(incomingOrders.filter((order) => order.id !== orderId));
  
      console.log(`Order ${orderId} declined`);
    }
  };
  useEffect(() => {
    // Retrieve the username from local storage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log("Connected to WebSocket");
        socket.send("viewOrdersMenu");
      };

      socket.onmessage = (event) => {
        console.log("Message received from server:", event.data);
        const data = event.data.split(",");
        const action = data[0];

        if (event.data === "correct_otp") {
          setCompletedOrders(
            completedOrders.filter((order) => order.id !== selectedOrder.id)
          );
          setShowOtpModal(false);
        } else if (event.data === "wrong_otp") {
          setOtpError("Wrong OTP. Please try again.");
        } else if (action === "order") {
          const newOrder = {
            id: data[1],
            orderNumber: data[1],
            drinks: data[2] ? data[2].split("/") : [],
            quantities: data[3] ? data[3].split("/") : [],
            cost: data[4] || "0",
            specialInstructions: data[5] ? data[5].split("/") : [], // Split multiple instructions
          };
          setIncomingOrders((prevOrders) => [...prevOrders, newOrder]);
        } else {
          const [action, ...orderParts] = event.data.split(",");
          const orders = orderParts
            .join(",")
            .split(";")
            .map((orderStr) => {
              const [
                orderNumber,
                drinksStr = "",
                quantitiesStr = "",
                cost = "",
                specialInstructionsStr = "", // Handle multiple instructions
              ] = orderStr.split(",");
              return {
                id: orderNumber,
                orderNumber: orderNumber,
                drinks: drinksStr ? drinksStr.split("/") : [],
                quantities: quantitiesStr ? quantitiesStr.split("/") : [],
                cost: cost,
                specialInstructions: specialInstructionsStr
                  ? specialInstructionsStr.split("/")
                  : [],
              };
            });

          if (action === "incomingOrders") {
            setIncomingOrders(orders);
          } else if (action === "acceptedOrders") {
            setAcceptedOrders(orders);
          } else if (action === "completedOrders") {
            setCompletedOrders(orders);
          }
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket");
      };
    }
  }, [socket, selectedOrder, completedOrders]);

  const moveToAccepted = (orderId) => {
    const orderToMove = incomingOrders.find((order) => order.id === orderId);

    setAcceptedOrders([...acceptedOrders, orderToMove]);
    setIncomingOrders(incomingOrders.filter((order) => order.id !== orderId));

    const acceptMessage = `accept,${orderToMove.orderNumber}`;
    socket.send(acceptMessage);
  };

  const markAsCompleted = (orderId) => {
    const orderToComplete = acceptedOrders.find(
      (order) => order.id === orderId
    );
    setCompletedOrders([...completedOrders, orderToComplete]);
    setAcceptedOrders(acceptedOrders.filter((order) => order.id !== orderId));

    const readyMessage = `ready,${orderToComplete.orderNumber}`;
    socket.send(readyMessage);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    socket.send("logout");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDeclinedOrdersClick = () => {
    navigate("/declined-orders");
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOtpModal(true);
    setOtp("");
    setOtpError("");
  };

  const submitOtp = () => {
    if (otp) {
      const collectMessage = `collect,${selectedOrder.orderNumber},${otp}`;
      socket.send(collectMessage);
    } else {
      setOtpError("OTP cannot be empty.");
    }
  };

  // Function to render order details with corresponding special instructions
  const renderOrderDetails = (order) => (
    <>
      {order.drinks.map((drink, index) => (
        <div key={index} className="flex flex-col">
          <div className="flex justify-between">
            <span>{drink}</span>
            <span>x{order.quantities[index]}</span>
          </div>
          {/* Conditionally render the special instruction if it exists and is not 'null' */}
          {order.specialInstructions[index] &&
            order.specialInstructions[index].trim().toLowerCase() !==
              "null" && (
              <div className="mt-2 bg-yellow-100 p-2 rounded-md">
                <strong>Special Instruction:</strong>{" "}
                {order.specialInstructions[index]}
              </div>
            )}
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 w-full">
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Icon */}
          <FaBars
            className="text-2xl cursor-pointer"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          />
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Pourtal
          </h2>
        </div>

        {/* Centered Search Bar */}
        <div className="flex-grow flex justify-center">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-96"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Admin Icon */}
          <button
            onClick={handleAdminRedirect}
            className="flex flex-col items-center text-gray-700"
          >
            <FaUserShield className="text-3xl" />
            <span className="text-sm">Admin</span>
          </button>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-red-600 hover:-translate-y-1 hover:shadow-xl"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 z-50 transform transition-all duration-300 ${
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
      >
        <div className="flex justify-end">
          <AiOutlineClose
            className="text-2xl cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
        <h3 className="text-2xl font-bold mb-4">{username}</h3>
        <button
          onClick={() => navigate("/manage-account", { state: { role: "M" } })}
          className="text-gray-700 hover:text-blue-500"
        >
          Manage Account
        </button>
        <button
          onClick={handleDeclinedOrdersClick}
          className="text-gray-700 hover:text-blue-500"
        >
          Declined Orders
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Incoming Orders: {incomingOrders.length}
          </h2>
          {incomingOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-white rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl mb-4"
            >
              <p className="font-semibold text-lg text-gray-700">
                Order #{order.orderNumber}
              </p>
              <div className="mt-4">{renderOrderDetails(order)}</div>
              <p className="mt-4 text-right text-xl font-bold text-gray-800">
                Total: R {parseFloat(order.cost).toFixed(2)}
              </p>
              {/* Accept and Decline Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => moveToAccepted(order.id)}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600 hover:-translate-y-1 hover:shadow-xl"
                >
                  Accept Order
                </button>
                <button
                  onClick={() => declineOrder(order.id)}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-red-600 hover:-translate-y-1 hover:shadow-xl"
                >
                  Decline Order
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Accepted Orders: {acceptedOrders.length}
          </h2>
          {acceptedOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-white rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl mb-4"
            >
              <p className="font-semibold text-lg text-gray-700">
                Order #{order.orderNumber}
              </p>
              <div className="mt-4">{renderOrderDetails(order)}</div>
              <p className="mt-4 text-right text-xl font-bold text-gray-800">
                Total: R {parseFloat(order.cost).toFixed(2)}
              </p>
              <button
                onClick={() => markAsCompleted(order.id)}
                className="mt-6 w-full px-4 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600 hover:-translate-y-1 hover:shadow-xl"
              >
                Complete Order
              </button>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Completed Orders: {completedOrders.length}
          </h2>
          {completedOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-white rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl mb-4 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOrderClick(order)}
            >
              <p className="font-semibold text-lg text-gray-700">
                Order #{order.orderNumber}
              </p>
              <div className="mt-4">{renderOrderDetails(order)}</div>
              <p className="mt-4 text-right text-xl font-bold text-gray-800">
                Total: R {parseFloat(order.cost).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transition transform hover:-translate-y-1 hover:shadow-xl">
            <p className="text-xl font-semibold mb-6 text-gray-800">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center">
              <button
                onClick={confirmLogout}
                className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-red-600 hover:-translate-y-1 hover:shadow-xl mr-2"
              >
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
                className="px-6 py-2 bg-black text-gray-700 rounded-lg shadow-lg transition transform hover:bg-gray-400 hover:-translate-y-1 hover:shadow-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transition transform hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Order #{selectedOrder?.orderNumber}
            </h2>
            <p className="mb-4 text-gray-600">
              Enter the OTP to complete this order:
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {otpError && <p className="text-red-500 mb-4">{otpError}</p>}
            <div className="flex justify-center">
              <button
                onClick={submitOtp}
                className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600 hover:-translate-y-1 hover:shadow-xl mr-2"
              >
                Submit OTP
              </button>
              <button
                onClick={() => setShowOtpModal(false)}
                className="px-6 py-2 bg-black text-gray-700 rounded-lg shadow-lg transition transform hover:bg-gray-400 hover:-translate-y-1 hover:shadow-xl"
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

export default MerchantDashboard;
