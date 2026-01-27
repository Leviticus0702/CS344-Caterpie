import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';  
import { useWebSocket } from '../context/WebSocketContext'; 
import profilePic from "../assets/avatar.jpg";
import { useUserContext } from '../context/UserContext';

const Navbar = ({ setSearchTerm, resetSearch, merchants, drinks, onSearchSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [filter, setFilter] = useState('all');
    const [filteredResults, setFilteredResults] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const searchBarRef = useRef(null);
    const sidebarRef = useRef(null);
    const navigate = useNavigate(); 
    const socket = useWebSocket(); 
    const { username, setUsername } = useUserContext();
    const { email, setEmail } = useUserContext();

    useEffect(() => {
        if (resetSearch) {
            setSearchQuery('');
        }
    }, [resetSearch]);

    useEffect(() => {
        let results = [];

        if (!searchQuery) {
            results = [];
        } else {
            if (filter === 'stores') {
                results = merchants.filter((merchant) =>
                    merchant.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((merchant) => ({
                    merchant
                }));
            }

            if (filter === 'drinks' || filter === 'all') {
                const storesWithDrinks = merchants
                    .filter((merchant) =>
                        merchant.drinks.some((drink) =>
                            drink.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                    )
                    .map((merchant) => {
                        const matchingDrinks = merchant.drinks.filter((drink) =>
                            drink.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        return { merchant, drinks: matchingDrinks };
                    });

                if (filter === 'all') {
                    const storeResults = merchants.filter((merchant) =>
                        merchant.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    results = [
                        ...storeResults.map(store => ({ merchant: store })),
                        ...storesWithDrinks
                    ];
                } else {
                    results = storesWithDrinks;
                }
            }
        }

        setFilteredResults(results);

    }, [searchQuery, filter, merchants]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setSearchTerm(e.target.value);
    };

    const handleResultClick = (result) => {
        onSearchSelect(result);
        setIsExpanded(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchBarRef.current &&
                !searchBarRef.current.contains(event.target) &&
                !sidebarRef.current?.contains(event.target)
            ) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send('account,logout');
            socket.send('account,logout');
            setEmail("");
            setUsername("");
            navigate('/login');
        } else {
            alert("WebSocket connection is not open. Please try again later.");
        }
    };

    return (
        <div>
            <nav className="bg-white p-4 flex justify-between items-center relative">
                <FontAwesomeIcon
                    icon={faBars}
                    className="text-xl md:text-3xl cursor-pointer text-black"
                    onClick={toggleSidebar}
                />

                <img src={`${process.env.PUBLIC_URL}/p_logo.jpeg`} alt="Pourtal Logo" className="h-8 sm:h-10 md:h-12 ml-0" />

                <div className="relative w-1/2 ml-4" ref={searchBarRef}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search..."
                        onClick={() => setIsExpanded(true)}
                        className="pl-10 w-full px-4 py-1 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm md:text-md"
                    />
                    {isExpanded && (
                        <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded-lg shadow-lg z-50">
                            <div className="flex justify-around p-2 border-b text-sm md:text:lg">
                                <button
                                    className={`px-2 py-2 sm:px-4 ${filter === 'all' ? 'font-bold' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`px-2 py-2 sm:px-4 ${filter === 'drinks' ? 'font-bold' : ''}`}
                                    onClick={() => setFilter('drinks')}
                                >
                                    Drinks
                                </button>
                                <button
                                    className={`px-2 py-2 sm:px-4 ${filter === 'stores' ? 'font-bold' : ''}`}
                                    onClick={() => setFilter('stores')}
                                >
                                    Stores
                                </button>
                            </div>

                            <div className="p-4 max-h-64 overflow-y-auto">
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                            onClick={() => handleResultClick(result)}
                                        >
                                            {result.drinks ? (
                                                <>
                                                    <span
                                                        className="text-black text-sm sm:text-md">{result.drinks.map(d => d.name).join(', ')}</span>
                                                    <span className="pl-1 text-gray-500 text-xs sm:text-md">{result.merchant.name}</span>
                                                </>
                                            ) : (
                                                <span
                                                    className="text-gray-700">{result.merchant?.name || result.name}</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No results found</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm md:text-md lg:text-md"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </nav>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
                    onClick={toggleSidebar}
                >
                    <div
                        ref={sidebarRef}
                        className="bg-white w-32 sm:w-64 h-full p-4 absolute left-0 top-0 z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <Link to={{pathname: "/manage-account",
                                    state: { username, email }}} className="flex items-center space-x-2 p-0 hover:bg-gray-100 cursor-pointer">
                                <img src={profilePic} alt="Profile" className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold">{username}</p>
                                    <p className="text-green-500 text-sm sm:text-md">Manage account</p>
                                </div>
                            </Link>
                        </div>
                        <ul>
                            <li className="mb-2"><Link to="/order-history" className="hover:underline">Order History</Link></li>
                            <li className="mb-2">Favorites</li>
                            <li className="mb-2"><Link to="/wallet" className="hover:underline">Wallet</Link></li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
