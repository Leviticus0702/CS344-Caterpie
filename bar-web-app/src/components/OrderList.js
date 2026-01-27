import React, { useContext } from "react";
import { OrderContext } from "../contexts/OrderContext";

const OrderList = () => {
  const { orders } = useContext(OrderContext);

  return (
    <div>
      <h2 className="text-xl font-bold">Order List</h2>
      <ul>
        {orders.map((order, index) => (
          <li key={index} className="p-2 border-b">
            Order #{order.id} - {order.customerName} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList;
