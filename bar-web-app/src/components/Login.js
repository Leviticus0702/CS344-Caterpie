import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import loadingGif from "../assets/loading-light.gif";
import bgloop from "../assets/loopbg.mp4";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  const socket = useWebSocket();
  const location = useLocation();

  const intendedPage = location.state?.intendedPage || "/merchant-dashboard"; // Default to Merchant Dashboard

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log("Connected to WebSocket");
      };

      socket.onmessage = (event) => {
        console.log("Message received:", event.data);

        if (event.data.includes("Admin logged in successfully")) {
          socket.send("viewInventory");  // Send viewInventory message when admin logs in
        }

        if (event.data.includes("Logged in successfully")) {
          setLoading(false); // Stop showing loading GIF when login succeeds
          navigate(intendedPage);
        } else if (
          event.data.includes("Invalid credentials") ||
          event.data.includes("Account not found")
        ) {
          setLoading(false); // Stop loading when error occurs
          alert(event.data); // Show error message to the user
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket");
      };
    }
  }, [socket, navigate, intendedPage]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    const role = location.state?.role === "A" ? "role,A" : "role,M"; 

    if (socket && socket.readyState === WebSocket.OPEN) {
      const loginMessage = `account,login,${email},${password}`;
      socket.send(role); // Send the role (role,A or role,M)
      socket.send(loginMessage);

      if (role === "role,A") {
        navigate("/admin-home");  // Redirect to the admin homepage after successful login
      }
    } else {
      setLoading(false);
      alert("WebSocket connection is not open. Please try again later.");
    }
  };

  const handleSignUp = () => {
    const role = location.state?.role || "M";  // Default role is Merchant (M)
    navigate("/create-account", { state: { role } });
  };  

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <img src={loadingGif} alt="Loading..." className="w-50 h-50" />
    </div>
  ) : (
    <div className="relative min-h-screen flex items-center justify-end bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Video Background */}
      <video
        className="absolute inset-0 object-cover h-full w-full"
        src={bgloop}
        autoPlay
        loop
        muted
      ></video>

      {/* Dark Overlay */}
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}

      {/* Login Form */}
      <div className="relative z-10 bg-white bg-opacity-90 p-10 rounded-lg shadow-2xl w-1/4 mr-16">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mt-2 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mt-2 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
          >
            Login
          </button>
        </form>

        {/* Sign Up Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSignUp}
            className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-green-500 transition-colors"
          >
            Sign Up!
          </button>
        </div>
      </div>

      {/* Footer to Cover the Watermark */}
      <div className="absolute bottom-0 left-0 w-full bg-black opacity-100 py-8 text-white text-center z-10">
        <p>&copy; 2024 Pourtal. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
