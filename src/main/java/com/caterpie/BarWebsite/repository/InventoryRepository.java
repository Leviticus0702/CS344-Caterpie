package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Inventory;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Order;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository interface for {@link Inventory} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    /**
     * Finds a list of {@link Inventory} items by the merchant's ID.
     *
     * @param merchantId the ID of the merchant
     * @return a list of {@link Inventory} items associated with the specified merchant ID
     */
    List<Inventory> findByMerchantId(Long merchantId);

    /**
     * Finds an {@link Order} by its merchantId.
     *
     * @param merchantId the merchantId
     * @return the {@link Inventory} with the specified merchantId, or {@code null} if no Inventory is found
     */
    List<Inventory> findByMerchant(Merchant merchantid);

    @Modifying
    @Query("DELETE FROM Inventory i WHERE i.id = :id AND i.merchant.id = :merchantId")
    void deleteInventoryByIdAndMerchantId(@Param("id") Long id, @Param("merchantId") Long merchantId);

}
