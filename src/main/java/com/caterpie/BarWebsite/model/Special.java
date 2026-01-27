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
 * Represents a special entity, typically used to store promotional offers
 * or deals related to a Merchant.
 */
@Entity
@Table(name = "specials")
public class Special {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "items")
    private String items;

    @Column(name = "type")
    private String type;

    @Column(name = "duration")
    private String duration;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "value")
    private float value;

    @ManyToOne
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    /**
     * Default constructor.
     * Initializes a new instance of the Special class.
     */
    public Special() {}

    /**
     * Parameterized constructor to initialize a Special instance with provided values.
     * 
     * @param items The items included in the special.
     * @param type The type of the special (e.g., discount, offer, etc.).
     * @param duration The duration for which the special is valid.
     * @param frequency How often the special is offered.
     * @param value The value or discount applied by the special.
     * @param merchant The merchant to whom the special is linked.
     */
    public Special(String items, String type, String duration, String frequency, float value, Merchant merchant) {
        this.items = items;
        this.type = type;
        this.duration = duration;
        this.frequency = frequency;
        this.value = value;
        this.merchant = merchant;
    }

    /**
     * Gets the ID of the special.
     * 
     * @return The unique identifier of the special.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the special.
     * 
     * @param id The unique identifier of the special.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the items included in the special.
     * 
     * @return The items as a string.
     */
    public String getItems() {
        return items;
    }

    /**
     * Sets the items for the special.
     * 
     * @param items The items to include in the special.
     */
    public void setItems(String items) {
        this.items = items;
    }

    /**
     * Gets the type of the special.
     * 
     * @return The type of the special (e.g., discount, offer).
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the type of the special.
     * 
     * @param type The type of the special (e.g., discount, offer).
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Gets the duration of the special.
     * 
     * @return The duration for which the special is valid.
     */
    public String getDuration() {
        return duration;
    }

    /**
     * Sets the duration of the special.
     * 
     * @param duration The duration for which the special is valid.
     */
    public void setDuration(String duration) {
        this.duration = duration;
    }

    /**
     * Gets the frequency of the special.
     * 
     * @return The frequency of the special.
     */
    public String getFrequency() {
        return frequency;
    }

    /**
     * Sets the frequency of the special.
     * 
     * @param frequency How often the special is offered (e.g., daily, weekly).
     */
    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    /**
     * Gets the value of the special.
     * 
     * @return The value or discount applied by the special.
     */
    public float getValue() {
        return value;
    }

    /**
     * Sets the value of the special.
     * 
     * @param value The value or discount applied by the special.
     */
    public void setValue(float value) {
        this.value = value;
    }

    /**
     * Gets the merchant associated with this special.
     * 
     * @return The merchant associated with the special.
     */
    public Merchant getMerchant() {
        return merchant;
    }

    /**
     * Sets the merchant associated with this special.
     * 
     * @param merchant The merchant associated with the special.
     */
    public void setMerchant(Merchant merchant) {
        this.merchant = merchant;
    }

    /**
     * Provides a string representation of the special, useful for debugging and logging.
     * 
     * @return A string representing the special entity.
     */
    @Override
    public String toString() {
        return "Special{" +
                "id=" + id +
                ", items='" + items + '\'' +
                ", type='" + type + '\'' +
                ", duration='" + duration + '\'' +
                ", frequency='" + frequency + '\'' +
                ", value=" + value +
                ", merchant=" + merchant +
                '}';
    }
}
