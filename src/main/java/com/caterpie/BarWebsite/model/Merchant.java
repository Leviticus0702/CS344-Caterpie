package com.caterpie.BarWebsite.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Represents a merchant entity.
 */
@Entity
@Table(name = "Merchants")
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;

    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Inventory> inventories;

    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Item> items;

    @OneToMany(mappedBy = "merchant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Admin> admins;

    /**
     * Default constructor.
     */
    public Merchant() {}

    /**
     * Parameterized constructor.
     *
     * @param username the username of the merchant
     * @param password the password of the merchant
     * @param email    the email of the merchant
     */
    public Merchant(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    /**
     * Gets the ID of the merchant.
     *
     * @return the ID of the merchant
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the merchant.
     *
     * @param id the new ID of the merchant
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the username of the merchant.
     *
     * @return the username of the merchant
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username of the merchant.
     *
     * @param username the new username of the merchant
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Gets the password of the merchant.
     *
     * @return the password of the merchant
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the merchant.
     *
     * @param password the new password of the merchant
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets the email of the merchant.
     *
     * @return the email of the merchant
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email of the merchant.
     *
     * @param email the new email of the merchant
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the inventories of the merchant.
     *
     * @return the inventories of the merchant
     */
    public List<Inventory> getInventories() {
        return inventories;
    }

    /**
     * Sets the inventories of the merchant.
     *
     * @param inventories the new inventories of the merchant
     */
    public void setInventories(List<Inventory> inventories) {
        this.inventories = inventories;
    }

    /**
     * Gets the items of the merchant.
     *
     * @return the items of the merchant
     */
    public List<Item> getItems() {
        return items;
    }

    /**
     * Sets the items of the merchant.
     *
     * @param items the new items of the merchant
     */
    public void setItems(List<Item> items) {
        this.items = items;
    }

    // Getter and setter for admins
    public List<Admin> getAdmins() {
        return admins;
    }

    public void setAdmins(List<Admin> admins) {
        this.admins = admins;
    }

    /**
     * Returns a string representation of the merchant.
     *
     * @return a string representation of the merchant
     */
    @Override
    public String toString() {
        return "Merchant{" +
               "id=" + id +
               ", username='" + username + '\'' +
               '}';
    }
}