import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation

function Order({ order, specialInstruction, setSelectedMerchant }) {
    const [orderDetails, setOrderDetails] = useState(order ? order.orderDetails : null);
    const [orderTags, setOrderTags] = useState({ orderNum: '', otp: '' });
    const [orderStatus, setOrderStatus] = useState(''); // Track order status messages
    const [showCollectedModal, setShowCollectedModal] = useState(false);  // Track if collected modal is visible
    const socket = useWebSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const data = event.data.split(",");
                const action = data[0];

                if (action === "orderDetails") {
                    const parsedOrderDetails = {
                        merchantName: data[3],
                        orderNum: data[4],
                        otp: data[5],
                        items: data[2].split('/').map((name, index) => ({
                            name,
                            quantity: orderDetails?.[index]?.quantity || 0,
                            price: orderDetails?.[index]?.price || 0,
                            total: orderDetails?.[index]?.total || 0
                        })),
                        total: order.total,
                    };

                    const updatedOrderTags = {
                        orderNum: data[4],
                        otp: data[5],
                    };

                    setOrderDetails(parsedOrderDetails.items);
                    setOrderTags(updatedOrderTags);
                } else if (action === "accepted") {
                    setOrderStatus('Your order has been accepted!');
                } else if (action === "ready") {
                    setOrderStatus('Your order is ready. Please head to the counter to collect it.');
                } else if (action === "collected") {
                    setOrderStatus('Your order has been collected! Thank you for your purchase.');
                    setShowCollectedModal(true);
                }
            };
        }
    }, [socket, orderDetails]);

    const handleOkay = () => {
        setShowCollectedModal(false);  // Reset selected merchant
        navigate('/client-home');   // Navigate back to client-home
    };

    const generatePdf = () => {
        const doc = new jsPDF();
        const content = `
************************
Order Number: ${orderTags.orderNum || order.orderNum}
Merchant: ${order.merchantName}
OTP: ${orderTags.otp || order.otp}
Order Details:
${orderDetails.map(item => `- ${item.name}: Quantity: ${item.quantity}, Price: R ${item.price.toFixed(2)}, Total: R ${item.total.toFixed(2)}`).join('\n')}
Total Price: R ${order.total.toFixed(2)}
Special Instruction: ${specialInstruction || 'None'}
************************
        `;

        doc.text(content, 10, 10);
        doc.save(`order_receipt_${orderTags.orderNum || order.orderNum}.pdf`);
    };

    if (!orderDetails) {
        return <p>Loading order details...</p>;
    }

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <div className="relative">
                <h2 className="text-2xl font-bold mb-4">Order Receipt</h2>
                {orderStatus && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-full">
                        {orderStatus}
                    </div>
                )}
            </div>
            <p className="text-lg font-semibold">Order Number: {orderTags.orderNum || order.orderNum}</p>
            <p className="text-lg font-semibold">Merchant: {order.merchantName}</p>
            <p className="text-lg font-semibold">OTP: {orderTags.otp || order.otp}</p>

            <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">Order Details:</h3>
                <div className="grid grid-cols-1 gap-4">
                    {orderDetails.map((item, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-lg">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price per unit: R {item.price.toFixed(2)}</p>
                            <p>Total: R {item.total.toFixed(2)}</p>
                            {specialInstruction && (
                                <p>Special Instruction: {specialInstruction}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-bold">Total Price: R {order.total.toFixed(2)}</h3>
            </div>

            {/* Button to download the PDF */}
            <div className="mt-4">
                <button 
                    onClick={generatePdf} 
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                    Download PDF
                </button>
            </div>

            {showCollectedModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-bold mb-4">Order Collected</h3>
                        <p>Thank you for your purchase!</p>
                        <button 
                            onClick={handleOkay}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full">
                            Okay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Order;
