import React, { createContext, useContext,useState, act } from 'react';
// Create the context
const UserContext = createContext();



export const useUserContext = () => {
    return useContext(UserContext);
};

// Create a provider component
export const UserProvider = ({ children }) => {
    const [email, setEmail] = useState(null);  // State to hold the user's email
    const [username, setUsername] = useState(''); // Added state for username
    



    return (
        <UserContext.Provider value={{ email, setEmail, username, setUsername}}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
