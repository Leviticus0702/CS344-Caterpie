import React, { useState } from "react";

const AcceptOrder = () => {
  const [order, setOrder] = useState({
    customer: "",
    drink: "",
    quantity: "",
    orderNum: "",
    otp: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      `accept,${order.customer},${order.drink},${order.quantity},${order.orderNum},${order.otp}`
    );
    setOrder({ customer: "", drink: "", quantity: "", orderNum: "", otp: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-xl font-bold">Accept Order</h2>
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
        <label className="block text-gray-700">Drink</label>
        <input
          type="text"
          value={order.drink}
          onChange={(e) => setOrder({ ...order, drink: e.target.value })}
          placeholder="Drink"
          className="border p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Quantity</label>
        <input
          type="number"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
          placeholder="Quantity"
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
      <div className="mb-4">
        <label className="block text-gray-700">OTP</label>
        <input
          type="text"
          value={order.otp}
          onChange={(e) => setOrder({ ...order, otp: e.target.value })}
          placeholder="OTP"
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">
        Accept Order
      </button>
    </form>
  );
};

export default AcceptOrder;
