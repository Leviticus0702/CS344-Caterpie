import React, { createContext, useState } from "react";

// Create the OrderContext
export const OrderContext = createContext();

// Create the OrderProvider component
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  return (
    <OrderContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
