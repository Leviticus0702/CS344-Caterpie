import React, { useState, useContext } from "react";
import { DrinkContext } from "../contexts/DrinkContext";

const AddDrinkForm = () => {
  const { drinks, setDrinks } = useContext(DrinkContext);
  const [newDrink, setNewDrink] = useState({ name: "", price: "" });

  const addDrink = (e) => {
    e.preventDefault();
    setDrinks([...drinks, newDrink]);
    setNewDrink({ name: "", price: "" });
  };

  return (
    <form onSubmit={addDrink} className="p-4">
      <input
        type="text"
        value={newDrink.name}
        onChange={(e) => setNewDrink({ ...newDrink, name: e.target.value })}
        placeholder="Drink Name"
        className="border p-2 m-2"
      />
      <input
        type="text"
        value={newDrink.price}
        onChange={(e) => setNewDrink({ ...newDrink, price: e.target.value })}
        placeholder="Drink Price (R)"
        className="border p-2 m-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 m-2">
        Add Drink
      </button>
    </form>
  );
};

export default AddDrinkForm;
