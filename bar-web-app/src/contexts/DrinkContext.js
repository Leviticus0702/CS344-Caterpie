import React, { createContext, useState } from "react";

export const DrinkContext = createContext();

export const DrinkProvider = ({ children }) => {
  const [drinks, setDrinks] = useState([]);

  return (
    <DrinkContext.Provider value={{ drinks, setDrinks }}>
      {children}
    </DrinkContext.Provider>
  );
};
