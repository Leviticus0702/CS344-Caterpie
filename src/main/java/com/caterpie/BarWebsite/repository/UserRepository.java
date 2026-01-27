package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository interface for accessing {@link User} entities.
 * <p>
 * This interface extends {@link JpaRepository} to provide CRUD operations and custom query methods for {@link User} entities.
 * </p>
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
