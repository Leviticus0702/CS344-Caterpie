// src/components/OrdersPage.js
import React from "react";

function OrdersPage() {
  const receivedOrders = [
    {
      orderNumber: "12345",
      otp: "1111",
      drinks: [
        { name: "Beer", quantity: 2 },
        { name: "Whiskey", quantity: 1 },
      ],
    },
    {
      orderNumber: "12346",
      otp: "2222",
      drinks: [{ name: "Vodka", quantity: 3 }],
    },
  ];

  const acceptedOrders = [
    {
      orderNumber: "12347",
      otp: "3333",
      drinks: [
        { name: "Beer", quantity: 1 },
        { name: "Wine", quantity: 2 },
      ],
    },
    {
      orderNumber: "12348",
      otp: "4444",
      drinks: [{ name: "Whiskey", quantity: 2 }],
    },
  ];

  return (
    <div className="orders-page">
      <h2>Received Orders</h2>
      <div className="orders-section">
        {receivedOrders.map((order, index) => (
          <div key={index} className="order-card">
            <h3>Order Number: {order.orderNumber}</h3>
            <p>OTP: {order.otp}</p>
            <ul>
              {order.drinks.map((drink, idx) => (
                <li key={idx}>
                  {drink.name}: {drink.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>Accepted Orders</h2>
      <div className="orders-section">
        {acceptedOrders.map((order, index) => (
          <div key={index} className="order-card">
            <h3>Order Number: {order.orderNumber}</h3>
            <p>OTP: {order.otp}</p>
            <ul>
              {order.drinks.map((drink, idx) => (
                <li key={idx}>
                  {drink.name}: {drink.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;
