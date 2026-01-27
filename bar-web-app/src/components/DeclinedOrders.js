import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { useWebSocket } from "../contexts/WebSocketContext"; 

const DeclinedOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const socket = useWebSocket();

  useEffect(() => {
    // Send message to fetch declined orders when the component mounts
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket is open, sending request for declined orders...");
      socket.send("viewDeclinedOrders");
    }

    // Listen for the declined orders response
    socket.onmessage = (event) => {
      const message = event.data;
      console.log("Message received from server:", message);
      
      if (message.startsWith("declined Orders:")) {
        const orderDataString = message.replace("declined Orders:", "");
        const orderArray = orderDataString.split(";").filter(Boolean);
        
        const parsedOrders = orderArray.map((orderStr) => {
          const [orderNum, items, date, quantities, total] = orderStr.split(",");

          // Handle multiple or single items/quantities
          const itemList = items.split("/");
          const quantityList = quantities.split("/");
          const formattedDate = formatDate(date);

          return {
            id: orderNum,
            date: formattedDate,
            items: itemList,
            quantities: quantityList,
            total: parseFloat(total),
          };
        });

        setOrders(parsedOrders);
      }
    };
  }, [socket]);

  const declineOrder = (orderNum) => {
    console.log(`Declining order with ID: ${orderNum}`);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(`declineOrder,${orderNum},+`);
      // Remove the declined order from the state
      setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderNum));
    } else {
      console.log("WebSocket is not open, unable to send decline order message.");
    }
  };

  const goToDashboard = () => {
    socket.send("viewOrdersMenu");
    navigate("/merchant-dashboard"); // Navigate to Merchant Dashboard
  };

  const formatDate = (isoString) => {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  };

  return (
    <div className="p-4">
      <button
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        onClick={goToDashboard}
      >
        Back to Merchant Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">Declined Orders</h2>

      {orders.length === 0 ? (
        <p>No declined orders available.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Order ID</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Items</th>
              <th className="py-2 px-4 border-b text-left">Quantities</th>
              <th className="py-2 px-4 border-b text-right">Total</th>
              <th className="py-2 px-4 border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 px-4 border-b text-left">{order.id}</td>
                <td className="py-2 px-4 border-b text-left">{order.date}</td>
                <td className="py-2 px-4 border-b text-left">
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-4 border-b text-left">
                  <ul>
                    {order.quantities.map((quantity, index) => (
                      <li key={index}>{quantity}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-4 border-b text-right">R{order.total.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-right">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                    onClick={() => declineOrder(order.id)}
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeclinedOrders;
