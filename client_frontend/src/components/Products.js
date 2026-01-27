import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Importing the search icon
import drinkPic from '../assets/drinkPic.jpg'; // Placeholder for drink image
import storePic from '../assets/merchant-placeholder.jpg'; // Placeholder for store banner image


function Products({ setCart, searchTerm, setSpecialInst }) {
  const { store } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const drinks = location.state?.drinks || []; // Default to an empty array if no drinks are provided
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filteredDrinks, setFilteredDrinks] = useState(drinks); // Initially show all drinks
  const [showInstructions, setShowInstructions] = useState({}); // State to handle showing instructions per drink
  const [specialInstructions, setSpecialInstructions] = useState({}); // State to store special instructions for each drink
  const [drinkSearchTerm, setDrinkSearchTerm] = useState(''); // Local search state for filtering drinks
  const existingCart = location.state?.existingCart || []; // Retrieve existing cart items if passed

  useEffect(() => {
    if (existingCart.length > 0) {
      setSelectedProducts(existingCart); // Set the previously selected items as the initial state
    }
  }, [existingCart]);

  // Update filtered drinks when the search term changes
  useEffect(() => {
    if (drinkSearchTerm) {
      const filtered = drinks.filter((drink) =>
          drink.name.toLowerCase().includes(drinkSearchTerm.toLowerCase())
      );
      setFilteredDrinks(filtered);
    } else {
      setFilteredDrinks(drinks); // Show all drinks if the search term is empty
    }
  }, [drinkSearchTerm, drinks]);

  const getPreFilledQuantity = (productName) => {
    const productInCart = selectedProducts.find((item) => item.name === productName);
    return productInCart ? productInCart.quantity : 0;
  };

  const handleQuantityChange = (productName, price, e) => {
    const value = parseInt(e.target.value, 10); // Convert the value to a number
    setSelectedProducts((prev) => {
      const filtered = prev.filter((p) => p.name !== productName);
      const specialInstruction = specialInstructions[productName] || ''; // Get the special instruction for this drink
      if (value > 0) {
        return [...filtered, { name: productName, price, quantity: value, specialInstruction }];
      }
      return filtered;
    });
  };


  const handleAddToCart = () => {
    setCart(selectedProducts); // Pass selected products to the cart
    navigate('/client-home/cart', { state: { drinks: filteredDrinks, selectedProducts } }); // Pass all drinks and selected products to the Cart
  };

  const toggleInstructions = (index) => {
    setShowInstructions((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the visibility of the special instructions for each drink
    }));
  };

  const handleInstructionsChange = (e, productName) => {
    const value = e.target.value;
    setSpecialInstructions((prev) => ({
      ...prev,
      [productName]: value || '',  // Store instructions based on product name
    }));
  };

  const handleSubmitInstructions = (productName) => {
    setSelectedProducts((prev) => {
      return prev.map((product) => {
        if (product.name === productName) {
          return { ...product, specialInstruction: specialInstructions[productName] || '' };
        }
        return product;
      });
    });

    // Hide the textarea after submission
    const drinkIndex = filteredDrinks.findIndex((drink) => drink.name === productName);
    toggleInstructions(drinkIndex); // Hide the textarea after submission
  };

  return (
      <div>
        {/* Store Banner Section (separate from the container) */}
        <div className="relative">
          <img src={storePic} alt="Store Banner" className="w-full h-96 object-cover rounded-2xl" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-8xl font-bold">{store}</h1>
          </div>

          {/* Search bar positioned in the bottom right corner of the store banner with search icon */}
          <div className="absolute bottom-4 right-4 flex items-center bg-white p-1 rounded-md border border-gray-300">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="Search for drinks"
                value={drinkSearchTerm}
                onChange={(e) => setDrinkSearchTerm(e.target.value)}
                className="p-2 rounded-md focus:outline-none h-4"
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="p-6 bg-white shadow-md rounded-lg mt-6 container mx-auto">
          {filteredDrinks.length === 0 ? (
              <p>No products available at this store.</p>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrinks.map((drink, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                      <img src={drinkPic} alt={drink.name} className="w-full h-32 object-cover"/>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{drink.name}</h3>
                        <p className="text-gray-700 mb-2">Price: R {drink.price}</p>
                        <p className="text-gray-500 mb-2">Drink description</p>
                        <div className="flex flex-col mt-2">
                          <label className="text-sm font-medium mb-1">Quantity:</label>
                          <input
                              type="number"
                              min="0"
                              className="border border-gray-300 rounded-md p-1 w-16"
                              value={getPreFilledQuantity(drink.name)}
                              onChange={(e) => handleQuantityChange(drink.name, drink.price, e)}
                          />
                        </div>

                        {/* Conditionally show the special instruction or textarea */}
                        {selectedProducts.find((product) => product.name === drink.name && product.specialInstruction) && !showInstructions[index] ? (
                            <div className="mt-4">
                              <p><strong>Special
                                Instruction:</strong> {selectedProducts.find(product => product.name === drink.name).specialInstruction}
                              </p>
                              <button
                                  className="text-gray-800 hover:underline"
                                  onClick={() => toggleInstructions(index)} // Show textarea again for editing
                              >
                                Edit Special Instructions
                              </button>
                            </div>
                        ) : (
                            <div className="mt-4">
                              <button
                                  className="text-gray-800 hover:underline"
                                  onClick={() => toggleInstructions(index)}
                              >
                                {showInstructions[index] ? 'Hide' : 'Add'} Special Instructions
                              </button>

                              {showInstructions[index] && (
                                  <div className="mt-2">
                  <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter special instructions"
                      value={specialInstructions[drink.name] || ''}  // Pre-fill special instructions if exists
                      onChange={(e) => handleInstructionsChange(e, drink.name)}
                  />
                                    <button
                                        className="mt-2 px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-600"
                                        onClick={() => handleSubmitInstructions(drink.name)}
                                    >
                                      Submit Instructions
                                    </button>
                                  </div>
                              )}
                            </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
          )}
          <div className="mt-6">
            <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-600"
                disabled={filteredDrinks.length === 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
  );
}

export default Products;