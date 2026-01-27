import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Login from "./Login";
import { WebSocketContext } from "../contexts/WebSocketContext";
import userEvent from "@testing-library/user-event";

// Mock WebSocketContext for testing purposes
const mockSocket = {
    onopen: jest.fn(),
    onmessage: jest.fn(),
    onclose: jest.fn(),
    send: jest.fn(),
    readyState: WebSocket.OPEN,
};

// Mock window.alert to avoid jsdom issues
beforeAll(() => {
    window.alert = jest.fn();
});

// Suppress act warnings
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message) => {
        if (message.includes('Warning: `ReactDOMTestUtils.act`')) {
            return;
        }
        console.error(message); // Show other warnings if needed
    });
});

// Restore console after each test
afterEach(() => {
    jest.restoreAllMocks();
});

jest.mock("../contexts/WebSocketContext", () => ({
    useWebSocket: () => mockSocket,
}));

describe("Login Component", () => {
    test("renders the login form with email and password fields", () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/enter your password/i);
        const loginButton = screen.getByRole("button", { name: /login/i });

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
    });

    test("allows user to type into email and password fields", () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/enter your password/i);

        act(() => {
            userEvent.type(emailInput, "test@example.com");
            userEvent.type(passwordInput, "password123");
        });

        expect(emailInput.value).toBe("test@example.com");
        expect(passwordInput.value).toBe("password123");
    });

    test("handles login when WebSocket is open", () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/enter your password/i);
        const loginButton = screen.getByRole("button", { name: /login/i });

        act(() => {
            fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "admin123" } });
            fireEvent.click(loginButton);
        });

        expect(mockSocket.send).toHaveBeenCalledWith("role,M");
        expect(mockSocket.send).toHaveBeenCalledWith("account,login,admin@example.com,admin123");
    });

    test("displays loading spinner during login", () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        const loginButton = screen.getByRole("button", { name: /login/i });

        act(() => {
            fireEvent.click(loginButton);
        });

        const loadingGif = screen.getByAltText(/loading/i);
        expect(loadingGif).toBeInTheDocument();
    });

    test("displays an alert message when WebSocket connection is closed", () => {
        render(
            <Router>
                <Login />
            </Router>
        );

        // Simulate WebSocket being closed
        mockSocket.readyState = WebSocket.CLOSED;

        const loginButton = screen.getByRole("button", { name: /login/i });

        act(() => {
            fireEvent.click(loginButton);
        });

        expect(screen.queryByAltText(/loading/i)).not.toBeInTheDocument();
        expect(mockSocket.send).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(
            "WebSocket connection is not open. Please try again later."
        );
    });
});
