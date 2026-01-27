import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import loadingGif from "../assets/loading-light.gif"; // Adjust if you want a loading gif here
import bgloop from "../assets/loopbg.mp4"; // Make sure the path to your video file is correct
import { FaSignInAlt, FaTools } from 'react-icons/fa';
import { FaUser, FaBars, FaBoxes, FaCogs} from 'react-icons/fa';

function CreateAccountPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isQuickSetup, setIsQuickSetup] = useState(false);
  const [role, setRole] = useState("M");
  const [showAdminMessage, setShowAdminMessage] = useState(false);
  const navigate = useNavigate();
  const [success, setSuccess] = useState("");
  const socket = useWebSocket();
  const location = useLocation();

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      console.log("Error: Passwords do not match");
      return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
      setError("You must be 18 years or older to create an account.");
      console.log("Error: User is under 18");
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log(`Sending role to socket: role,${role}`);
      socket.send(`role,${role}`);
      console.log(`Sending create account request: account,create,${username},${email},${password}`);
      socket.send(`account,create,${username},${email},${password}`);
    } else {
      setError("WebSocket connection is not open. Please try again later.");
      console.log("Error: WebSocket connection is not open");
      return;
    }

    socket.onmessage = (event) => {
      console.log("Message received from WebSocket:", event.data);
      if (event.data === "Account created successfully. You can now log in.") {
        if (role === "M") {
          setShowOptions(true);
          console.log("Merchant account created successfully");
        } else if (role === "A") {
          setShowOptions(false);
          if (setIsQuickSetup) {
            if (socket && socket.readyState === WebSocket.OPEN) {
              const loginMessage = `account,login,${email},${password}`;
              socket.send(loginMessage);
              console.log(loginMessage);
              navigate("/setup");
            } else {
              setError("WebSocket connection is not open. Please try again later.");
              console.log("Error: WebSocket connection is not open");
              return;
            }
          }
          setIsQuickSetup(false);
          console.log("Admin account created successfully");
        }
      } else if (event.data === "Email taken.") {
        setError("The email is already taken.");
        setEmail("");
        console.log("Error: Email is already taken");
      }
    };
  };

  const handleQuickSetup = () => {

    console.log("Quick Setup button clicked, transitioning to quick setup");

    setIsQuickSetup(true)
    setShowOptions(false);

  };

  const handleBeginQuickSetup = () => {

    if (socket && socket.readyState === WebSocket.OPEN) {
      const loginMessage = `account,login,${email},${password}`;
      socket.send(loginMessage);
    } else {
      setError("WebSocket connection is not open. Please try again later.");
      console.log("Error: WebSocket connection is not open");
      return;
    }

    socket.onmessage = (event) => {
      console.log("Message received from WebSocket:", event.data);
      if (event.data.includes("Logged in successfully")) {
        console.log("Begin Quick Setup button clicked, switching to admin account creation");
        setRole("A");
        setShowAdminMessage(true);
        setIsQuickSetup(false);
        setShowOptions(false);
      } else {
        console.log("Error: Login to account failed.");
      }
    };
  };

  // login/setup
  const setUpOptions = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Dark background */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Modal content */}
        <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
            Welcome to Pourtal!
          </h1>

          <div className="flex flex-col items-center">
            <p className="text-lg text-center text-gray-800">Set up your account and add popular drinks to your menu with "Quick Setup"</p>
            <button
              onClick={handleQuickSetup}
              className="w-60 h-19 p-3 m-5 bg-black text-white font-bold text-xl rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center"
            >
              <FaTools className="mr-3" />Start Quick Setup
            </button>
            <p className="text-lg text-center text-gray-800">Or, if you’re not ready, you can hit "Return to Login" to go back and sign in again.</p>
            <button
              onClick={() => {
                console.log("Returning to login");
                navigate("/login");
              }}
              className="w-60 h-19 p-3 m-5 bg-black text-white font-bold text-xl rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center"
            >
              <FaSignInAlt className="mr-3" /> Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  const beginSetup = () => {
    // if (isQuickSetup) {

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Dark background */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Modal content */}
        <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
            Setup Step
          </h1>

          <div className="flex flex-col items-center">
            <p className="text-lg text-center text-gray-800 mb-2">
            <FaUser className="inline-block mr-2" />Create admin account
            </p>
            <p className="text-lg text-center text-gray-800 mb-2"> 
            <FaBars className="inline-block mr-2" /> Menu selection
            </p>
            <p className="text-lg text-center text-gray-800 mb-2">
            <FaBoxes className="inline-block mr-2"/> Inventory selection
            </p>
            <p className="text-lg text-center text-gray-800 mb-2">
            <FaCogs className="inline-block mr-2"/> Account customization
            </p>
            <p className="text-lg text-center text-gray-800 mb-2">
            <FaSignInAlt className="inline-block mr-2" /> Login
            </p>
            <button
              onClick={handleBeginQuickSetup}
              className="w-60 h-19 p-3 m-5 bg-black text-white font-bold text-xl rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center"
            >
              Begin
            </button>
            <button
              onClick={() => {
                console.log("Returning to login");
                navigate("/login");
              }}
              className="w-60 h-19 p-3 m-2 bg-black text-white font-bold text-xl rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
    // return (
    //   <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    //     <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
    //       Welcome to Pourtal!
    //     </h1>
    //     <button
    //       onClick={() => {
    //         handleBeginQuickSetup(); 
    //       }}
    //       className="w-64 bg-black text-white p-4 rounded-lg text-lg font-bold hover:bg-blue-600"
    //     >
    //       Begin
    //     </button>
    //   </div>
    // );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-end bg-gray-100">
      {/* Video Background */}
      <video
        className="absolute inset-0 object-cover h-full w-full"
        src={bgloop}
        autoPlay
        loop
        muted
      ></video>

      {/* Overlay to darken the video */}
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}

      {/* Create Account Form */}
      {!showOptions && !isQuickSetup && (
        <div className="relative z-10 bg-white p-8 rounded shadow-md w-full max-w-md mr-12">
          {showAdminMessage && (
            <p className="text-red-500 mb-4">
              Please create your administrative account.
            </p>
          )}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <h1 className="text-2xl font-bold mb-6 text-center">
            {role === "A" ? "Create Admin Account" : "Create Merchant Account"}
          </h1>
          <form onSubmit={handleCreateAccount}>
            <div className="mb-4">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded hover:bg-blue-600"
            >
              {role === "A" ? "Create Admin Account" : "Create Merchant Account"}
            </button>
          </form>
        </div>
      )}

      {/* Footer to Cover the Watermark */}
      <div className="absolute bottom-0 left-0 w-full bg-black opacity-100 py-8 text-white text-center z-10">
        <p>&copy; 2024 Pourtal. All rights reserved.</p>
      </div>

      {/* Render the modal when showOptions is true */}
      {showOptions && setUpOptions()}

      {isQuickSetup && beginSetup()}
    </div>
  );
}

export default CreateAccountPage;
