import React, { createContext, useContext, useState, useEffect } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const connectWebSocket = (retries = 5) => {
        const ws = new WebSocket('ws://localhost:8080/orders'); // Update the endpoint if needed

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setRetryCount(0); // Reset retry count on successful connection
        };

        ws.onclose = (event) => {
            console.log('WebSocket Disconnected', event);
            if (retries > 0) {
                console.log(`Retrying WebSocket connection... (${retries} attempts left)`);
                setTimeout(() => connectWebSocket(retries - 1), 1000); // Retry after 1 second
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onmessage = (event) => {
            console.log('Message from server:', event.data);
        };

        return ws;
    };

    useEffect(() => {
        const ws = connectWebSocket(retryCount);
        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [retryCount]);

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
