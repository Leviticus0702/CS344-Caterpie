import React, { useState, useEffect, useContext, act } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../context/WebSocketContext';
import UserContext from '../context/UserContext';  // Import UserContext

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const socket = useWebSocket();
  const { setEmail: setUserEmail } = useContext(UserContext);  // Destructure setUserEmail from context

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log("Connected to WebSocket");
      };

      socket.onmessage = (event) => {
        if (event.data.includes("Logged in successfully")) {
          setUserEmail(email);  // Store the email in context
          navigate("/client-home");
        } else if (event.data.includes("Invalid credentials") || event.data.includes("Account not found")) {
          alert(event.data);
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket");
      };
    }
  }, [socket, navigate, email, setUserEmail]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (socket && socket.readyState === WebSocket.OPEN) {
      const role = 'role,C';
      const loginMessage = `account,login,${email},${password}`;
      socket.send(role);
      socket.send(loginMessage);
    } else {
      alert("WebSocket connection is not open. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email:</label>
            <input
              id="email" // Added id for association
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password:</label>
            <input
              id="password" // Added id for association
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <button
          onClick={() => navigate('/sign-up')}
          className="w-full mt-4 px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-green-600"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
