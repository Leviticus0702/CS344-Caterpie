package com.caterpie.BarWebsite.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Represents a customer entity.
 */
@Entity
@Table(name = "Customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;
    private float balance;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Default constructor.
     */
    public Customer() {}

    /**
     * Parameterized constructor.
     *
     * @param username the username of the customer
     * @param password the password of the customer
     */
    public Customer(String username, String password, String email) {
        this.username = username;
        this.password = hashPassword(password); 
        this.email = email;
        this.balance = 0;
    }

    /**
     * Gets the ID of the customer.
     *
     * @return the ID of the customer
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the customer.
     *
     * @param id the new ID of the customer
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the username of the customer.
     *
     * @return the username of the customer
     */
    public String getUsername() {
        return username;
    }

    /**
     * Gets the email of the customer.
     *
     * @return the email of the customer
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the username of the customer.
     *
     * @param username the new username of the customer
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Sets the username of the customer.
     *
     * @param email the new username of the customer
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the password of the customer.
     *
     * @return the password of the customer
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the customer.
     *
     * @param password the new password of the customer
     */
    public void setPassword(String password) {
        this.password = hashPassword(password);
    }

    /**
     * Hashes the password using BCrypt.
     *
     * @param password the raw password
     * @return the hashed password
     */
    private String hashPassword(String password) {
        return passwordEncoder.encode(password);  // Hash and salt the password
    }

    /**
     * Verifies if a given raw password matches the stored hashed password.
     *
     * @param rawPassword the raw password to verify
     * @return true if the password matches, false otherwise
     */
    public boolean checkPassword(String rawPassword) {
        return passwordEncoder.matches(rawPassword, this.password);  // Compare the raw password with the hashed password
    }

    public float getBalance() {
        return this.balance;
    }

    public void setBalance(float balance) {
        if (balance >= 0) {
            this.balance = balance;
        } else {
            throw new IllegalArgumentException("Balance cannot be negative.");
        }
    }

    public boolean add(float amount) {
        if (amount >= 0.0) {
            this.balance += amount;
            return true;
        }
        return false;
    }

    public boolean sub(float amount) {
        if (amount >= 0.0 && (this.balance >= amount)) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
    /**
     * Returns a string representation of the customer.
     *
     * @return a string representation of the customer
     */
    @Override
    public String toString() {
        return "Customer{" +
               "id=" + id +
               ", username='" + username + '\'' +
               '}';
    }


}
