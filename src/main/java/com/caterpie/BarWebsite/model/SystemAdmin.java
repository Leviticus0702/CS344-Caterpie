package com.caterpie.BarWebsite.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.web.socket.WebSocketSession;

/**
 * Represents a system administrator entity.
 */
@Entity
@Table(name = "System_Admins")
public class SystemAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;
    public boolean isSystemAdmin = false;
    private transient WebSocketSession session;

    /**
     * Default constructor.
     */
    public SystemAdmin() {}

    /**
     * Constructor with WebSocketSession.
     *
     * @param username the username of the system administrator
     * @param password the password of the system administrator
     * @param session the WebSocket session of the system administrator
     */
    public SystemAdmin(String username, String password, WebSocketSession session, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.isSystemAdmin = true;
        this.session = session;
    }

    /**
     * Parameterized constructor.
     *
     * @param username the username of the system administrator
     * @param password the password of the system administrator
     */
    public SystemAdmin(String username, String password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Gets the ID of the system administrator.
     *
     * @return the ID of the system administrator
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the system administrator.
     *
     * @param id the new ID of the system administrator
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the username of the system administrator.
     *
     * @return the username of the system administrator
     */
    public String getUsername() {
        return username;
    }

    /**
     * Gets the email of the system administrator.
     *
     * @return the email of the system administrator
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the username of the system administrator.
     *
     * @param username the new username of the system administrator
     */
    public void setUsername(String username) {
        this.username = username;
    }

     /**
     * Sets the email of the system administrator.
     *
     * @param email the new username of the system administrator
     */
    public void setEmail(String email) {
        this.username = email;
    }


    /**
     * Gets the password of the system administrator.
     *
     * @return the password of the system administrator
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the system administrator.
     *
     * @param password the new password of the system administrator
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets the WebSocket session of the system administrator.
     *
     * @return the WebSocket session of the system administrator
     */
    public WebSocketSession getSession() {
        return session;
    }

    /**
     * Sets the WebSocket session of the system administrator.
     *
     * @param session the new WebSocket session of the system administrator
     */
    public void setSession(WebSocketSession session) {
        this.session = session;
    }

    /**
     * Returns a string representation of the system administrator.
     *
     * @return a string representation of the system administrator
     */
    @Override
    public String toString() {
        return "System Admin{" +
               "id=" + id +
               ", username='" + username + '\'' +
               '}';
    }
}


