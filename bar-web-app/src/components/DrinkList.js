import React, { useContext } from "react";
import { DrinkContext } from "../contexts/DrinkContext";

const DrinkList = () => {
  const { drinks } = useContext(DrinkContext);

  return (
    <div>
      <h2 className="text-xl font-bold">Available Drinks</h2>
      <ul>
        {drinks.map((drink, index) => (
          <li key={index} className="p-2 border-b">
            {drink.name} - R{drink.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DrinkList;
