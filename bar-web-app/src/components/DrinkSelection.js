import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import loadingGif from "../assets/loading-light.gif";

const CDNURL = "https://yajgmjyhrbgailbygriw.supabase.co/storage/v1/object/public/pourtal/images";
const initialDrinks = [];

function DrinkSelection() {
  const socket = useWebSocket();
  const supabase = useSupabaseClient();
  const [selectedDrinks, setSelectedDrinks] = useState(new Set());
  const [drinks, setDrinks] = useState(initialDrinks);
  const [originalDrinks, setOriginalDrinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDrink, setNewDrink] = useState({ name: "", cost: "", imageFile: null });
  const [imageError, setImageError] = useState("");
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [itemsToAdd, setItemsToAdd] = useState(0); // Number of items being added
  const [itemsAdded, setItemsAdded] = useState(0); // Number of successful responses

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Requesting menu items...");
      socket.send("viewStdMenu");
    }

    socket.onmessage = (event) => {
      const message = event.data;
      console.log("Received WebSocket message:", message);

      if (message.startsWith("Items for Merchant:")) {
        const itemLines = message.split("\n").slice(1);
        const parsedItems = itemLines.map((line) => {
          const nameMatch = line.match(/Item Name: (.*?),/);
          const costMatch = line.match(/Cost: (.*?),/);
          const imageMatch = line.match(/Image: (.*)/);

          if (nameMatch && costMatch && imageMatch) {
            return {
              id: Math.random(),
              name: nameMatch[1],
              cost: costMatch[1],
              image: `${CDNURL}/${imageMatch[1]}`,
            };
          }
          return null;
        }).filter((item) => item !== null);

        setDrinks(parsedItems);
        setOriginalDrinks(parsedItems);
      }

      if (message.includes("added successfully with a cost")) {
        // Increment the count of successfully added items
        setItemsAdded((prev) => prev + 1);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  useEffect(() => {
    // When all items are added, stop the loading screen
    if (isLoading && itemsAdded === itemsToAdd) {
      setIsLoading(false);
      setConfirmationMessage("Items have successfully been added to your menu.");
      setItemsToAdd(0);
      setItemsAdded(0);
    }
  }, [itemsAdded, itemsToAdd, isLoading]);

  const toggleSelectDrink = (id) => {
    setSelectedDrinks((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const completeSelection = () => {
    const itemsToProcess = selectedDrinks.size;
    setItemsToAdd(itemsToProcess);
    setItemsAdded(0);
    setIsLoading(true); // Start loading screen

    selectedDrinks.forEach(id => {
      const drink = drinks.find(d => d.id === id);
      if (drink) {
        const imageName = drink.image.split('/').pop().split('.')[0];
        socket.send(`addMenuItem,${drink.name},${drink.cost},${imageName}`);
        console.log(`addMenuItem,${drink.name},${drink.cost},${imageName}`);
      }
    });
  };

  const restoreSelection = () => {
    setDrinks(originalDrinks);
    setShowCompleteButton(false);
  };

  const handleAddDrink = () => {
    setShowModal(true);
    setNewDrink({ name: "", cost: "", imageFile: null });
    setImageError("");
  };

  const filterSelection = () => {
    setDrinks((prev) => prev.filter(drink => selectedDrinks.has(drink.id)));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDrink((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setImageError("Selected file is not an image.");
        return;
      }
      setNewDrink((prevState) => ({ ...prevState, imageFile: file }));
      setImageError("");
    }
  };

  const handleSaveDrink = async () => {
    const { name, cost, imageFile } = newDrink;
    if (!name || !cost || !imageFile) {
      setImageError("Please fill out all fields and upload an image.");
      return;
    }

    try {
      const { error } = await supabase.storage
        .from("pourtal/images")
        .upload(imageFile.name, imageFile);

      if (error) {
        console.error("Error uploading image:", error.message);
        setImageError("Failed to upload image");
        return;
      }

      const newDrinkObj = {
        id: Math.random(),
        name,
        cost,
        image: `${CDNURL}/${imageFile.name}`,
      };

      setDrinks((prevState) => [...prevState, newDrinkObj]);
      setOriginalDrinks((prev) => [...prev, newDrinkObj]);
      setShowModal(false);
      setNewDrink({ name: "", cost: "", imageFile: null });
    } catch (error) {
      console.error("Error saving drink:", error);
      setImageError("An error occurred while saving the drink.");
    }
  };

  return (
    <div className="w-full max-w-8xl p-3">
      {/* Button Section */}
      <div className="flex justify-between mb-5">
        <button
          onClick={restoreSelection}
          className="bg-green-500 text-white text-xl font-bold p-2 rounded-lg transition hover:bg-green-600"
        >
          Restore
        </button>
        <button
          onClick={() => { setShowCompleteButton(true); filterSelection(); }}
          className="bg-gray-800 text-2xl font-bold text-white p-2 rounded-lg transition hover:bg-gray-900"
        >
          Filter Selection
        </button>
        {showCompleteButton && (
          <button
            onClick={completeSelection}
            className="bg-blue-500 text-2xl font-bold text-white p-2 rounded-lg transition hover:bg-blue-600"
          >
            Complete
          </button>
        )}
        <button
          onClick={handleAddDrink}
          className="bg-blue-500 text-white text-xl font-bold p-2 rounded-lg transition hover:bg-blue-600"
        >
          Add Drink
        </button>
      </div>

      {/* Drinks Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-6">
        {drinks.map(drink => (
          <div
            key={drink.id}
            className={`bg-white shadow-md rounded-lg cursor-pointer transition duration-200 transform hover:scale-105 ${selectedDrinks.has(drink.id) ? 'border-2 border-green-500' : ''}`}
            onClick={() => toggleSelectDrink(drink.id)}
          >
            <img src={drink.image} alt={drink.name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-center">{drink.name}</h2>
              <p className="text-lg text-center text-gray-700">{drink.cost}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding Drink */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Add New Drink</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Drink Name</label>
              <input
                type="text"
                name="name"
                value={newDrink.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cost</label>
              <input
                type="text"
                name="cost"
                value={newDrink.cost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              />
              {imageError && <p className="text-red-500">{imageError}</p>}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setShowModal(false)} className="bg-gray-300 text-black p-2 rounded-lg transition hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleSaveDrink} className="bg-blue-500 text-white p-2 rounded-lg transition hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="flex flex-col items-center">
            <img src={loadingGif} alt="Loading" className="w-50 h-50 rounded-xl" />
            <p className="mt-4 text-white">Adding items to your menu...</p>
          </div>
        </div>
      )}


      {/* Confirmation Message */}
      {confirmationMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
            <p className="text-lg mb-4">{confirmationMessage}</p>
            <button onClick={() => setConfirmationMessage("")} className="bg-blue-500 text-white p-2 rounded-lg transition hover:bg-blue-600">
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrinkSelection;
