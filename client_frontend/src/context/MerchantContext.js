// MerchantContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const MerchantContext = createContext();

// Create a provider component
export const MerchantProvider = ({ children }) => {
    const [merchants, setMerchants] = useState([]);
    const [isFetched, setIsFetched] = useState(false); // Track if data has been fetched

    return (
        <MerchantContext.Provider value={{ merchants, setMerchants, isFetched, setIsFetched }}>
            {children}
        </MerchantContext.Provider>
    );
};

// Custom hook to use the MerchantContext
export const useMerchantContext = () => useContext(MerchantContext);