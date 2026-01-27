import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const Wallet = () => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const socket = useWebSocket();
    const [serverResponse, setServerResponse] = useState(null);

    useEffect(() => {
        const handleMessage = (event) => {
            const response = event.data;
            console.log(response);
            if (response && response.includes('Balance')) {
                setServerResponse(response);
                // Update the balance state using the parsed response
                const extractedBalance = parseFloat(response.split(': ')[1]);
                if (!isNaN(extractedBalance)) {
                    setBalance(extractedBalance);
                }
            } else {
                console.error('Unexpected message from server:', response);
            }
        };

        const handleError = (error) => {
            console.error('WebSocket Error:', error);
        };

        if (socket) {
            const openSocket = () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send('viewBalance'); 
                } else {
                    socket.addEventListener('open', () => {
                        socket.send('viewBalance'); 
                    });
                }
                socket.addEventListener('message', handleMessage);
                socket.addEventListener('error', handleError);
            };

            openSocket();
        } else {
            alert('WebSocket connection is not open. Please try again later.');
        }

        return () => {
            if (socket) {
                socket.removeEventListener('message', handleMessage);
                socket.removeEventListener('error', handleError);
            }
        };

    }, [socket]);

    const handleDeposit = () => {
        const depositAmount = parseFloat(amount);
        if (!isNaN(depositAmount) && depositAmount > 0) {
            setBalance(prevBalance => prevBalance + depositAmount);
            setAmount('');
            // Send deposit message to the backend
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(`deposit,${depositAmount}`);
            } else {
                alert('WebSocket connection is not open. Please try again later.');
            }
        }
    };

    const handleWithdraw = () => {
        const withdrawAmount = parseFloat(amount);
        if (!isNaN(withdrawAmount) && withdrawAmount > 0 && withdrawAmount <= balance) {
            setBalance(prevBalance => prevBalance - withdrawAmount);
            setAmount('');
            // Send withdrawal message to the backend
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(`withdraw,${withdrawAmount}`);
            } else {
                alert('WebSocket connection is not open. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-5xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6">Portal Wallet</h1>

                {/* Wallet Balance */}
                <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center mb-6">
                    <div>
                        <p className="text-lg font-semibold">Portal Cash</p>
                        <h2 className="text-4xl font-bold">ZAR {balance.toFixed(2)}</h2>
                    </div>
                    <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                        + Gift card
                    </button>
                </div>

                {/* Deposit and Withdraw Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Manage Funds</h2>
                    <div className="flex space-x-4">
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="border border-gray-300 p-2 rounded-md w-1/2"
                        />
                        <button
                            onClick={handleDeposit}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500"
                        >
                            Deposit
                        </button>
                        <button
                            onClick={handleWithdraw}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
                        >
                            Withdraw
                        </button>
                    </div>
                    <p className="mt-2 text-gray-600">You can deposit or withdraw money from your Pourtal Wallet</p>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
