import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const InventorySelection = ({ searchInput }) => {
  const [inventory, setInventory] = useState([]); // Initially empty inventory
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [originalItemName, setOriginalItemName] = useState(''); // Store original name for editing
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // State for delete confirmation
  const [changedItems, setChangedItems] = useState({}); // Track changed items
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // State for success message
  const socket = useWebSocket();

  // Fetch inventory via WebSocket
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Requesting viewInventory...');
      socket.send('viewStdInventory');
    }

    socket.onmessage = (event) => {
      const [action, ...inventoryData] = event.data.split(':');
      if (action === 'inventoryList') {
        const inventoryItems = inventoryData[0].split(';').map((itemStr, index) => {
          const [name, quantity] = itemStr.split(',');
          return { id: index + 1, name, quantity: parseInt(quantity) };
        });
        setInventory(inventoryItems);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  // Apply search filtering
  useEffect(() => {
    if (searchInput) {
      const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchInput.toLowerCase())
      );
      setInventory(filteredInventory);
    }
  }, [searchInput, inventory]);

  // Function to handle quantity change
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

  // Handle saving changes
  const handleSaveChanges = () => {
    Object.values(changedItems).forEach((item) => {
      if (!item.nameChanged) {
        const editInventoryMessage = `editInventory,${item.name},${item.name},${item.quantity}`;
        socket.send(editInventoryMessage);
      }
    });
    setChangedItems({});
    setShowSuccessMessage(true); // Show success message
  };

  // Restore original inventory
  const handleRestoreInventory = () => {
    socket.send('viewInventory'); // Request original inventory from the server again
    setChangedItems({}); // Clear any local changes
  };

  // Function to handle editing an item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemQuantity(item.quantity);
    setOriginalItemName(item.name);
    setShowModal(true);
  };

  // Function to confirm deletion of an item
  const confirmDeleteItem = (item) => {
    const deleteInventoryMessage = `deleteInventory,${item.name}`;
    socket.send(deleteInventoryMessage);

    setInventory(inventory.filter(invItem => invItem.id !== item.id)); // Remove from UI
    setShowDeleteConfirm(null); // Close confirmation modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Inventory Selection</h2>
        <div>
          <button
            className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600"
            onClick={handleRestoreInventory}
          >
            Restore
          </button>
          {Object.keys(changedItems).length > 0 && (
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg ml-4"
              onClick={handleSaveChanges}
            >
              Complete Selection
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto mb-20">
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Item Name</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Quantity</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium"></th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium"></th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className={`border-2 border-gray-200 ${changedItems[item.id] ? 'text-green-500' : 'text-black'}`}>
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleChangeQuantity(item.id, 1)}
                    className="px-4 py-2 bg-black text-white rounded-md transition transform hover:bg-green-500 mr-3"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleChangeQuantity(item.id, -1)}
                    className="px-4 py-2 bg-black text-white rounded-md transition transform hover:bg-green-500 mr-3"
                  >
                    -
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="px-6 py-2 bg-black text-white rounded-lg transition transform hover:bg-green-500 ml-2"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="px-7 py-2 bg-black text-white rounded-lg transition transform hover:bg-red-500"
                    onClick={() => setShowDeleteConfirm(item)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding/editing items */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{editingItem ? 'Edit Item' : 'New Item'}</h2>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full mb-4"
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(parseInt(e.target.value, 10) || 0)}
              className="mx-2 text-center border border-gray-300 p-2 rounded-lg w-16"
            />
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-black text-white rounded-lg shadow-lg"
                onClick={() => setShowModal(false)}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Are you sure you want to delete {showDeleteConfirm.name}?</h2>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg"
                onClick={() => confirmDeleteItem(showDeleteConfirm)}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {showSuccessMessage && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          Changes saved successfully!
        </div>
      )}
    </div>
  );
};

export default InventorySelection;
