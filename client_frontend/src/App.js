import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ClientHome from "./components/ClientHome";
import ManageAccount from "./components/ManageAccount";
import OrderHistory from './components/OrderHistory';  // Import the OrderHistory page
import Wallet from './components/Wallet';
import { WebSocketProvider } from './context/WebSocketContext';
import { UserProvider } from './context/UserContext';
import { MerchantProvider } from './context/MerchantContext';

function App() {
    return (
            <UserProvider>
                <WebSocketProvider>
                    <MerchantProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<Login />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/sign-up" element={<SignUp />} />
                                <Route path="/client-home/*" element={<ClientHome />} />
                                <Route path="/manage-account" element={<ManageAccount />} />
                                <Route path="/order-history" element={<OrderHistory />} />
                                <Route path="/wallet" element={<Wallet />} />
                            </Routes>
                        </Router>
                    </MerchantProvider>
                </WebSocketProvider>
            </UserProvider>
    );
}

export default App;
