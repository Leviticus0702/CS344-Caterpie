import React from "react";
import { FaBeer } from "react-icons/fa"; // Placeholder drink logo
import "./Header.css"; // Import the CSS file for styling

const Header = () => {
  return (
    <div className="header-banner">
      <div className="logo-section">
        <FaBeer className="logo-icon" />
        <h1 className="app-name">Pourtal</h1>
      </div>
      <h2 className="dashboard-name">Merchant Dashboard</h2>
    </div>
  );
};

export default Header;
