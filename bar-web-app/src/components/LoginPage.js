import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  // LoginPage.js
  const handleLogin = (role) => {
    navigate(`/login?role=${role}`, { state: { role } }); // Pass the role in state
  };

  const handleCreateAccount = () => {
    navigate("/create-account");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">
        Welcome! Please Choose an Option
      </h1>
      <div className="flex flex-col">
        <button
          onClick={() => handleLogin("admin")}
          className="m-2 p-4 bg-blue-500 text-white rounded"
        >
          Login as Admin
        </button>
        <button
          onClick={() => handleLogin("merchant")}
          className="m-2 p-4 bg-green-500 text-white rounded"
        >
          Login as Merchant
        </button>
        <button
          onClick={handleCreateAccount}
          className="m-2 p-4 bg-gray-500 text-white rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
