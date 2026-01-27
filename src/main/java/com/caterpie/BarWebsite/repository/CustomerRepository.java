package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for {@link Customer} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Finds a {@link Customer} by their username.
     *
     * @param username the username of the customer
     * @return the {@link Customer} with the specified username, or {@code null} if no customer is found
     */
    Customer findByUsername(String username);

    /**
     * Finds a {@link Customer} by their email.
     *
     * @param email the email of the customer
     * @return the {@link Customer} with the specified email, or {@code null} if no customer is found
     */
    Customer findByEmail(String email);

}
