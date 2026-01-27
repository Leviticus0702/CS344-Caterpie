import React from "react";

const ViewUsers = ({ type }) => {
  const handleViewUsers = () => {
    const command = type === "customers" ? "viewCustomers" : "viewMerchants";
    console.log(command);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleViewUsers}
        className="bg-green-500 text-white p-2 w-full"
      >
        View {type === "customers" ? "Customers" : "Merchants"}
      </button>
    </div>
  );
};

export default ViewUsers;
