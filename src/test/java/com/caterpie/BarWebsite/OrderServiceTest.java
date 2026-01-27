package com.caterpie.BarWebsite;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.lang.reflect.Method;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.socket.WebSocketSession;

import com.caterpie.BarWebsite.model.User;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.repository.OrderRepository;
import com.caterpie.BarWebsite.service.ItemService;
import com.caterpie.BarWebsite.service.OrderService;


/**
 * Unit tests for the {@link OrderService} class.
 * <p>
 * This class contains tests for various functionalities of the OrderService,
 * including order acceptance and cost calculation, using mocked dependencies.
 * </p>
 */
class OrderServiceTest {

    private User mockUser;
    private WebSocketSession mockSession;

    @Mock
    private ItemService itemService;
    
    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private WebSocketSession session;

    @InjectMocks
    private OrderService orderService;

    /**
     * Sets up the test environment before each test case.
     * <p>
     * This method initializes the mocks and creates a new instance of the OrderService
     * before each test is executed.
     * </p>
     */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockUser = mock(User.class);
        mockSession = mock(WebSocketSession.class);
    }

    /**
     * Tests the acceptOrder method of the OrderService class with an invalid packet.
     * <p>
     * This test verifies that no order is saved and no message is sent
     * when an invalid packet is provided to the acceptOrder method.
     * </p>
     * 
     * @throws IOException if an I/O error occurs
     */
    @Test
    void testAcceptOrder_InvalidPacket() throws IOException {
        // Arrange
        String invalidPacket = "accept";

        // Act
        orderService.acceptOrder(session, invalidPacket);

        // Assert
        verify(orderRepository, never()).save(any());
        verify(session, never()).sendMessage(any());
    }

    //#######################################################

    /**
     * Tests the calculateCost method of the OrderService class for a successful calculation.
     * <p>
     * This test verifies that the correct total cost is calculated when valid items
     * and quantities are provided.
     * </p>
     * 
     * @throws Exception if an error occurs during method invocation
     */
    @Test
    void testCalculateCost_Success() throws Exception {
        // Arrange
        String items = "ItemA/ItemB";
        String amounts = "2/3";
        long merchantId = 123L;

        // Mock itemService responses
        when(itemService.findItemCost("ItemA", merchantId)).thenReturn(5.0f);
        when(itemService.findItemCost("ItemB", merchantId)).thenReturn(10.0f);

        // Use reflection to access the private method
        Method method = OrderService.class.getDeclaredMethod("calculateCost", String.class, String.class, long.class);
        method.setAccessible(true);

        // Act
        float result = (float) method.invoke(orderService, items, amounts, merchantId);

        // Assert
        assertEquals(40.0f, result);  // (5 * 2) + (10 * 3) = 40.0
    }

    /**
     * Tests the calculateCost method of the OrderService class with invalid quantities.
     * <p>
     * This test verifies that the cost calculation ignores invalid quantities
     * and returns the correct total based on valid quantities.
     * </p>
     * 
     * @throws Exception if an error occurs during method invocation
     */
    @Test
    void testCalculateCost_WithInvalidQuantity() throws Exception {
        // Arrange
        String items = "ItemA/ItemB";
        String amounts = "2/invalid";
        long merchantId = 123L;

        // Mock itemService responses
        when(itemService.findItemCost("ItemA", merchantId)).thenReturn(5.0f);
        when(itemService.findItemCost("ItemB", merchantId)).thenReturn(10.0f);

        // Use reflection to access the private method
        Method method = OrderService.class.getDeclaredMethod("calculateCost", String.class, String.class, long.class);
        method.setAccessible(true);

        // Act
        float result = (float) method.invoke(orderService, items, amounts, merchantId);

        // Assert
        assertEquals(10.0f, result);  // Only the first item is valid (5 * 2)
    }

    /**
     * Tests the calculateCost method of the OrderService class when an exception occurs
     * in the ItemService.
     * <p>
     * This test verifies that the cost calculation processes only valid items
     * and returns the correct total when an exception is thrown for an item.
     * </p>
     * 
     * @throws Exception if an error occurs during method invocation
     */
    @Test
    void testCalculateCost_WithItemServiceException() throws Exception {
        // Arrange
        String items = "ItemA/ItemB";
        String amounts = "2/3";
        long merchantId = 123L;

        // Mock itemService responses to throw exception for ItemB
        when(itemService.findItemCost("ItemA", merchantId)).thenReturn(5.0f);
        when(itemService.findItemCost("ItemB", merchantId)).thenThrow(new RuntimeException("Item not found"));

        // Use reflection to access the private method
        Method method = OrderService.class.getDeclaredMethod("calculateCost", String.class, String.class, long.class);
        method.setAccessible(true);

        // Act
        float result = (float) method.invoke(orderService, items, amounts, merchantId);

        // Assert
        assertEquals(10.0f, result);  // Only the first item is processed (5 * 2)
    }

    //######################################################### 
}
