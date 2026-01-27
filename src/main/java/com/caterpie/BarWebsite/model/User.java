package com.caterpie.BarWebsite.model;

import org.springframework.web.socket.WebSocketSession;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


/**
 * Entity representing a user connected to the bar ordering system.
 */
@Entity
@Table(name = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;
    public boolean isMerchant = false;
    public boolean isSystemAdmin = false;
    public boolean isAdmin = false;

    private transient WebSocketSession session;

    /**
     * Default constructor.
     */
    public User() {}

    /**
     * Parameterized constructor.
     *
     * @param username the username of the user
     * @param password the password of the user
     * @param isMerchant flag indicating if the user is a merchant
     * @param isSystemAdmin flag indicating if the user is an 
     * @param session the WebSocket session associated with the user
     */
    public User(String username, String password, boolean isMerchant, boolean isSystemAdmin, boolean isAdmin, WebSocketSession session, String email) {
        this.username = username;
        this.password = password;
        this.isMerchant = isMerchant;
        this.isSystemAdmin = isSystemAdmin;
        this.session = session;
        this.email = email;
        this.isAdmin = isAdmin;
    }


    // Constructor for creating new User
    public User(String username, String password, boolean isMerchant, boolean isSystemAdmin, boolean isAdmin) {
        this.username = username;
        this.password = password;
        this.isMerchant = isMerchant;
        this.isSystemAdmin = isSystemAdmin;
        this.isAdmin = isAdmin;
    }

    /**
     * Gets the ID of the user.
     *
     * @return the ID of the user
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the user.
     *
     * @param id the ID of the user
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the username of the user.
     *
     * @return the username of the user
     */
    public String getUsername() {
        return username;
    }

    /**
     * Gets the email of the user.
     *
     * @return the email of the user
     */
    public String getEmail() {
        return email;
    }
    /**
     * Sets the username of the user.
     *
     * @param username the username of the user
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Sets the email of the user.
     *
     * @param email the email of the user
     */
    public void setEmail(String email) {
        this.email = email;
    }
    /**
     * Gets the password of the user.
     *
     * @return the password of the user
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the user.
     *
     * @param password the password of the user
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets the WebSocket session associated with the user.
     *
     * @return the WebSocket session
     */
    public WebSocketSession getSession() {
        return session;
    }

    /**
     * Sets the WebSocket session associated with the user.
     *
     * @param session the WebSocket session
     */
    public void setSession(WebSocketSession session) {
        this.session = session;
    }

    /**
     * Checks if the user is a merchant.
     *
     * @return true if the user is a merchant, false otherwise
     */
    public boolean isMerchant() {
        return isMerchant;
    }

    public boolean isSystemAdmin() {
        return isSystemAdmin;
    }

    public boolean isAdmin() {
        return isAdmin;
    }
}
