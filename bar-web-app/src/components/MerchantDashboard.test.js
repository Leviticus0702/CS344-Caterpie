import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import MerchantDashboard from "./MerchantDashboard";
import { WebSocketContext } from "../contexts/WebSocketContext";
import userEvent from "@testing-library/user-event";
import { React } from "react";

// Mock WebSocket for testing purposes
const mockSocket = {
    onopen: jest.fn(),
    onmessage: jest.fn(),
    onclose: jest.fn(),
    send: jest.fn(),
    readyState: WebSocket.OPEN,
};

// Mock the WebSocketContext
jest.mock("../contexts/WebSocketContext", () => ({
    useWebSocket: () => mockSocket,
}));

// Suppress the warning related to deprecated `act` and restore after tests
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((message) => {
        if (!message.includes('ReactDOMTestUtils.act is deprecated')) {
            console.error(message);
        }
    });
});

afterAll(() => {
    console.error.mockRestore();
});

describe("MerchantDashboard Component", () => {
    test("displays incoming orders", () => {
        render(
            <Router>
                <MerchantDashboard />
            </Router>
        );

        // Simulate receiving an incoming order through WebSocket
        act(() => {
            mockSocket.onmessage({
                data: "newOrder,123,Latte/Tea,1/2,25.00,None/No sugar",
            });
        });

        // Check if the order is displayed
        expect(screen.getByText("Order #123")).toBeInTheDocument();
        expect(screen.getByText("Latte")).toBeInTheDocument();
        expect(screen.getByText("Tea")).toBeInTheDocument();
        expect(screen.getByText("x1")).toBeInTheDocument();
        expect(screen.getByText("x2")).toBeInTheDocument();
    });

    test("moves order from incoming to accepted", () => {
        render(
            <Router>
                <MerchantDashboard />
            </Router>
        );

        // Simulate receiving an incoming order
        act(() => {
            mockSocket.onmessage({
                data: "newOrder,123,Latte,1,25.00,None",
            });
        });

        // Click on the "Accept Order" button
        const acceptButton = screen.getByText("Accept Order");
        act(() => {
            fireEvent.click(acceptButton);
        });

        // Verify that the order is now in accepted orders and no longer in incoming orders
        expect(screen.getByText("Order #123")).toBeInTheDocument();
        expect(screen.getByText("Complete Order")).toBeInTheDocument();
        expect(mockSocket.send).toHaveBeenCalledWith("accept,123");
    });

    test("marks order as completed", async () => {
        render(
            <Router>
                <MerchantDashboard />
            </Router>
        );

        // Simulate receiving an incoming order
        act(() => {
            mockSocket.onmessage({
                data: "newOrder,123,Latte,1,25.00,None",
            });
        });

        // Click on the "Accept Order" button to move the order to accepted orders
        const acceptButton = screen.getByText(/accept order/i);
        act(() => {
            fireEvent.click(acceptButton);
        });

        // Wait for the "Complete Order" button to appear
        const completeButton = await screen.findByText(/complete order/i);
        expect(completeButton).toBeInTheDocument();

        // Click the "Complete Order" button to mark the order as completed
        act(() => {
            fireEvent.click(completeButton);
        });

        // Verify the socket message for marking the order as completed
        expect(mockSocket.send).toHaveBeenCalledWith("ready,123");
    });

    test("submits correct OTP", async () => {
        render(
            <Router>
                <MerchantDashboard/>
            </Router>
        );

        // Simulate completing an order
        act(() => {
            mockSocket.onmessage({
                data: "newOrder,123,Latte,1,25.00,None",
            });
        });
        act(() => {
            fireEvent.click(screen.getByText("Accept Order"));
        });

        const completeButton = await screen.findByText(/complete order/i);
        expect(completeButton).toBeInTheDocument();

        act(() => {
            fireEvent.click(completeButton);
        });

        // Click on the completed order to enter OTP
        act(() => {
            fireEvent.click(screen.getByText("Order #123"));
        });

        // Use within to scope the search to the modal and target the OTP input
        const otpModal = screen.getByText(/Enter the OTP to complete this order:/).closest('div');
        const otpInput = within(otpModal).getByRole('textbox');

        // Enter correct OTP and submit
        act(() => {
            userEvent.type(otpInput, "123456");
            fireEvent.click(within(otpModal).getByText("Submit OTP"));
        });

        // Simulate receiving correct OTP from WebSocket
        act(() => {
            mockSocket.onmessage({data: "correct_otp"});
        });

        // Verify that the correct socket message was sent
        expect(mockSocket.send).toHaveBeenCalledWith("collect,123,123456");

        // Ensure the order disappears after completing it
        expect(screen.queryByText("Order #123")).not.toBeInTheDocument();
    });

    test("displays error on incorrect OTP", async () => {
        render(
            <Router>
                <MerchantDashboard/>
            </Router>
        );

        // Simulate completing an order
        act(() => {
            mockSocket.onmessage({
                data: "newOrder,123,Latte,1,25.00,None",
            });
        });
        act(() => {
            fireEvent.click(screen.getByText("Accept Order"));
        });

        const completeButton = await screen.findByText(/complete order/i);
        expect(completeButton).toBeInTheDocument();

        act(() => {
            fireEvent.click(completeButton);
        });

        // Click on the completed order to enter OTP
        act(() => {
            fireEvent.click(screen.getByText("Order #123"));
        });

        // Use within to scope the search to the modal and target the OTP input
        const otpModal = screen.getByText(/Enter the OTP to complete this order:/).closest('div');
        const otpInput = within(otpModal).getByRole('textbox');

        // Enter incorrect OTP and submit
        act(() => {
            userEvent.type(otpInput, "wrongOtp");
            fireEvent.click(within(otpModal).getByText("Submit OTP"));
        });

        // Simulate receiving incorrect OTP from WebSocket
        act(() => {
            mockSocket.onmessage({data: "wrong_otp"});
        });

        // Verify that error message is displayed
        expect(screen.getByText("Wrong OTP. Please try again.")).toBeInTheDocument();
    });
});

