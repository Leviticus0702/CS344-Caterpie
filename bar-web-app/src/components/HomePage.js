import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Home Page</h1>
      <Link to="/admin" className="text-blue-500 underline">
        Go to Admin Dashboard
      </Link>
    </div>
  );
};

export default HomePage;
