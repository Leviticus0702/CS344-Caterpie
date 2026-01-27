package com.caterpie.BarWebsite.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caterpie.BarWebsite.model.Inventory;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.repository.InventoryRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;

import jakarta.transaction.Transactional;

/**
 * Service class for managing inventory and merchant operations.
 * Provides methods for interacting with inventory and merchant repositories.
 */
@Service
public class InventoryService {

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    /**
     * Retrieves all merchants along with their inventory items.
     *
     * @return a list of {@link Merchant} entities with their associated {@link Inventory} items
     */
    public List<Merchant> getAllMerchantsWithInventory() {
        List<Merchant> merchants = merchantRepository.findAll();
        for (Merchant merchant : merchants) {
            List<Inventory> inventories = inventoryRepository.findByMerchantId(merchant.getId());
            merchant.setInventories(inventories);
        }
        return merchants;
    }

    /**
     * Adds a new inventory item for a specified merchant.
     *
     * @param merchantEmail    the username of the merchant to whom the inventory item belongs
     * @param drinkName        the name of the drink to be added
     * @param quantity         the quantity of the drink to be added
     * @return a confirmation message indicating the result of the operation
     */
    @Transactional
    public String newInventoryItem(String merchantEmail, String drinkName, int quantity) {
        Merchant merchant = merchantRepository.findByEmail(merchantEmail);
        if (merchant == null) {
            return "Merchant not found";
        }

        Inventory inventory = new Inventory();
        inventory.setMerchant(merchant);
        inventory.setDrinkName(drinkName);
        inventory.setQuantity(quantity);
        inventory.setMerchantName(merchant.getUsername());

        inventoryRepository.save(inventory);
        return "Inventory item added successfully";
    }

    /**
     * Retrieves an inventory item based on the merchant's name and drink name.
     *
     * @param merchantName the name of the merchant
     * @param drinkName    the name of the drink
     * @return the {@link Inventory} item matching the specified merchant and drink names, or {@code null} if not found
     */
    @Transactional
    public Inventory getInventory(String merchantName, String drinkName) {
        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory drink : inventories) {
            if (drink.getDrinkName().equals(drinkName) && drink.getMerchantName().equals(merchantName)) {
                return drink;
            }
        }
        return null;
    }

    /**
     * Saves or updates an inventory item in the repository.
     *
     * @param inventory the {@link Inventory} item to be saved or updated
     */
    @Transactional
    public void saveInventory(Inventory inventory) {
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void deleteInventoryByIdAndMerchant(Long itemId, Long merchantId) {
        inventoryRepository.deleteInventoryByIdAndMerchantId(itemId, merchantId);
    }

}
