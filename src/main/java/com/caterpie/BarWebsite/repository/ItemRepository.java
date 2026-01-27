package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Item;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository interface for {@link Item} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

    /**
     * Finds a list of {@link Item} entities by the merchant's ID.
     *
     * @param merchantId the ID of the merchant
     * @return a list of {@link Item} entities associated with the specified merchant ID
     */
    List<Item> findByMerchantId(Long merchantId);

    /**
     * Finds a list of {@link Item} entities by the merchant's ID.
     *
     * @param itemName the item
     * @return a list of {@link Item} entities associated with the specified merchant ID
     */
    List<Item> findByItemName(String itemName);

    @Modifying
    @Query("DELETE FROM Item i WHERE i.id = :id AND i.merchant.id = :merchantId")
    void deleteItemByIdAndMerchantId(@Param("id") Long id, @Param("merchantId") Long merchantId);

}

