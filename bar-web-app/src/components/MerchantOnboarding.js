import React, { useState } from "react";

const MerchantOnboarding = () => {
  const [merchant, setMerchant] = useState({ name: "", location: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, pass data to the backend or store it in the state
    console.log("Merchant Data:", merchant);
    // Reset form
    setMerchant({ name: "", location: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold">Merchant Onboarding</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Store Name</label>
        <input
          type="text"
          value={merchant.name}
          onChange={(e) => setMerchant({ ...merchant, name: e.target.value })}
          placeholder="Store Name"
          className="border p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Store Location</label>
        <input
          type="text"
          value={merchant.location}
          onChange={(e) =>
            setMerchant({ ...merchant, location: e.target.value })
          }
          placeholder="Store Location"
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        Sign Up
      </button>
    </form>
  );
};

export default MerchantOnboarding;
