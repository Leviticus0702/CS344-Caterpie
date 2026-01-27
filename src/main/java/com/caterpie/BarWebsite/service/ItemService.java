package com.caterpie.BarWebsite.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caterpie.BarWebsite.model.Item;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Special;
import com.caterpie.BarWebsite.repository.ItemRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.repository.SpecialsRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Service class for managing item and merchant operations.
 * Provides methods for interacting with item and merchant repositories.
 */
@Service
public class ItemService {

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private SpecialsRepository specialsRepository;


    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Retrieves all merchants along with their items.
     *
     * @return a list of {@link Merchant} entities with their associated {@link Item} entities
     */
    public List<Merchant> getAllMerchantsWithItems() {
        List<Merchant> merchants = merchantRepository.findAll();
        for (Merchant merchant : merchants) {
            List<Item> items = itemRepository.findByMerchantId(merchant.getId());
            merchant.setItems(items);
        }
        return merchants;
    }

    public float findItemCost(String itemName, long merchantId) {

        List<Item> items = itemRepository.findByItemName(itemName);
        for (Item it : items) {
            
            if (it.getMerchant().getId() == merchantId) {
                return it.getCost();
            }

        }

        return 0;
    }

    /**
     * Retrieves all items associated with a given merchant ID.
     *
     * @param merchantId the ID of the merchant
     * @return a list of {@link Item} entities associated with the merchant
     */
    public List<Item> getItemsByMerchantId(Long merchantId) {
        return itemRepository.findByMerchantId(merchantId);
    }

    public Item findItemByIdAndMerchantId(Long itemId, Long merchantId) {
        return itemRepository.findById(itemId)
                .filter(item -> item.getMerchant().getId().equals(merchantId))
                .orElse(null);
    }

    /**
     * Adds a new item for a specified merchant.
     *
     * @param merchantUsername the username of the merchant to whom the item belongs
     * @param itemName         the name of the item to be added
     * @param cost             the cost of the item to be added
     * @param image            the image of the item to be added
     * @return a confirmation message indicating the result of the operation
     */
    @Transactional
    public String newItem(String merchantUsername, String itemName, float cost, String image) {
        Merchant merchant = merchantRepository.findByUsername(merchantUsername);
        if (merchant == null) {
            return "Merchant not found";
        }

        Item item = new Item();
        item.setMerchant(merchant);
        item.setItemName(itemName);
        item.setCost(cost);
        item.setImage(image);

        itemRepository.save(item);
        return "Item added successfully";
    }

    @Transactional
    public String newSpecial(String merchantUsername, String[] parts) {
        // <"createSpecial">,<Items>,<"-","%">,<value>,<duration>,<"once","recurring">

        Merchant merchant = merchantRepository.findByEmail(merchantUsername);
        if (merchant == null) {
            return "Merchant not found";
        }

        float value = 0;
        try {
            value = Float.parseFloat(parts[3]);
        } catch (Exception e) {
            value = 1;
        }

        Special special = new Special();
        special.setMerchant(merchant);
        special.setItems(parts[1]);
        special.setType(parts[2]);
        special.setValue(value);
        special.setDuration(parts[4]);
        special.setFrequency(parts[5]);
        specialsRepository.save(special);

        return "Special added successfully";

    }

    @Transactional
    public String editSpecial(String merchantUsername, String[] parts) {
        // <"editSpecial">,<Items>,<"-","%">,<value>,<duration>,<"once","recurring">

        Merchant merchant = merchantRepository.findByEmail(merchantUsername);
        if (merchant == null) {
            return "Merchant not found";
        }

        float value = 0;
        try {
            value = Float.parseFloat(parts[3]);
        } catch (Exception e) {
            value = 1;
        }

        List<Special> specials = specialsRepository.findByMerchantId(merchant.getId());

        for (Special special : specials) {

            if (Objects.equals(special.getItems(), parts[1])) {

                special.setType(parts[2]);
                special.setValue(value);
                special.setDuration(parts[4]);
                special.setFrequency(parts[5]);
                specialsRepository.save(special);

                return "Special added successfully";

            }

        }

        return "Special not found!";

    }

    public String getSpecialsByMerchantId(Long merchantId) {

        List<Special> specials = specialsRepository.findByMerchantId(merchantId);
        List<Item> items = itemRepository.findByMerchantId(merchantId);
        StringBuilder response = new StringBuilder("Specials for Merchant: ").append("\n");

        for (Special special : specials) {
            
            for (Item item : items) {
            
                if (Objects.equals(item.getItemName(), special.getItems())) {

                    response.append("Item Name: ").append(item.getItemName())
                    .append(", Cost: ").append(item.getCost());

                    if ("%".equals(special.getType())) {
                        float cost = item.getCost() - (item.getCost() * (special.getValue()/100));
                        response.append(", NewCost: ").append(String.format("%.2f", cost))
                        .append(", Discount: ").append(special.getValue());
                    } else {
                        float cost = item.getCost() - (special.getValue());
                        response.append(", NewCost: ").append(cost)
                        .append(", Discount: ").append(special.getValue());
                    }

                    response.append(", Type: ").append(special.getType())
                    .append(", frequency: ").append(special.getFrequency())
                    .append(", Duration: ").append(special.getDuration())
                    .append("\n");

                }
            }

        }

        return response.toString();

    }

    /**
     * Retrieves an item based on the merchant's name and item name.
     *
     * @param merchantName the name of the merchant
     * @param itemName     the name of the item
     * @return the {@link Item} entity matching the specified merchant and item names, or {@code null} if not found
     */

    /**
     * Saves or updates an item in the repository.
     *
     * @param item the {@link Item} entity to be saved or updated
     */
    @Transactional
    public void saveItem(Item item) {
        itemRepository.save(item);
    }

    @Transactional
    public void deleteItemByIdAndMerchant(Long itemId, Long merchantId) {
        itemRepository.deleteItemByIdAndMerchantId(itemId, merchantId);
    }

    @Transactional
    public void deleteSpecial(String merchantUsername, String item) {

        Merchant merchant = merchantRepository.findByEmail(merchantUsername);

        List<Special> specials = specialsRepository.findByMerchantId(merchant.getId());

        for (Special special : specials) {

            if (Objects.equals(special.getItems(), item)) {

                specialsRepository.deleteSpecialByIdAndMerchantId(special.getId(), merchant.getId());

            }

        }
        
    }

}
