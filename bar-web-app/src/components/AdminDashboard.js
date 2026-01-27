import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import loadingGif from "../assets/loading-light.gif";

const AdminDashboard = ({ searchInput, inventoryData, setInventoryData }) => {
  const [inventory, setInventory] = useState(inventoryData); // Start with inventoryData passed from AdminHomePage
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [originalItemName, setOriginalItemName] = useState(""); // Store the original name for editing
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // State for delete confirmation
  const [changedItems, setChangedItems] = useState({}); // Track items that have been changed
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // State for success message
  const [loading, setLoading] = useState(true); // State to handle loading GIF

  const socket = useWebSocket();

  // Handle WebSocket messages for inventory and account details
  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log(
          "Connected to WebSocket, requesting inventory and account details..."
        );
        socket.send("viewInventory");
        socket.send("viewAccountDetails,A"); // Request admin account details
      };

      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Requesting viewInventory...");
        socket.send("viewInventory");
        socket.send("viewAccountDetails,A");
      }

      socket.onmessage = (event) => {
        console.log("Message received from server:", event.data);
        if (event.data.includes("Admin logged in successfully")) {
          socket.send("viewInventory");
        }

        const [action, ...inventoryData] = event.data.split(":");

        if (action === "inventoryList") {
          const inventoryItems = inventoryData[0]
            .split(";")
            .map((itemStr, index) => {
              const [name, quantity] = itemStr.split(",");
              return { id: index + 1, name, quantity: parseInt(quantity) };
            });
          setInventory(inventoryItems); // Update inventory state
          setInventoryData(inventoryItems); // Persist the inventory state in AdminHomePage
          setLoading(false); // Inventory is now loaded, stop showing the loading GIF
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket");
      };
    }
  }, [socket, setInventoryData]);

  // Apply search filtering
  useEffect(() => {
    const filteredInventory = inventoryData.filter((item) =>
      item.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setInventory(filteredInventory);
  }, [searchInput, inventoryData]);

  // Function to handle increasing or decreasing quantity for an item
  const handleChangeQuantity = (itemId, delta) => {
    const updatedInventory = inventory.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    );
    setInventory(updatedInventory);

    const changedItem = updatedInventory.find((item) => item.id === itemId);
    setChangedItems((prevChangedItems) => ({
      ...prevChangedItems,
      [itemId]: { ...changedItem, nameChanged: false },
    }));
  };

  const handleSaveChanges = () => {
    Object.values(changedItems).forEach((item) => {
      if (!item.nameChanged) {
        const editInventoryMessage = `editInventory,${item.name},${item.name},${item.quantity}`;
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(editInventoryMessage);
          console.log("Sent edit inventory message:", editInventoryMessage);
        }
      }
    });

    setChangedItems({});
    setShowSuccessMessage(true); // Show the success message after saving changes
  };

  const handleSaveItem = () => {
    if (editingItem) {
      const updatedInventory = inventory.map((item) =>
        item.id === editingItem.id
          ? { ...item, name: newItemName, quantity: newItemQuantity }
          : item
      );
      setInventory(updatedInventory);

      const updatedItem = {
        id: editingItem.id,
        originalName: originalItemName,
        newName: newItemName,
        quantity: newItemQuantity,
        nameChanged: originalItemName !== newItemName,
      };

      setChangedItems((prevChangedItems) => ({
        ...prevChangedItems,
        [editingItem.id]: updatedItem,
      }));

      const editInventoryMessage = `editInventory,${updatedItem.originalName},${updatedItem.newName},${updatedItem.quantity}`;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(editInventoryMessage);
        console.log("Sent edit inventory message:", editInventoryMessage);
      }
    } else {
      const newInventoryMessage = `newInventory,${newItemName},${newItemQuantity}`;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(newInventoryMessage);
        console.log("Sent new inventory message:", newInventoryMessage);
      }

      setInventory((prevInventory) => [
        ...prevInventory,
        {
          id: prevInventory.length + 1,
          name: newItemName,
          quantity: newItemQuantity,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemQuantity(item.quantity);
    setOriginalItemName(item.name);
    setShowModal(true);
  };

  const handleDeleteItem = (item) => {
    setShowDeleteConfirm(item);
  };

  const confirmDeleteItem = (item) => {
    setInventory((prevInventory) =>
      prevInventory.filter((invItem) => invItem.id !== item.id)
    );

    const deleteInventoryMessage = `deleteInventory,${item.name}`;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(deleteInventoryMessage);
      console.log("Sent delete inventory message:", deleteInventoryMessage);
    }

    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-400 p-8">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <img src={loadingGif} alt="Loading..." />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">Inventory</h3>
            <div>
              <button
                className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600"
                onClick={() => {
                  setEditingItem(null);
                  setNewItemName("");
                  setNewItemQuantity(1);
                  setShowModal(true);
                }}
              >
                Add Item
              </button>

              {Object.keys(changedItems).length > 0 && (
                <button
                  className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg ml-4"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto mb-20">
            <table className="min-w-full bg-white shadow-lg rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 text-left text-gray-700 font-medium">
                    Item Name
                  </th>
                  <th className="py-2 px-4 text-left text-gray-700 font-medium">
                    Quantity
                  </th>
                  <th className="py-2 px-4 text-left text-gray-700 font-medium"></th>
                  <th className="py-2 px-4 text-left text-gray-700 font-medium"></th>
                  <th className="py-2 px-4 text-left text-gray-700 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className={`border-2 border-gray-200"}`}>
                    <td
                      className={`py-2 px-4 ${
                        changedItems[item.id]
                          ? "text-green-500"
                          : "text-black-200"
                      }`}
                    >
                      {item.name}
                    </td>
                    <td
                      className={`py-2 px-4 ${
                        changedItems[item.id]
                          ? "text-green-500"
                          : "text-black-200"
                      }`}
                    >
                      {item.quantity}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700"
                        onClick={() => handleDeleteItem(item)}
                      >
                        Delete
                      </button>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
                        onClick={() => handleEditItem(item)}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700"
                        onClick={() => handleChangeQuantity(item.id, 1)}
                      >
                        +
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg ml-2 hover:bg-red-700"
                        onClick={() => handleChangeQuantity(item.id, -1)}
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showSuccessMessage && (
            <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-4 shadow-lg">
              Changes saved successfully!
            </div>
          )}

          {/* Confirmation dialog for deleting an item */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Are you sure you want to delete{" "}
                  <span className="text-red-500">{showDeleteConfirm.name}</span>
                  ?
                </h3>
                <div className="flex justify-end">
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-lg transition hover:bg-red-700 mr-4"
                    onClick={() => confirmDeleteItem(showDeleteConfirm)}
                  >
                    Confirm Delete
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow-lg transition hover:bg-gray-700"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
