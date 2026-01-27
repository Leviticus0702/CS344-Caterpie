import React from "react";

const Logout = () => {
  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <div className="p-4">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white p-2 w-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
