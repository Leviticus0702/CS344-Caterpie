import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';

function Cart({ cart = {}, setOrder, merchantName, merchantEmail, specialInstruction }) {
    const navigate = useNavigate();
    const socket = useWebSocket();
    const [orderNum, setOrderNum] = useState('');
    const [otp, setOtp] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [finalOrder, setFinalOrder] = useState(null);
    const [orderStatus, setOrderStatus] = useState('');
    const [quantityViolation, setQuantityViolation] = useState(null); // State to track quantity violation
    const location = useLocation();

    const cartItems = Array.isArray(cart) ? cart : Object.values(cart);
    
    const calculateTotal = () => {
        return cartItems.reduce((total, product) => {
            return total + product.price * product.quantity;
        }, 0);
    };

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                console.log("Message received from server:", event.data);
                const data = event.data.split(",");
                const action = data[0];
    
                if (action === "orderDetails") {
                    finalOrder.orderNum = data[4];
                    finalOrder.otp = data[5];
                    setOrderNum(finalOrder.orderNum);
                    setOtp(finalOrder.otp);
                    setOrderDetails(finalOrder);
                    setIsProcessing(false);
                    if (finalOrder) {
                        navigate('/client-home/orders', { state: finalOrder });
                    }
                } else if (action === "accepted") {
                    setOrderStatus('Your order has been accepted!');
                } else if (action === "ready") {
                    setOrderStatus('Your order is ready. Please head to the counter to collect it.');
                } else if (action === "collected") {
                    setOrderStatus('Your order has been collected! Thank you for your purchase.');
                } else if (action === "QuantityViolated") {
                    // Parse the violation data correctly, assuming format is "Sprite/7,Coke/4"
                    const violationData = data[1].split(",").map(item => {
                        const [name, quantity] = item.split("/");
                        return { name, quantity };
                    });
                    setQuantityViolation(violationData);
                    setIsProcessing(false); // Stop processing if there's a violation
                }
            };
        }
    }, [socket, navigate, finalOrder]);

    const handlePlaceOrder = () => {
        const orderDetails = cartItems.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            orderInstruction: item.specialInstruction || 'null'
        }));

        const finalOrderNum = orderNum;
        const finalOtp = otp;

        const order = {
            orderDetails,
            orderNum: finalOrderNum,
            otp: finalOtp,
            total: calculateTotal(),
            merchantName,
        };

        setOrder(order);
        setFinalOrder(order);

        const orderDetailsString = cartItems.map(item => item.name).join('/');
        const quantitiesString = cartItems.map(item => item.quantity).join('/');
        const specialInstructionsString = cartItems.map(item => item.specialInstruction || 'null').join('/');

        if (socket && socket.readyState === WebSocket.OPEN) {
            setIsProcessing(true);
            const stringPacket = `order,${merchantEmail},${orderDetailsString},${quantitiesString},${specialInstructionsString}`;
            socket.send(stringPacket);
            console.log('Order sent via WebSocket:', stringPacket);
        }
    };

    

    const handleContinueShopping = () => {
        navigate(`/client-home/products/${merchantName}`, {
            state: {
                drinks: location.state.drinks,
                merchantName,
                merchantEmail,
                existingCart: cartItems
            }
        });
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. Please add some products.</p>
            ) : (
                <div>
                    <div className="grid grid-cols-1 gap-4">
                        {cartItems.map((productDetails, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-lg">
                                <h3 className="text-xl font-semibold mb-2">{productDetails.name}</h3>
                                <p>Quantity: {productDetails.quantity}</p>
                                <p>Price per unit: R {productDetails.price}</p>
                                <p>Total: R {productDetails.price * productDetails.quantity}</p>
                                {productDetails.specialInstruction && (
                                    <p>Special Instruction: {productDetails.specialInstruction}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold">Total Price: R {calculateTotal()}</h3>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handlePlaceOrder}
                            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Place Order'}
                        </button>
                        <button
                            onClick={handleContinueShopping}
                            className="ml-4 px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
                            disabled={isProcessing}
                        >
                            Continue Shopping
                        </button>
                    </div>
                    {isProcessing && (
                        <div className="mt-4 text-center">
                            <span className="text-gray-600">Loading...</span>
                        </div>
                    )}
                </div>
            )}

            {orderStatus && (
                <div className="mt-6 text-center">
                    <p className="text-xl font-semibold text-green-600">{orderStatus}</p>
                </div>
            )}

            {quantityViolation && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Sorry, your order exceeds availability</h3>
                        <p className="mb-4">The availability of the following items:</p>
                        <ul className="mb-4">
                            {quantityViolation.map((item, index) => (
                                <li key={index} className="text-gray-800">
                                    {item.name}: {item.quantity} available
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleContinueShopping}
                            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Cart;