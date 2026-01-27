import React, { useState } from "react";

const ModifyInventory = ({ type }) => {
  const [inventory, setInventory] = useState({ drinkName: "", quantity: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const command = type === "increase" ? "incInventory" : "decInventory";
    console.log(`${command},${inventory.drinkName},${inventory.quantity}`);
    setInventory({ drinkName: "", quantity: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold">
        {type === "increase" ? "Increase Inventory" : "Decrease Inventory"}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700">Drink Name</label>
        <input
          type="text"
          value={inventory.drinkName}
          onChange={(e) =>
            setInventory({ ...inventory, drinkName: e.target.value })
          }
          placeholder="Drink Name"
          className="border p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Quantity</label>
        <input
          type="number"
          value={inventory.quantity}
          onChange={(e) =>
            setInventory({ ...inventory, quantity: e.target.value })
          }
          placeholder="Quantity"
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        {type === "increase" ? "Increase" : "Decrease"}
      </button>
    </form>
  );
};

export default ModifyInventory;
