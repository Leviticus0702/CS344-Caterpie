package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Special;
import com.caterpie.BarWebsite.model.Merchant;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository interface for {@link Special} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface SpecialsRepository extends JpaRepository<Special, Long> {

    /**
     * Finds an {@link Special} by its ID.
     *
     * @param id the Special id
     * @return the {@link Special} with the specified id, or {@code null} if no Special is found
     */
    Special findSpecialById(Long id);

    /**
     * Finds an {@link Special} by its frequency.
     *
     * @param frequency the frequency
     * @return the {@link Special} with the specified frequency, or {@code null} if no Special is found
     */
    List<Special> findByFrequency(String frequency);

    /**
     * Finds an {@link Special} by its status.
     *
     * @param type the type
     * @return the {@link Special} with the specified status, or {@code null} if no Special is found
     */
    List<Special> findByType(String type);

    /**
     * Finds an {@link Special} by its merchantId.
     *
     * @param merchantId the merchantId
     * @return the {@link Special} with the specified merchantId, or {@code null} if no Special is found
     */
    List<Special> findByMerchantId(Long merchantId);

    @Modifying
    @Query("DELETE FROM Special i WHERE i.id = :id AND i.merchant.id = :merchantId")
    void deleteSpecialByIdAndMerchantId(@Param("id") Long id, @Param("merchantId") Long merchantId);

}