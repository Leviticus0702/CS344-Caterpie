import React, { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useSupabaseClient } from '@supabase/auth-helpers-react'; // Use Supabase Client from context
import 'bootstrap/dist/css/bootstrap.min.css'; // Import supabase client

const CDNURL = "https://yajgmjyhrbgailbygriw.supabase.co/storage/v1/object/public/pourtal/images";

const EditMenuPage = ({ searchInput, setMenuData, menuData }) => {
  const supabase = useSupabaseClient(); // Get the Supabase client from context
  const [drinks, setDrinks] = useState(menuData);
  const [showModal, setShowModal] = useState(false);
  const [newDrink, setNewDrink] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editDrinkId, setEditDrinkId] = useState(null);
  const [oldDrink, setOldDrink] = useState(null);
  const [imageError, setImageError] = useState(""); // State for image error message
  const socket = useWebSocket();

  // Filter drinks based on search input
  useEffect(() => {
    const filteredDrinks = menuData.filter((drink) =>
      drink.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setDrinks(filteredDrinks);
  }, [searchInput, menuData]);

  // WebSocket setup
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Requesting menu items...");
      socket.send("viewMenu");
    }

    // Listen for WebSocket messages
    socket.onmessage = (event) => {
      const message = event.data;
      console.log("Received WebSocket message:", message);

      if (message.startsWith("Items for Merchant:")) {
        // Parse menu items
        const itemLines = message.split("\n").slice(1);
        const parsedItems = itemLines.map((line) => {
          const nameMatch = line.match(/Item Name: (.*?),/);
          const costMatch = line.match(/Cost: (.*?),/);
          const imageMatch = line.match(/Image: (.*)/);

          if (nameMatch && costMatch && imageMatch) {
            return {
              id: Math.random(),
              name: nameMatch[1],
              category: "Uncategorized",
              price: parseFloat(costMatch[1]),
              image: `${CDNURL}/${imageMatch[1]}`,
              sizes: ["Medium", "Large"],
            };
          }
          return null;
        }).filter((item) => item !== null);

        setDrinks(parsedItems);
        setMenuData(parsedItems);
      }
    };
  }, [socket, setMenuData]);

  const handleAddDrink = () => {
    setShowModal(true);
    setIsEdit(false);
    setNewDrink({ name: "", category: "", price: "", image: "" });
    setImageError(""); // Reset image error
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDrink((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate if the file is an image
      if (!file.type.startsWith("image/")) {
        setImageError("Selected file is not an image.");
        return;
      }
  
      // Check if the image already exists in the storage bucket
      const fileName = `${file.name}`;
      const imageExists = await checkImageExists(fileName);
  
      if (imageExists) {
        setNewDrink((prevState) => ({
          ...prevState,
          image: fileName, // Set the image name (without upload)
        }));
        setImageError(""); // Clear any previous error
        console.log("Image already exists, skipping upload.");
        return;
      }
  
      // If image doesn't exist, just set the file to upload it later when saving
      setNewDrink((prevState) => ({
        ...prevState,
        imageFile: file, // Store the file locally for later upload
        image: fileName,  // Set the image name without upload
      }));
      setImageError(""); // Clear any previous error
    }
  };
  
  const handleSaveDrink = async () => {
    // Check if an image file is selected but not yet uploaded
    if (newDrink.imageFile) {
      try {
        const fileName = `${newDrink.imageFile.name}`; // Use the name of the image file
        const { error } = await supabase.storage
          .from("pourtal/images") // Ensure you're using the correct storage bucket
          .upload(fileName, newDrink.imageFile);
  
        if (error) {
          console.error("Error uploading image:", error.message);
          setImageError("Failed to upload image");
          return;
        }
  
        // After successful upload, reset imageFile state
        setNewDrink((prevState) => ({
          ...prevState,
          imageFile: null, // Remove the file from state after upload
        }));
      } catch (err) {
        console.error("Error uploading file:", err);
        setImageError("An error occurred while uploading the file.");
        return;
      }
    }
  
    // Extract the image title (without file extension) to send to the backend
    const imageName = newDrink.image.split('.')[0]; // Strip out the extension
  
    // Proceed with the existing logic for editing or adding drinks
    if (isEdit) {
      const updatedDrinks = drinks.map((drink) =>
        drink.id === editDrinkId
          ? { ...drink, ...newDrink, price: parseFloat(newDrink.price) }
          : drink
      );
      setDrinks(updatedDrinks);
  
      const editMenuMessage = `EditMenu,0,${oldDrink.name}/${oldDrink.price},${newDrink.name}/${newDrink.price},${imageName}`;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(editMenuMessage);
        console.log("Sent WebSocket message:", editMenuMessage);
        console.log("Requesting menu items...");
        socket.send("viewMenu");
      }
    } else {
      const newDrinkObj = {
        id: drinks.length + 1,
        ...newDrink,
        price: parseFloat(newDrink.price),
        sizes: ["Medium", "Large"],
      };
      setDrinks((prevState) => [...prevState, newDrinkObj]);
  
      const addMenuItemMessage = `addMenuItem,${newDrink.name},${newDrink.price},${imageName}`;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(addMenuItemMessage);
        console.log("Sent WebSocket message:", addMenuItemMessage);
        console.log("Requesting menu items...");
        socket.send("viewMenu");
      }
    }
  
    setShowModal(false);
    setNewDrink({ name: "", category: "", price: "", image: "" });
  };
  
  const checkImageExists = async (imageName) => {
    const { data, error } = await supabase.storage.from('pourtal/images').download(imageName);
    return !error; // If there's no error, the image exists
  };
  
  const handleEditDrink = (drink) => {
    setShowModal(true);
    setIsEdit(true);
    setEditDrinkId(drink.id);
    setOldDrink(drink);
    setNewDrink({
      name: drink.name,
      category: drink.category,
      price: drink.price,
      image: drink.image,
    });
    setImageError(""); // Reset image error
  };

  const handleDeleteDrink = (drinkId) => {
    const updatedDrinks = drinks.filter((drink) => drink.id !== drinkId);
    setDrinks(updatedDrinks);

    const drinkToDelete = drinks.find((drink) => drink.id === drinkId);
    const deleteMenuItemMessage = `deleteMenuItem,${drinkToDelete.name}`;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(deleteMenuItemMessage);
      console.log("Sent WebSocket message:", deleteMenuItemMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Edit Menu</h2>
        <button
          className="px-6 py-2 bg-black text-white rounded-lg shadow-lg transition transform hover:bg-green-600 hover:-translate-y-1 hover:shadow-xl"
          onClick={handleAddDrink}
        >
          Add Drink
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {drinks.map((drink) => (
          <div
            key={drink.id}
            className="bg-white p-4 rounded-lg shadow-lg flex items-center"
          >
            <div className="w-24 h-24 bg-black rounded-full mr-4 overflow-hidden">
              <img
                src={drink.image || "https://via.placeholder.com/100"}
                alt={drink.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{drink.name}</h3>
              <div className="mt-4 text-lg font-bold">
                R{drink.price.toFixed(2)}
              </div>

              {/* Placeholder for Ratings */}
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-600">
                  Customer Rating:
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {drink.rating ? `${drink.rating} / 5` : " No rating yet"}
                </span>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <button
                className="px-4 py-2 bg-black text-white rounded-lg transition transform hover:bg-green-500"
                onClick={() => handleEditDrink(drink)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-lg transition transform hover:bg-red-500"
                onClick={() => handleDeleteDrink(drink.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">
              {isEdit ? "Edit Drink" : "Add New Drink"}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Drink Name
              </label>
              <input
                type="text"
                name="name"
                value={newDrink.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={newDrink.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={newDrink.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="image"
                  value={newDrink.image}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Image URL or choose a file"
                />
                <label className="ml-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
                    onClick={() => document.getElementById("imageFileInput").click()}
                  >
                    +
                  </button>
                  <input
                    type="file"
                    id="imageFileInput"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg transition transform hover:bg-green-600"
                onClick={handleSaveDrink}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg transition transform hover:bg-gray-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMenuPage;
