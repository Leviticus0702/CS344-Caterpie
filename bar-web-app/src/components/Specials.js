import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useWebSocket } from "../contexts/WebSocketContext";

const Specials = ({
  searchInput,
  specialsData = [],
  setSpecialsData,
}) => {
  const [specials, setSpecials] = useState(specialsData);
  const [showModal, setShowModal] = useState(false);
  const [newSpecialTimeFrom, setNewSpecialTimeFrom] = useState(new Date());
  const [newSpecialTimeTo, setNewSpecialTimeTo] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [itemsData, setItemsData] = useState([]);
  const [discountValue, setDiscountValue] = useState(0);
  const [frequency, setFrequency] = useState("once");
  const [editingSpecial, setEditingSpecial] = useState(null);
  const socket = useWebSocket();

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Requesting specials and menu data...");
      socket.send("viewSpecials");
      socket.send("viewMenu");
    }

    const handleWebSocketMessage = (event) => {
      const message = event.data;
      console.log("Received WebSocket message:", message);

      if (message.startsWith("Specials for Merchant:")) {
        const specialLines = message.split("\n").slice(1);
        const parsedSpecials = specialLines.map((line) => {
          const nameMatch = line.match(/Item Name: (.*?),/);
          const costMatch = line.match(/Cost: ([0-9.]+),/);
          const newCostMatch = line.match(/NewCost: ([0-9.,]+),/);
          const discountMatch = line.match(/Discount: ([0-9.]+),/);
          const typeMatch = line.match(/Type: (.*?),/);
          const frequencyMatch = line.match(/frequency: (.*?),/);
          const durationMatch = line.match(/Duration: (.*)/);

          return {
            id: Math.random(),
            name: nameMatch ? nameMatch[1].trim() : "Unnamed",
            originalPrice: costMatch ? parseFloat(costMatch[1]) : 0,
            discountPrice: newCostMatch ? parseFloat(newCostMatch[1].replace(',', '.')) : 0,
            discountValue: discountMatch ? discountMatch[1].trim() : "0",
            discountType: typeMatch ? typeMatch[1].trim() : "%",
            frequency: frequencyMatch ? frequencyMatch[1].trim() : "once",
            timePeriod: durationMatch ? durationMatch[1].trim() : "N/A",
          };
        });

        setSpecials(parsedSpecials);
        setSpecialsData(parsedSpecials);
      }

      if (message.startsWith("Items for Merchant:")) {
        const itemLines = message.split("\n").slice(1);
        const parsedItems = itemLines
          .map((line) => {
            const nameMatch = line.match(/Item Name: (.*?),/);
            return nameMatch ? { id: Math.random(), name: nameMatch[1].trim() } : null;
          })
          .filter((item) => item !== null);

        setItemsData(parsedItems);
      }
    };

    socket.addEventListener("message", handleWebSocketMessage);

    return () => {
      socket.removeEventListener("message", handleWebSocketMessage);
    };
  }, [socket, setSpecialsData]);

  useEffect(() => {
    const filteredSpecials = specialsData.filter((special) =>
      special.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSpecials(filteredSpecials);
  }, [searchInput, specialsData]);

  const resetForm = () => {
    setNewSpecialTimeFrom(new Date());
    setNewSpecialTimeTo(new Date());
    setSelectedItem("");
    setDiscountValue(0);
    setFrequency("once");
    setDiscountType("percent");
    setEditingSpecial(null);
  };

  const handleSaveSpecial = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
      const timeFrom = newSpecialTimeFrom.toLocaleTimeString([], timeOptions);
      const timeTo = newSpecialTimeTo.toLocaleTimeString([], timeOptions);
      const discountSymbol = discountType === "percent" ? "%" : "-";
      
      if (editingSpecial) {
        // Format for editing existing special
        const editMessage = `editSpecial,${selectedItem},${discountSymbol},${discountValue},${timeFrom} - ${timeTo},${frequency}`;
        socket.send(editMessage);
      } else {
        // Format for creating new special
        const specialMessage = `createSpecial,${selectedItem},${discountSymbol},${discountValue},${timeFrom} - ${timeTo},${frequency}`;
        socket.send(specialMessage);
      }
      console.log("Refreshing specials view...");
      socket.send("viewSpecials");
    }
  
    setShowModal(false);
    resetForm();
  };

  const handleEditSpecial = (special) => {
    setShowModal(true);
    setEditingSpecial(special);
    setSelectedItem(special.name);
    const [timeFrom, timeTo] = special.timePeriod.split("-");
    setNewSpecialTimeFrom(new Date(`1970/01/01 ${timeFrom.trim()}`));
    setNewSpecialTimeTo(new Date(`1970/01/01 ${timeTo.trim()}`));
    setDiscountType(special.discountType === "%" ? "percent" : "amount");
    setDiscountValue(parseFloat(special.discountValue));
    setFrequency(special.frequency);
  };

  const handleDeleteSpecial = (id) => {
    const specialToDelete = specials.find((special) => special.id === id);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(`deleteSpecial,${specialToDelete.name}`);
      console.log(`deleteSpecial,${specialToDelete.name}`)
      socket.send("viewSpecials");
    }
  };

  const formatDiscount = (special) => {
    if (special.discountType === "%") {
      return `${special.discountValue} %`;
    } else {
      return `R ${parseFloat(special.discountValue).toFixed(2)}`;
    }
  };

  // Filter out items that are already in specials when adding new special
  const getAvailableItems = () => {
    const existingItems = specials
      .filter(special => special.name !== "Unnamed" && special.name.trim() !== "")
      .map(special => special.name);
    return itemsData.filter(item => !existingItems.includes(item.name));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-400 p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Specials</h2>
        <button
          className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Special
        </button>
      </div>

      <div className="overflow-x-auto mb-20">
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Item</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Original Price</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Discount Price</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Discount</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Time Period</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Frequency</th>
              <th className="py-2 px-4 text-left text-gray-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {specials
              .filter((special) => special.name !== "Unnamed" && special.name.trim() !== "")
              .map((special) => (
                <tr key={special.id} className="border-t border-gray-200">
                  <td className="py-2 px-4">{special.name}</td>
                  <td className="py-2 px-4">R{special.originalPrice.toFixed(2)}</td>
                  <td className="py-2 px-4">R{special.discountPrice.toFixed(2)}</td>
                  <td className="py-2 px-4">{formatDiscount(special)}</td>
                  <td className="py-2 px-4">{special.timePeriod}</td>
                  <td className="py-2 px-4">{special.frequency}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="px-4 py-1 bg-blue-500 text-white rounded-md"
                      onClick={() => handleEditSpecial(special)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-1 bg-red-500 text-white rounded-md"
                      onClick={() => handleDeleteSpecial(special.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-2xl font-semibold mb-4">
              {editingSpecial ? "Edit Special" : "Add Special"}
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700">Menu Item:</label>
              {editingSpecial ? (
                <input
                  type="text"
                  value={selectedItem}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              ) : (
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select an item</option>
                  {getAvailableItems().map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-gray-700">From:</label>
                <DatePicker
                  selected={newSpecialTimeFrom}
                  onChange={setNewSpecialTimeFrom}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700">To:</label>
                <DatePicker
                  selected={newSpecialTimeTo}
                  onChange={setNewSpecialTimeTo}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-gray-700">Discount Type:</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="percent">Percent</option>
                  <option value="amount">Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700">Discount Value:</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Frequency:</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="once">Once</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={handleSaveSpecial}
              >
                {editingSpecial ? "Update Special" : "Add Special"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specials;