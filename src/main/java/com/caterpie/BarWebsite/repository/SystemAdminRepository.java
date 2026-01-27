package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.SystemAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for {@link SystemAdmin} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {

    /**
     * Finds a {@link SystemAdmin} by their username.
     *
     * @param username the username of the system admin
     * @return the {@link SystemAdmin} with the specified username, or {@code null} if no system admin is found
     */
    SystemAdmin findByUsername(String username);

    /**
     * Finds a {@link SystemAdmin} by their email.
     *
     * @param email the email of the system admin
     * @return the {@link SystemAdmin} with the specified email, or {@code null} if no system admin is found
     */
    SystemAdmin findByEmail(String email);
}
