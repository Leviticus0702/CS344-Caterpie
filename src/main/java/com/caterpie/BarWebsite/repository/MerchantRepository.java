package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Merchant;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for {@link Merchant} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface MerchantRepository extends JpaRepository<Merchant, Long> {

    /**
     * Finds a {@link Merchant} by their username.
     *
     * @param username the username of the merchant
     * @return the {@link Merchant} with the specified username, or {@code null} if no merchant is found
     */
    Merchant findByEmail(String email);

    /**
     * Finds a {@link Merchant} by their username.
     *
     * @param username the username of the merchant
     * @return the {@link Merchant} with the specified username, or {@code null} if no merchant is found
     */
    Merchant findByUsername(String username);

    /**
     * Finds a {@link Merchant} by their id.
     *
     * @param id the id of the merchant
     * @return the {@link Merchant} with the specified id, or {@code null} if no merchant is found
     */
    Merchant findByid(Long id);

}
