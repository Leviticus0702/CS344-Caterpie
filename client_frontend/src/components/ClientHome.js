import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Products from './Products';
import Cart from './Cart';
import Orders from './Orders';
import { useWebSocket } from '../context/WebSocketContext';
import Navbar from './Navbar';
import loadingGif from '../assets/loading-light.gif';
import { useMerchantContext } from '../context/MerchantContext'; // Import the MerchantContext
import merchantImage from '../assets/merchant-placeholder.jpg';
import wineIcon from '../assets/wine-icon.png';
import waterIcon from '../assets/water-icon.png';
import ginIcon from '../assets/gin-icon.png';
import rumIcon from '../assets/rum-icon.png';
import vodkaIcon from '../assets/vodka-icon.png';
import fantaIcon from '../assets/fanta-icon.png';
import cokeIcon from '../assets/coke-icon.png';
import spriteIcon from '../assets/sprite-icon.png';
import whiskeyIcon from '../assets/whisky-icon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import OrderHistory from "./OrderHistory";
import ManageAccount from "./ManageAccount";
import { useUserContext } from '../context/UserContext';

function ClientHome() {
    const [cart, setCart] = useState({});
    const [order, setOrder] = useState(null);
    const [drinks, setDrinks] = useState([]);
    const [filteredMerchants, setFilteredMerchants] = useState([]); // Filtered merchant list
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [loading, setLoading] = useState(false); // Start with false, we'll set it to true when fetching
    const [searchTerm, setSearchTerm] = useState('');
    const [clickedDrink, setClickedDrink] = useState(null); // Track clicked drink
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location
    const socket = useWebSocket();
    const { username, setUsername } = useUserContext();
    const { email, setEmail } = useUserContext();
    const [specialInstruction, setSpecialInst] = useState("");
    const [promotions, setPromotion] = useState("");

    const { merchants, setMerchants, isFetched, setIsFetched } = useMerchantContext(); // Use MerchantContext

    const carouselRef = useRef(null); // Ref for carousel

    useEffect(() => {
        // Check if we should fetch merchants from the socket
        if (!isFetched || location.state?.fromLogin) {
            setLoading(true); // Set loading to true before fetching

            // Ensure the socket is open before fetching data
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.onmessage = (event) => {
                    const backendData = event.data;
                    const parsedMerchants = parseBackendData(backendData);
                    setMerchants(parsedMerchants);
                    setFilteredMerchants(parsedMerchants); // Initially show all merchants
                    const allDrinks = parsedMerchants.flatMap(merchant => merchant.drinks);
                    setDrinks(allDrinks);
                    setLoading(false); // Set loading to false after fetching
                    setIsFetched(true); // Set isFetched to true to prevent future fetches
                };

                // If data is not received within a certain time, stop loading
                const timeout = setTimeout(() => {
                    setLoading(false);
                }, 8000); // Adjust timeout as needed (5 seconds here)

                // Clean up timeout on unmount
                return () => clearTimeout(timeout);
            } else {
                // If socket is not ready, stop loading state
                setLoading(false);
            }
        } else {
            // Use cached merchants, skip fetching
            setFilteredMerchants(merchants);
            const allDrinks = merchants.flatMap(merchant => merchant.drinks);
            setDrinks(allDrinks);
            setLoading(false);
        }

       
    if(socket && socket.readyState === WebSocket.OPEN) {
        socket.send('myProfile');

    // Receive response from server
    socket.onmessage = (event) => {
        const message = event.data;
        
        // Check if the message contains 'Email:' to ensure it's the profile response
        if (message.includes('Email:')) {
            // Split the message by newline to extract individual fields
            const lines = message.split('\n');
            
            // Extract values for Username, Email, and Password
            const email = lines.find(line => line.startsWith('Email:')).split('Email: ')[1];
            const username = lines.find(line => line.startsWith('Username:')).split('Username: ')[1];
            
            // Store these values in JavaScript variables
            console.log('Username:', username);
            console.log('Email:', email);
            

            // Optionally set these values to state or use them as needed
            setUsername(username);
            setEmail(email);
            
        }
    };
    } else {
        console.log('WebSocket connection is not open. Please try again later.');
        console.log('error');
        return;
    }



        return () => {
            if (socket) {
                socket.onmessage = null;
            }
        };
    }, [socket, location.state?.fromLogin, isFetched, merchants, setMerchants, setIsFetched]); // Add dependencies

    const parseBackendData = (data) => {
        const merchants = [];
        const lines = data.split('\n').map(line => line.trim()).filter(line => line);

        let currentMerchant = null;

        lines.forEach(line => {
            if (line.startsWith('Merchant:')) {
                if (currentMerchant) {
                    merchants.push(currentMerchant);
                }
                currentMerchant = {
                    name: line.replace('Merchant:', '').trim(),
                    email: '',
                    drinks: []
                };
            } else if (line.startsWith('MerchantEmail:') && currentMerchant) {
                currentMerchant.email = line.replace('MerchantEmail:', '').trim();
            } else if (line.startsWith('Drink:') && currentMerchant) {
                const [drinkPart, pricePart] = line.split(', Price:');
                currentMerchant.drinks.push({
                    name: drinkPart.replace('Drink:', '').trim(),
                    price: parseFloat(pricePart.trim())
                });
            }
        });

        if (currentMerchant) {
            merchants.push(currentMerchant);
        }

        return merchants;
    };

    const handleMerchantSelect = (merchant) => {
        setSelectedMerchant(merchant);
        navigate(`/client-home/products/${merchant.name}`, { state: { drinks: merchant.drinks } });
    };

    const handleBackToMerchants = () => {
        setSelectedMerchant(null);
        navigate(`/client-home`);
    };

    const handleSearchSelect = (result) => {
        if (result.drinks) {
            handleMerchantSelect(result.merchant);
        } else {
            handleMerchantSelect(result.merchant);
        }
    };

    // Scroll the carousel to the left
    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: -300, // Adjust the scroll amount here
                behavior: 'smooth',
            });
        }
    };

    // Scroll the carousel to the right
    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: 300, // Adjust the scroll amount here
                behavior: 'smooth',
            });
        }
    };



    // Function to handle drink click and filter merchants by the selected drink
    const handleDrinkClick = (drinkName) => {
        setClickedDrink(drinkName);

        // Filter merchants based on whether any of their drinks include the clicked drink
        const filtered = merchants.filter((merchant) =>
            merchant.drinks.some((drink) => drink.name.toLowerCase().includes(drinkName.toLowerCase()))
        );

        // Update the state with the filtered merchants
        setFilteredMerchants(filtered);
    };

    const containerRef = useRef(null); // Reference for the container

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setClickedDrink(null); // Unselect drink
                setFilteredMerchants(merchants); // Reset the filter to show all merchants again
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [containerRef, merchants]);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar at the top */}
            <Navbar
                setSearchTerm={setSearchTerm}
                merchants={merchants}
                drinks={drinks}
                onSearchSelect={handleSearchSelect}
                username={username} email={email}
                
            />

            <div className="p-8">
                {loading ? (
                    <div className="flex justify-center items-center">
                        <img src={loadingGif} alt="Loading..." className="w-auto h-182" />
                    </div>
                ) : (
                    !selectedMerchant ? (
                        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 no-scrollbar" ref={containerRef}>
                            {/* Carousel inside "Select a Merchant" div */}
                            <div className="w-full py-4 text-center relative pb-12">
                                {/* Left arrow for scrolling */}
                                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-2">
                                    <FontAwesomeIcon
                                        icon={faArrowLeft}
                                        className="text-sm sm:text-base md:text-lg lg:text-xl cursor-pointe"
                                        onClick={scrollLeft}
                                    />
                                </div>

                                {/* Carousel container with increased width */}
                                <div
                                    className="overflow-x-auto w-full max-w-screen-xl mx-auto"
                                    style={{
                                        scrollbarWidth: 'none', /* Firefox */
                                        msOverflowStyle: 'none', /* IE and Edge */
                                    }}
                                >
                                    <div className="flex space-x-0 sm:space-x-12 md:space-x-24 px-8"> {/* Adjust space between icons */}
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={ginIcon}
                                                alt="Gin"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Gin' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Gin')}
                                            />
                                            <p className="mt-2 text-sm">Gin</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={cokeIcon}
                                                alt="Coke"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Coke' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Coke')}
                                            />
                                            <p className="mt-2 text-sm">Coke</p>
                                        </div>
                                        {/* Continue for other drinks */}
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={whiskeyIcon}
                                                alt="Whiskey"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Whiskey' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Whiskey')}
                                            />
                                            <p className="mt-2 text-sm">Whiskey</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={waterIcon}
                                                alt="Water"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Water' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Water')}
                                            />
                                            <p className="mt-2 text-sm">Water</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={wineIcon}
                                                alt="Wine"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Wine' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Wine')}
                                            />
                                            <p className="mt-2 text-sm">Wine</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={spriteIcon}
                                                alt="Sprite"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Sprite' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Sprite')}
                                            />
                                            <p className="mt-2 text-sm">Sprite</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={vodkaIcon}
                                                alt="Vodka"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Vodka' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Vodka')}
                                            />
                                            <p className="mt-2 text-sm">Vodka</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={fantaIcon}
                                                alt="Fanta"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Fanta' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Fanta')}
                                            />
                                            <p className="mt-2 text-sm">Fanta</p>
                                        </div>
                                        <div className="flex-shrink-0 w-24 text-center cursor-pointer">
                                            <img
                                                src={rumIcon}
                                                alt="Rum"
                                                className={`w-full h-12 object-contain transition-transform duration-300 ${clickedDrink === 'Rum' ? 'transform rotate-6 rounded-full p-2' : ''}`}
                                                onClick={() => handleDrinkClick('Rum')}
                                            />
                                            <p className="mt-2 text-sm">Rum</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right arrow for scrolling */}
                                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
                                    <FontAwesomeIcon
                                        icon={faArrowRight}
                                        className="text-gray-600 cursor-pointer"
                                        onClick={scrollRight}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredMerchants.map((merchant, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleMerchantSelect(merchant)}
                                        className="bg-white border rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
                                    >
                                        <img
                                            src={merchantImage}  // Use merchantImage as a placeholder
                                            alt={merchant.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-2 text-center">
                                            <h3 className="font-semibold text-lg text-gray-900">{merchant.name}</h3>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    ) : (
                        <div className="max-w-8xl mx-auto bg-white shadow-md rounded-lg p-6">
                            <button
                                onClick={handleBackToMerchants}
                                className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-200"
                            >
                                Back to Merchants
                            </button>
                            <Routes>
                                <Route path="products/:store" element={<Products setCart={setCart} setSpecialInst={setSpecialInst} setPromotions={setPromotion}/>}/>
                                <Route path="cart"
                                       element={<Cart cart={cart} setOrder={setOrder}
                                                      merchantName={selectedMerchant.name}
                                                      merchantEmail={selectedMerchant.email}
                                                      specialInstruction={specialInstruction}
                                                      promotions={promotions}
                                       />}/>
                                <Route path="orders" element={<Orders order={order} />}/>
                                <Route path="manage-account" element={<ManageAccount />}/>
                                <Route path="order-history" element={<OrderHistory specialInstruction={specialInstruction}/>}/>
                            </Routes>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default ClientHome;