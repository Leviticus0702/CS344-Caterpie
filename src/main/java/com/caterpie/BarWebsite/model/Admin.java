package com.caterpie.BarWebsite.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents an admin entity.
 */
@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @ManyToOne
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    /**
     * Default constructor.
     */
    public Admin() {}

    /**
     * Parameterized constructor.
     *
     * @param username the username of the admin
     * @param password the password of the admin
     * @param email    the email of the admin
     * @param merchant the merchant associated with the admin
     */
    public Admin(String username, String password, String email, Merchant merchant) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.merchant = merchant;
    }

    /**
     * Gets the ID of the admin.
     *
     * @return the ID of the admin
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the admin.
     *
     * @param id the new ID of the admin
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the username of the admin.
     *
     * @return the username of the admin
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username of the admin.
     *
     * @param username the new username of the admin
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Gets the password of the admin.
     *
     * @return the password of the admin
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the admin.
     *
     * @param password the new password of the admin
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets the email of the admin.
     *
     * @return the email of the admin
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email of the admin.
     *
     * @param email the new email of the admin
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the merchant associated with the admin.
     *
     * @return the merchant associated with the admin
     */
    public Merchant getMerchant() {
        return merchant;
    }

    /**
     * Sets the merchant associated with the admin.
     *
     * @param merchant the new merchant associated with the admin
     */
    public void setMerchant(Merchant merchant) {
        this.merchant = merchant;
    }

    @Override
    public String toString() {
        return "Admin{" +
               "id=" + id +
               ", username='" + username + '\'' +
               ", merchant=" + merchant.getUsername() +
               '}';
    }
}
