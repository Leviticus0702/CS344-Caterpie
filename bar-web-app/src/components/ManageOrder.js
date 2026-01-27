import React, { useContext, useState } from "react";
import { OrderContext } from "../contexts/OrderContext";

const ManageOrder = () => {
  const { orders, setOrders } = useContext(OrderContext);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("");

  const updateOrderStatus = (e) => {
    e.preventDefault();
    const updatedOrders = orders.map((order) =>
      order.id === parseInt(orderId) ? { ...order, status } : order
    );
    setOrders(updatedOrders);
  };

  return (
    <form onSubmit={updateOrderStatus} className="p-4">
      <input
        type="number"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Order ID"
        className="border p-2 m-2"
      />
      <input
        type="text"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        placeholder="Status"
        className="border p-2 m-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 m-2">
        Update Order Status
      </button>
    </form>
  );
};

export default ManageOrder;
