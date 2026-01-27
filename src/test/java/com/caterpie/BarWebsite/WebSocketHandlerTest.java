package com.caterpie.BarWebsite;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.caterpie.BarWebsite.config.WebSocketHandler;
import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.User;
import com.caterpie.BarWebsite.repository.CustomerRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.service.UserService;


/**
    @Mock
    private User user;

    @Mock
    private WebSocketSession userSession;    @Mock
    private User user; 

    @Mock
    private WebSocketSession userSess * Unit tests for the WebSocketHandler class
 * These tests cover different scenarios such as valid customer and merchant username resets,
 * handling cases where the email is not found, and ensuring proper error messaging for insufficient parameters.
 */
@SpringBootTest
public class WebSocketHandlerTest {

    @MockBean // Mocking the CustomerRepository to simulate database interactions
    private CustomerRepository customerRepository;

    @MockBean // Mocking the MerchantRepository for merchant-specific interactions
    private MerchantRepository merchantRepository;

    @MockBean // Mocking the WebSocketSession to simulate WebSocket communications
    private WebSocketSession session;

    @Autowired // Injecting the WebSocketHandler with mocked dependencies
    private WebSocketHandler webSocketHandler;

    @Mock
    private User user;  

    @Mock
    private WebSocketSession userSession;

    @MockBean
    private UserService userService; // Mocked service that handles profile creation

    @BeforeEach
    public void setUp() {
        webSocketHandler.getSessions().clear(); // Clear sessions before each test
    }

    /**
     * Tests the handleResetUsername method for a valid customer.
     * It verifies that the customer's username is updated and that a success message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetUsername_ValidCustomer() throws Exception {
        String[] parts = {"resetUsername", "customer@example.com", "newUsername"};
        Customer customer = new Customer();
        customer.setUsername("oldUsername");

        when(customerRepository.findByEmail("customer@example.com")).thenReturn(customer);

        webSocketHandler.handleResetUsername(session, parts);

        assertEquals("newUsername", customer.getUsername());
        verify(customerRepository).save(customer);
        verify(session).sendMessage(new TextMessage("Success: Your Username has been reset."));
    }

    /**
     * Tests the handleResetUsername method for a valid merchant.
     * It ensures the merchant's username is updated, and the appropriate success message is sent.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetUsername_ValidMerchant() throws Exception {
        String[] parts = {"resetUsername", "merchant@example.com", "newUsername"};
        Merchant merchant = new Merchant();
        merchant.setUsername("oldUsername");

        when(merchantRepository.findByEmail("merchant@example.com")).thenReturn(merchant);
        when(customerRepository.findByEmail("merchant@example.com")).thenReturn(null);

        webSocketHandler.handleResetUsername(session, parts);

        assertEquals("newUsername", merchant.getUsername());
        verify(merchantRepository).save(merchant);
        verify(session).sendMessage(new TextMessage("Success: Your Username has been reset."));
    }

    /**
     * Tests the handleResetUsername method when the email is not found for both customer and merchant.
     * It checks that the appropriate error message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetUsername_EmailNotFound() throws Exception {
        String[] parts = {"resetUsername", "notfound@example.com", "newUsername"};

        when(customerRepository.findByEmail("notfound@example.com")).thenReturn(null);
        when(merchantRepository.findByEmail("notfound@example.com")).thenReturn(null);

        webSocketHandler.handleResetUsername(session, parts);

        verify(session).sendMessage(new TextMessage("Error: Account not found for email: notfound@example.com"));
    }

    /**
     * Tests the handleResetUsername method when insufficient parameters are provided.
     * It ensures that an appropriate error message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetUsername_InsufficientParameters() throws Exception {
        String[] parts = {"resetUsername"};

        webSocketHandler.handleResetUsername(session, parts);

        verify(session).sendMessage(new TextMessage("Error: Usage:resetUsername,<user_email>,new_Username"));
    }

    //#####################################################################

    /**
     * Tests the handleResetPassword method for a valid customer.
     * It verifies that the customer's password is updated and that a success message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetPassword_ValidCustomer() throws Exception {
        String[] parts = {"resetPassword", "customer@example.com", "newPassword", "newPassword"};
        Customer customer = new Customer();
        customer.setPassword("oldPassword");

        // Simulate finding a customer by email
        when(customerRepository.findByEmail("customer@example.com")).thenReturn(customer);

        // Call the method under test
        webSocketHandler.handleResetPassword(session, parts);

        // Assertions to check that the password was updated and the correct message was sent
        assertEquals("newPassword", customer.getPassword());
        verify(customerRepository).save(customer);
        verify(session).sendMessage(new TextMessage("Success: Your password has been reset."));
    }

    /**
     * Tests the handleResetPassword method for a valid merchant.
     * It ensures the merchant's password is updated, and the appropriate success message is sent.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetPassword_ValidMerchant() throws Exception {
        String[] parts = {"resetPassword", "merchant@example.com", "newPassword", "newPassword"};
        Merchant merchant = new Merchant();
        merchant.setPassword("oldPassword");

        // Simulate finding a merchant by email and ensuring no customer is found
        when(customerRepository.findByEmail("merchant@example.com")).thenReturn(null);
        when(merchantRepository.findByEmail("merchant@example.com")).thenReturn(merchant);

        // Call the method under test
        webSocketHandler.handleResetPassword(session, parts);

        // Assertions to verify password update and message
        assertEquals("newPassword", merchant.getPassword());
        verify(merchantRepository).save(merchant);
        verify(session).sendMessage(new TextMessage("Success: Your password has been reset."));
    }

    /**
     * Tests the handleResetPassword method when the email is not found for both customer and merchant.
     * It checks that the appropriate error message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetPassword_EmailNotFound() throws Exception {
        String[] parts = {"resetPassword", "notfound@example.com", "newPassword", "newPassword"};

        // Simulate that both customer and merchant are not found
        when(customerRepository.findByEmail("notfound@example.com")).thenReturn(null);
        when(merchantRepository.findByEmail("notfound@example.com")).thenReturn(null);

        // Call the method under test
        webSocketHandler.handleResetPassword(session, parts);

        // Verify that the correct error message is sent
        verify(session).sendMessage(new TextMessage("Error: Account not found for email: notfound@example.com"));
    }

    /**
     * Tests the handleResetPassword method when the passwords do not match.
     * It ensures that an appropriate error message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetPassword_PasswordsDoNotMatch() throws Exception {
        String[] parts = {"resetPassword", "customer@example.com", "newPassword", "differentPassword"};
        Customer customer = new Customer();
        customer.setPassword("oldPassword");

        // Simulate finding a customer by email
        when(customerRepository.findByEmail("customer@example.com")).thenReturn(customer);

        // Call the method under test
        webSocketHandler.handleResetPassword(session, parts);

        // Verify that the correct error message is sent
        verify(session).sendMessage(new TextMessage("Error: Passwords do not match."));
    }

    /**
     * Tests the handleResetPassword method when the new password is empty.
     * It checks that the appropriate error message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetPassword_EmptyPassword() throws Exception {
        String[] parts = {"resetPassword", "customer@example.com", "", ""};
        Customer customer = new Customer();
        customer.setPassword("oldPassword");

        // Simulate finding a customer by email
        when(customerRepository.findByEmail("customer@example.com")).thenReturn(customer);

        // Call the method under test
        webSocketHandler.handleResetPassword(session, parts);

        // Verify that the correct error message is sent
        verify(session).sendMessage(new TextMessage("Error: Password cannot be empty."));
    }

    /**
     * Tests the handleResetPassword method when insufficient parameters are provided.
     * It ensures that an appropriate error message is sent via the WebSocket session.
     *
     * @throws Exception if there is an issue during the test execution
     */
    @Test
    public void testHandleResetPassword_InsufficientParameters() throws Exception {
        String[] parts = {"resetPassword", "customer@example.com"};

        // Call the method under test
        webSocketHandler.handleResetPassword(session, parts);

        // Verify that the correct error message is sent for insufficient parameters
        verify(session).sendMessage(new TextMessage("Error: Usage: resetPassword,<user_email>,newPassword,confirmNewPassword"));
    }

    //########################################
    @Test
    public void testHandleLogout_ValidUser() throws Exception {
        // Mock the WebSocket session for the user
        WebSocketSession userSession = mock(WebSocketSession.class);
    
        // Create a User instance with the mocked session
        User user = new User();
        user.setSession(userSession);

        // Add the user to the WebSocketHandler's sessions map
        WebSocketHandler.sessions.put("user1", user); // Add the user with a valid session

        // Invoke the method to test, passing the same session that is in the User object
        webSocketHandler.handleLogout(userSession);

        // Verify interactions with the session
        verify(userSession).sendMessage(new TextMessage("Logged out"));
        verify(userSession).close();
    
        // Clean up after the test to avoid affecting other tests
        WebSocketHandler.sessions.clear();
    }

    //###########################################################
    @Test
    public void testCreateCustomerAccount_Success() throws Exception {
        // Given: A successful account creation request
        String username = "testUser";
        String password = "testPass";
        String email = "test@example.com";
        boolean isMerchant = false;
        boolean isSystemAdmin = false;

        // When the userService.createProfile is called, return true (account created)
        when(userService.createProfile(username, password, email, isMerchant, isSystemAdmin)).thenReturn(true);

        // When: The createCustomerAccount method is invoked
        webSocketHandler.createCustomerAccount(session, username, password, email, isMerchant, isSystemAdmin);

        // Then: Verify the success message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Account created successfully. You can now log in."));
    }

    @Test
    public void testCreateCustomerAccount_EmailTaken() throws Exception {
        // Given: An email that is already taken
        String username = "testUser";
        String password = "testPass";
        String email = "taken@example.com";
        boolean isMerchant = false;
        boolean isSystemAdmin = false;

        // When the userService.createProfile is called, return false (email taken)
        when(userService.createProfile(username, password, email, isMerchant, isSystemAdmin)).thenReturn(false);

        // When: The createCustomerAccount method is invoked
        webSocketHandler.createCustomerAccount(session, username, password, email, isMerchant, isSystemAdmin);

        // Then: Verify the error message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Email taken."));
    }

    //##########################################################
        @Test
    public void testCreateMerchantAccount_Success() throws Exception {
        // Given: A successful merchant account creation request
        String username = "merchantUser";
        String password = "merchantPass";
        String email = "merchant@example.com";
        boolean isMerchant = true;
        boolean isSystemAdmin = false;

        // When the userService.createProfile is called, return true (account created)
        when(userService.createProfile(username, password, email, isMerchant, isSystemAdmin)).thenReturn(true);

        // When: The createMerchantAccount method is invoked
        webSocketHandler.createMerchantAccount(session, username, password, email, isMerchant, isSystemAdmin);

        // Then: Verify the success message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Account created successfully. You can now log in."));
    }

    @Test
    public void testCreateMerchantAccount_EmailTaken() throws Exception {
        // Given: An email that is already taken
        String username = "merchantUser";
        String password = "merchantPass";
        String email = "taken@example.com";
        boolean isMerchant = true;
        boolean isSystemAdmin = false;

        // When the userService.createProfile is called, return false (email taken)
        when(userService.createProfile(username, password, email, isMerchant, isSystemAdmin)).thenReturn(false);

        // When: The createMerchantAccount method is invoked
        webSocketHandler.createMerchantAccount(session, username, password, email, isMerchant, isSystemAdmin);

        // Then: Verify the error message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Email taken."));
    }

    //#################################################### 
    @Test
    public void testLoginCustomer_Success() throws Exception {
        // Given: Valid login credentials for a customer
        String email = "customer@example.com";
        String password = "password123";
        boolean isMerchant = false;
        boolean isSystemAdmin = false;
        boolean isAdmin = false;
        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setUsername("JohnDoe");

        // When the userService.validateLogin is called, return 1 (success)
        when(userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin)).thenReturn(1);
        when(userService.getCustomerFromEmail(email)).thenReturn(customer);

        // When: The loginCustomer method is invoked
        webSocketHandler.loginCustomer(session, email, password, isMerchant, isSystemAdmin, isAdmin);

        // Then: Verify the success message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Logged in successfully"));

        // Then: Verify that the customer is added to the sessions map
        assertTrue(webSocketHandler.getSessions().containsKey(email));
    }

    @Test
    public void testLoginCustomer_InvalidCredentials() throws Exception {
        // Given: Invalid login credentials
        String email = "customer@example.com";
        String password = "wrongPassword";
        boolean isMerchant = false;
        boolean isSystemAdmin = false;
        boolean isAdmin = false;

        // When the userService.validateLogin is called, return 2 (invalid credentials)
        when(userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin)).thenReturn(2);

        // When: The loginCustomer method is invoked
        webSocketHandler.loginCustomer(session, email, password, isMerchant, isSystemAdmin, isAdmin);

        // Then: Verify the "Invalid credentials" message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Invalid credentials"));

        // Then: Verify the user is NOT added to the sessions map
        assertFalse(webSocketHandler.getSessions().containsKey(email));
    }

    @Test
    public void testLoginCustomer_AccountNotFound() throws Exception {
        // Given: Email not found in the system
        String email = "unknown@example.com";
        String password = "password123";
        boolean isMerchant = false;
        boolean isSystemAdmin = false;
        boolean isAdmin = false;

        // When the userService.validateLogin is called, return 0 (account not found)
        when(userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin)).thenReturn(0);

        // When: The loginCustomer method is invoked
        webSocketHandler.loginCustomer(session, email, password, isMerchant, isSystemAdmin, isAdmin);

        // Then: Verify the "Account not found. Please register." message is sent to the WebSocket session
        verify(session).sendMessage(new TextMessage("Account not found. Please register."));

        // Then: Verify the user is NOT added to the sessions map
        assertFalse(webSocketHandler.getSessions().containsKey(email));
    }
//####################################################

@Test
public void testLoginMerchant_InvalidCredentials() throws Exception {
    // Given: Invalid login credentials
    String email = "merchant@example.com";
    String password = "wrongPassword";
    boolean isMerchant = true;
    boolean isSystemAdmin = false;
    boolean isAdmin = false;

    // When the userService.validateLogin is called, return 2 (invalid credentials)
    when(userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin)).thenReturn(2);

    // When: The loginMerchant method is invoked
    webSocketHandler.loginMerchant(session, email, password, isMerchant, isSystemAdmin, isAdmin);

    // Then: Verify the "Invalid credentials" message is sent to the WebSocket session
    verify(session).sendMessage(new TextMessage("Invalid credentials"));

    // Then: Verify the user is NOT added to the sessions map
    assertFalse(webSocketHandler.getSessions().containsKey(email));
}

@Test
public void testLoginMerchant_AccountNotFound() throws Exception {
    // Given: Email not found in the system
    String email = "unknown@example.com";
    String password = "password123";
    boolean isMerchant = true;
    boolean isSystemAdmin = false;
    boolean isAdmin = false;

    // When the userService.validateLogin is called, return 0 (account not found)
    when(userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin)).thenReturn(0);

    // When: The loginMerchant method is invoked
    webSocketHandler.loginMerchant(session, email, password, isMerchant, isSystemAdmin, isAdmin);

    // Then: Verify the "Account not found. Please register." message is sent to the WebSocket session
    verify(session).sendMessage(new TextMessage("Account not found. Please register."));

    // Then: Verify the user is NOT added to the sessions map
    assertFalse(webSocketHandler.getSessions().containsKey(email));
}

}
