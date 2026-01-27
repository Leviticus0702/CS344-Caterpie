import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useUserContext} from '../context/UserContext';
import { useWebSocket } from '../context/WebSocketContext'; 


const ManageAccount = () => {
    const [activeTab, setActiveTab] = useState('account-info'); // Track active tab
    const [profilePic, setProfilePic] = useState(null);
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation();
    const { username, setUsername} = useUserContext();
    const { email, setEmail } = useUserContext();
    const socket = useWebSocket();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');


    const handlePasswordChanges = (e) => {

        // Check if both fields have values
        if (!password || !confirmPassword) {
            alert('Please fill in both password fields.');
            return;
        }

        // Optional: Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(`resetPassword,${email},${password},${confirmPassword}`); // Send logout message
                console.log("command sent to db")
                navigate('/client-home')
            } else {
                alert("WebSocket connection is not open. Please try again later.");
            }

        socket.onmessage = (event) => {
            const message = event.data;
            if (message.includes('Success: Your password has been reset.')) {
              setMessage('Account created. Redirecting to login...');
              setMessageType('success');
              setTimeout(() => {
                navigate('/client-home')
              }, 2000);
            } else {
                console.error('Unexpected message from server:', message);
            } 
          };
    };

    const handleProfilePicChange = (e) => {
        setProfilePic(URL.createObjectURL(e.target.files[0]));
    };
    const { username: stateUsername, email: stateEmail } = location.state || {};
    console.log(username)
    var old_username = username;
    var old_email = email;
    console.log("username: ", old_username)
    console.log("new username: ", newUsername)
    //implment the submission of new values

    useEffect(() => {
        // Your function that should run once
        console.log("This runs only once when the component mounts");
        setNewUsername(username)
        // Optional cleanup function
        return () => {
          console.log("Cleanup if needed when component unmounts");
        };
      }, []); // The empty dependency array ensures this effect runs only onc 

    const handleSaveChanges = (e) => {
        // Implement save functionality here
        console.log("Update username in db")
        if (old_username!=newUsername){
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(`resetUsername,${email},${newUsername}`); // Send logout message
                console.log("command sent to db")
                navigate('/client-home')
            } else {
                alert("WebSocket connection is not open. Please try again later.");
            }
        }else{
            alert('Username is unchanged');
        }
        socket.onmessage = (event) => {
            const message = event.data;
            if (message.includes('Your Username has been reset')) {
              setMessage('Account created. Redirecting to login...');
              setMessageType('success');
              setTimeout(() => {
                navigate('/login');
              }, 2000);
            } else {
                console.error('Unexpected message from server:', message);
            } 
          };
        
        
    };



    return (
        <div>
            <div className="w-full bg-black p-4 flex justify-between items-center">
                <h1 className="text-white text-lg font-bold">Pourtal Account</h1>
                <button
                    onClick={() => navigate('/client-home')} // Navigate back to client-home
                    className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                    Back to Merchants
                </button>
            </div>
            <div className="flex flex-row">
                {/* Sidebar */}
                <div className="w-1/4 p-4  bg-gray-100 min-h-screen">
                    <ul>
                        <li
                            className={`cursor-pointer mb-4 ${activeTab === 'account-info' ? 'font-bold' : ''}`}
                            onClick={() => setActiveTab('account-info')}
                        >
                            Account Info
                        </li>
                        <li
                            className={`cursor-pointer mb-4 ${activeTab === 'security' ? 'font-bold' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            Security
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="w-full sm:w-3/4 p-4 sm:p-8">
                    {/* Account Info Section */}
                    {activeTab === 'account-info' && (
                        <>
                            <h1 className="text-2xl font-semibold mb-6">Account Management</h1>
                            <h2><strong>Welcome, {username} </strong></h2>

                            <div className="mb-6 flex items-center">
                                {/* Profile Image */}
                                <div className="mr-4">
                                    {profilePic ? (
                                        <img src={profilePic} alt="Profile"
                                             className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover aspect-square"/>
                                    ) : (
                                        <img
                                            src="https://via.placeholder.com/150"
                                            alt="Profile"
                                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover aspect-square"
                                        />
                                    )}
                                </div>

                                {/* File Input */}
                                <div className="flex-grow">
                                    <input
                                        type="file"
                                        onChange={handleProfilePicChange}
                                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 w-full"
                                    />
                                </div>
                            </div>


                            {/* Basic Info */}
                            <div className="mb-6">
                                <form onSubmit={handleSaveChanges}>
                                    {message && (
                                        <p className={`mb-4 ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                            {message}
                                        </p>
                                    )}
                                    <h2 className="text-lg font-semibold">Basic Info</h2>
                                    <div className="mt-4">
                                        <label className="block font-semibold">Name</label>
                                        <input
                                            type="text"
                                            value={newUsername || ""}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="w-full p-2 mt-1 border rounded"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full mt-4 px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-blue-600"
                                    >
                                        Update
                                    </button>
                                </form>
                            </div>

                            <div className="mt-4">
                                <label className="block font-semibold">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 mt-1 border rounded"
                                    disabled
                                />
                            </div>
                        </>
                    )}

                    {/* Security Section */}
                    {activeTab === 'security' && (
                        <>
                            <h1 className="text-2xl font-semibold mb-6">Security</h1>

                            <div className="mb-6">
                                <form onSubmit={handlePasswordChanges}>
                                    <h2 className="text-lg font-semibold">Change Password</h2>
                                    <div className="mt-4">
                                        <label className="block font-semibold">New Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-2 mt-1 border rounded"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <label className="block font-semibold">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-2 mt-1 border rounded"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full mt-4 px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-blue-600"
                                    >
                                        Change
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAccount;