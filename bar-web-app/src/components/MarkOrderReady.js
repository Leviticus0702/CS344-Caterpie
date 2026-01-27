import React, { useState } from "react";

const MarkOrderReady = () => {
  const [order, setOrder] = useState({ customer: "", orderNum: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`ready,${order.customer},${order.orderNum}`);
    setOrder({ customer: "", orderNum: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold">Mark Order as Ready</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Customer</label>
        <input
          type="text"
          value={order.customer}
          onChange={(e) => setOrder({ ...order, customer: e.target.value })}
          placeholder="Customer"
          className="border p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Order Number</label>
        <input
          type="text"
          value={order.orderNum}
          onChange={(e) => setOrder({ ...order, orderNum: e.target.value })}
          placeholder="Order Number"
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        Mark as Ready
      </button>
    </form>
  );
};

export default MarkOrderReady;
