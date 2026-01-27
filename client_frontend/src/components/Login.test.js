import React, { act } from 'react'; // Import act from React
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import UserContext from '../context/UserContext';
import Login from './Login';
import { useWebSocket } from '../context/WebSocketContext';

// Mocking the WebSocket context
jest.mock('../context/WebSocketContext', () => ({
  useWebSocket: jest.fn(),
}));

const setUserEmailMock = jest.fn();

// Helper function to render the Login component with necessary context
const renderLoginComponent = () => {
  render(
    <UserContext.Provider value={{ setEmail: setUserEmailMock }}>
      <Router>
        <Login />
      </Router>
    </UserContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('renders login form', () => {
    renderLoginComponent(); // Use helper function to render
    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0); // Check for multiple instances
  });

  test('allows user to type email and password', () => {
    renderLoginComponent(); // Use helper function to render

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Wrap the actions in act
    act(() => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls setEmail with the correct email on successful login', () => {
    const mockSocket = {
      onopen: jest.fn(),
      onmessage: jest.fn(),
      onclose: jest.fn(),
      readyState: WebSocket.OPEN,
      send: jest.fn(),
    };
    useWebSocket.mockReturnValue(mockSocket); // Mocking the WebSocket

    renderLoginComponent(); // Use helper function to render

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton); // Simulate login button click
    });

    // Simulate receiving a successful login message
    act(() => {
      mockSocket.onmessage({ data: "Logged in successfully" });
    });

    // Assert that setEmail is called with the correct email
    expect(setUserEmailMock).toHaveBeenCalledWith('test@example.com');
  });

  test('shows alert on invalid credentials', () => {
    // Mock the alert function
    window.alert = jest.fn();

    const mockSocket = {
      onopen: jest.fn(),
      onmessage: jest.fn(),
      onclose: jest.fn(),
      readyState: WebSocket.OPEN,
      send: jest.fn(),
    };
    useWebSocket.mockReturnValue(mockSocket); // Mocking the WebSocket

    renderLoginComponent(); // Use helper function to render

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton); // Simulate login button click
    });

    // Simulate receiving an invalid credentials message
    act(() => {
      mockSocket.onmessage({ data: "Invalid credentials" });
    });

    // Assert that alert is called with the correct message
    expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
  });

  test('shows alert if WebSocket connection is not open', () => {
    // Mock the alert function
    window.alert = jest.fn();

    const mockSocket = {
      onopen: jest.fn(),
      onmessage: jest.fn(),
      onclose: jest.fn(),
      readyState: WebSocket.CLOSED, // Simulating a closed connection
      send: jest.fn(),
    };
    useWebSocket.mockReturnValue(mockSocket); // Mocking the WebSocket

    renderLoginComponent(); // Use helper function to render

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton); // Simulate login button click
    });

    // Assert that alert is called with the correct message
    expect(window.alert).toHaveBeenCalledWith("WebSocket connection is not open. Please try again later.");
  });
});
