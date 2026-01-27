import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation

export const OrderHistory = () => {
    const [serverResponse, setServerResponse] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const socket = useWebSocket();

    const parseOrders = (rawData) => {
        if (!rawData) return []; // Return empty array if rawData is null or undefined

        const orders = rawData.split('************************')
            .filter(Boolean)  // Remove empty strings
            .map(order => {
                const orderObj = {};

                // Use regex to extract each part of the order
                const orderIdMatch = order.match(/Order Number:\s*(\d+)/);
                const detailsMatch = order.match(/Order Details:\s*([^\n]+)/);
                const quantitiesMatch = order.match(/Quantities:\s*([^\n]+)/);
                const priceMatch = order.match(/Total Price:\s*([^\n]+)/);
                const statusMatch = order.match(/Status:\s*([^\n]+)/);
                const merchantMatch = order.match(/Merchant Name:\s*([^\n]+)/);
                const dateMatch = order.match(/Date:\s*([^\n]+)/);
                const instructionsMatch = order.match(/Instructions:\s*([^\n]+)/);
                const idMatch = order.match(/Id:\s*(\d+)/);  // Regex to extract the Id
                const otpMatch = order.match(/OTP:\s*(\d+)/);

                // Assign values to the order object
                orderObj.orderId = orderIdMatch ? orderIdMatch[1] : '';
                orderObj.merchant = merchantMatch ? merchantMatch[1] : '';
                orderObj.totalAmount = priceMatch ? parseFloat(priceMatch[1]) : 0;
                orderObj.orderDate = dateMatch ? dateMatch[1] : '';
                orderObj.id = idMatch ? idMatch[1] : '';  // Assign the extracted Id
                orderObj.otp = otpMatch ? otpMatch[1] : '';  // Assign the extracted OTP

                const details = detailsMatch ? detailsMatch[1].split('/') : [];
                const quantities = quantitiesMatch ? quantitiesMatch[1].split('/').map(Number) : [];

                orderObj.items = details.map((name, idx) => ({
                    name,
                    quantity: quantities[idx] || 0,
                    price: orderObj.totalAmount / quantities.reduce((acc, qty) => acc + qty, 0) || 0,
                }));

                orderObj.status = statusMatch ? statusMatch[1] : '';
                if (instructionsMatch) {
                    orderObj.instructions = instructionsMatch[1];
                }

                // Only return valid orders with an order ID and at least one item
                if (orderObj.orderId && orderObj.items.length > 0) {
                    return orderObj;
                } else {
                    return null; // Return null for invalid orders
                }
            })
            .filter(order => order !== null);  // Filter out null orders

        return orders;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Incoming':
                return { label: 'Pending', color: 'bg-yellow-300', textColor: 'text-yellow-900' };
            case 'Collected':
                return { label: 'Collected', color: 'bg-green-300', textColor: 'text-green-900' };
            case 'Cancelled':
                return { label: 'Cancelled', color: 'bg-red-300', textColor: 'text-red-900' };
            case 'Ready':
                return { label: 'Ready', color: 'bg-blue-300', textColor: 'text-blue-900' };
            case 'Accepted':
                return { label: 'Accepted', color: 'bg-purple-300', textColor: 'text-purple-900' };
            default:
                return { label: status, color: 'bg-gray-300', textColor: 'text-gray-900' };
        }
    };

    useEffect(() => {
        const handleMessage = (event) => {
            const response = event.data;

            if (response && response.includes('Order History')) {
                setServerResponse(response);
                setLoading(false); // Stop loading when data is received
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
                    socket.send('orderHistory'); // Send request for order history
                } else {
                    socket.addEventListener('open', () => {
                        socket.send('orderHistory');
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

    const orderHistory = parseOrders(serverResponse);

    const generatePdf = (order) => {
        const doc = new jsPDF();
        const content = `
************************
Order Number: ${order.orderId}
Order Details: ${order.items.map(item => item.name).join(', ')}
Quantities: ${order.items.map(item => item.quantity).join(', ')}
Total Price: ${order.totalAmount.toFixed(2)}
Status: ${order.status}
Merchant Name: ${order.merchant}
Date: ${order.orderDate}
Id: ${order.id}
Instructions: ${order.instructions || 'None'}
************************
        `;
        console.log("Order Instructions:", order.instructions)

            console.log("PDF Instance:", doc); // Debug log to check the jsPDF instance
        
        doc.text(content, 10, 10);
        doc.save(`order_receipt_${order.id}.pdf`);
    };

    const downloadPdf = (order) => {
        generatePdf(order); // Call the generatePdf function to create and download the PDF
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-semibold mb-6">Order History</h1>
            {loading ? (
                <div className="flex justify-center items-center">
                    <p>Loading orders...</p>
                </div>
            ) : (
                orderHistory.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {orderHistory.map((order, index) => {
                            const { label, color, textColor } = getStatusColor(order.status);

                            return (
                                <div key={index} className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-3xl font-bold">Order #{order.orderId}</h2>
                                        <span className="text-gray-500">{order.orderDate}</span>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-2xl font-bold">OTP {order.otp}</p>
                                        <p className="text-lg font-semibold">Merchant: {order.merchant}</p>
                                    </div>
                                    <ul className="list-disc pl-5">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="mb-2">
                                                <span className="font-medium">{item.name}</span>: 
                                                {item.quantity} x R{item.price.toFixed(2)} = R{(item.quantity * item.price).toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                    <br />
                                    {order.instructions && typeof order.instructions === 'string' && order.instructions.trim() !== '' && (
                                        <p><strong>Special Instructions:</strong> {order.instructions}</p>
                                    )}



                                    <div className="mt-4 text-right">
                                        <p className="text-xl font-bold">Total: R{order.totalAmount.toFixed(2)}</p>
                                    </div>

                                    {/* Order Status Bubble */}
                                    <p className="text-lg font-semibold">Order Status: </p>
                                    <div className={`mt-4 inline-block px-6 py-2 ${color} ${textColor} rounded-md border border-gray-400`}>
                                        {label}
                                    </div>

                                    {/* Button to download the PDF */}
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => downloadPdf(order)} 
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No orders found.</p>
                )
            )}
        </div>
    );
};

export default OrderHistory;
