import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import { Star } from "lucide-react"; // Import Star icon for ratings

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const socket = useWebSocket();

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send("viewMerchantOrderHistory");
    }

    socket.onmessage = (event) => {
      const message = event.data;

      if (message.startsWith("orderHistory:")) {
        const orderDataString = message.replace("orderHistory:", "");
        const orderArray = orderDataString.split(";");

        const parsedOrders = orderArray.map(orderStr => {
          const [orderNum, items, date, quantities, rating, total] = orderStr.split(",");

          const formattedDate = formatDate(date);

          return {
            id: orderNum,
            date: formattedDate,
            items: items.split("/"),
            quantities: quantities.split("/"),
            rating: parseInt(rating),
            total: parseFloat(total),
          };
        });

        setOrders(parsedOrders);
      }
    };
  }, [socket]);

  const formatDate = (isoString) => {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  };

  // Helper function to render stars based on rating
  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={`${
              index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <button
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        onClick={() => navigate("/admin-home")}
      >
        Back to Admin Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p>No order history available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Order ID</th>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Items</th>
                <th className="py-2 px-4 border-b text-left">Quantities</th>
                <th className="py-2 px-4 border-b text-left">Rating</th>
                <th className="py-2 px-4 border-b text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border-b text-left">{order.id}</td>
                  <td className="py-2 px-4 border-b text-left">{order.date}</td>
                  <td className="py-2 px-4 border-b text-left">{order.items.join(", ")}</td>
                  <td className="py-2 px-4 border-b text-left">{order.quantities.join(", ")}</td>
                  <td className="py-2 px-4 border-b text-left">
                    {renderRatingStars(order.rating)}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    R{order.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;