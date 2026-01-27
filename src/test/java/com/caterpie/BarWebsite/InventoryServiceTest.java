package com.caterpie.BarWebsite;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.caterpie.BarWebsite.model.Inventory;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.repository.InventoryRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.service.InventoryService;

/**
 * Unit tests for the {@link InventoryService} class.
 * <p>
 * This class contains tests for various functionalities of the InventoryService,
 * including adding new inventory items and retrieving inventory items, using mocked
 * dependencies for merchant and inventory repositories.
 * </p>
 */
public class InventoryServiceTest {

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService; // Replace this with the actual service class

    /**
     * Sets up the test environment before each test case.
     * <p>
     * This method initializes the mocks and creates a new instance of the InventoryService
     * before each test is executed.
     * </p>
     */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Tests the newInventoryItem method of the InventoryService class when a merchant is found.
     * <p>
     * This test verifies that an inventory item can be successfully added when the 
     * corresponding merchant is found in the repository.
     * </p>
     */
    @Test
    void testNewInventoryItem_MerchantFound() {
        // Arrange
        String merchantEmail = "merchant@example.com";
        String drinkName = "Coke";
        int quantity = 10;

        Merchant mockMerchant = new Merchant();
        mockMerchant.setEmail(merchantEmail);
        mockMerchant.setUsername("merchantUser");

        when(merchantRepository.findByEmail(merchantEmail)).thenReturn(mockMerchant);

        // Act
        String result = inventoryService.newInventoryItem(merchantEmail, drinkName, quantity);

        // Assert
        assertEquals("Inventory item added successfully", result);
        verify(inventoryRepository, times(1)).save(any(Inventory.class));
    }

    /**
     * Tests the newInventoryItem method of the InventoryService class when a merchant is not found.
     * <p>
     * This test verifies that an appropriate message is returned when the merchant 
     * corresponding to the provided email does not exist in the repository.
     * </p>
     */
    @Test
    void testNewInventoryItem_MerchantNotFound() {
        // Arrange
        String merchantEmail = "unknown@example.com";
        String drinkName = "Coke";
        int quantity = 10;

        when(merchantRepository.findByEmail(merchantEmail)).thenReturn(null);

        // Act
        String result = inventoryService.newInventoryItem(merchantEmail, drinkName, quantity);

        // Assert
        assertEquals("Merchant not found", result);
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    //#########################################

    /**
     * Tests the getInventory method of the InventoryService class when the inventory item is found.
     * <p>
     * This test verifies that the correct inventory item is returned when a matching
     * merchant name and drink name are provided.
     * </p>
     */
    @Test
    public void testGetInventory_ItemFound() {
        // Arrange
        String merchantName = "MerchantName";
        String drinkName = "Coke";

        // Create an inventory item to return
        Inventory inventoryItem = new Inventory();
        inventoryItem.setDrinkName(drinkName);
        inventoryItem.setMerchantName(merchantName);

        // Create a list of inventories and add the item
        List<Inventory> inventories = new ArrayList<>();
        inventories.add(inventoryItem);

        // Mock the repository method to return the inventories
        when(inventoryRepository.findAll()).thenReturn(inventories);

        // Act
        Inventory result = inventoryService.getInventory(merchantName, drinkName);

        // Assert
        assertNotNull(result); // Check that the result is not null
        assertEquals(drinkName, result.getDrinkName()); // Check that the drink name matches
        assertEquals(merchantName, result.getMerchantName()); // Check that the merchant name matches
    }

    /**
     * Tests the getInventory method of the InventoryService class when the inventory item is not found.
     * <p>
     * This test verifies that null is returned when a matching inventory item cannot be found
     * for the provided merchant name and drink name.
     * </p>
     */
    @Test
    public void testGetInventory_ItemNotFound() {
        // Arrange
        String merchantName = "MerchantName";
        String drinkName = "Sprite";

        // Create an inventory item with a different drink name
        Inventory inventoryItem = new Inventory();
        inventoryItem.setDrinkName("Coke");
        inventoryItem.setMerchantName(merchantName);

        // Create a list of inventories and add the item
        List<Inventory> inventories = new ArrayList<>();
        inventories.add(inventoryItem);

        // Mock the repository method to return the inventories
        when(inventoryRepository.findAll()).thenReturn(inventories);

        // Act
        Inventory result = inventoryService.getInventory(merchantName, drinkName);

        // Assert
        assertNull(result); // Expecting null since the item is not found
    }
}

