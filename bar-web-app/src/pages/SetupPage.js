import React from 'react';
import DrinkSelection from '../components/DrinkSelection';

function SetupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      {/* Header Section */}
      <div className="bg-white text-black w-full p-10 mb-6 shadow-lg rounded-b-lg">
        <h1 className="text-4xl font-bold text-center">Menu Setup</h1>
        <p className="text-lg text-center">Select the drinks your bar offers.</p>
      </div>

      {/* Drinks Section */}
      <DrinkSelection />
    </div>
  );
}

export default SetupPage;
