import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const socket = useWebSocket();

  const handleSignUp = (e) => {
    e.preventDefault();

    const age = calculateAge(new Date(dateOfBirth));
    if (age < 18) {
      setMessage('You must be 18 years or older to sign up.');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      setMessageType('error');
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send('role,C');
      socket.send(`account,create,${username},${email},${password}`);
    } else {
      setMessage('WebSocket connection is not open. Please try again later.');
      setMessageType('error');
      return;
    }

    socket.onmessage = (event) => {
      const message = event.data;
      if (message.includes('Account created successfully')) {
        setMessage('Account created. Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (message.includes('Email taken')) {
        setMessage('The email is already taken.');
        setMessageType('error');
        setEmail('');
      } else {
        console.error('Unexpected message from server:', message);
      }
    };
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
          <form onSubmit={handleSignUp}>
            {message && (
                <p className={`mb-4 ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {message}
                </p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Username"
                  required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Email"
                  required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Password"
                  required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Confirm Password"
                  required
              />
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
              Create Account
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
                onClick={() => navigate('/login')}
                className="text-blue-500 hover:underline"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      </div>
  );
}

export default SignUp;
