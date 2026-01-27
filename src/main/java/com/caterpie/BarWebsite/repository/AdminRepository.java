package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Admin;
import com.caterpie.BarWebsite.model.Merchant;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for {@link Admin} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface AdminRepository extends JpaRepository<Admin, Long> {

    /**
     * Finds an {@link Admin} by their username.
     *
     * @param username the username of the admin
     * @return the {@link Admin} with the specified username, or {@code null} if no admin is found
     */
    Admin findByUsername(String username);

    /**
     * Finds an {@link Admin} by their email.
     *
     * @param email the email of the admin
     * @return the {@link Admin} with the specified email, or {@code null} if no admin is found
     */
    Admin findByEmail(String email);

    List<Admin> findByMerchant(Merchant merchant);


}
