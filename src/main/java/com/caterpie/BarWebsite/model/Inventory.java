package com.caterpie.BarWebsite.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

/**
 * Represents an inventory entity.
 */
@Entity
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @Column(name = "merchant_name")
    private String merchantName;

    @Column(name = "drink_name")
    private String drinkName;

    @Column(name = "quantity")
    private int quantity;

    /**
     * Gets the name of the drink.
     *
     * @return the name of the drink
     */
    public String getDrinkName() {
        return drinkName;
    }

    /**
     * Gets the quantity of the drink in inventory.
     *
     * @return the quantity of the drink
     */
    public int getQuantity() {
        return quantity;
    }

    /**
     * Gets the name of the merchant.
     *
     * @return the name of the merchant
     */
    public String getMerchantName() {
        return merchantName;
    }

    /**
     * Sets the quantity of the drink in inventory.
     *
     * @param quantity the new quantity of the drink
     */
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    /**
     * Sets the name of the drink.
     *
     * @param drinkName the new name of the drink
     */
    public void setDrinkName(String drinkName) {
        this.drinkName = drinkName;
    }

    /**
     * Sets the name of the merchant.
     *
     * @param merchantName the new name of the merchant
     */
    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    /**
     * Sets the merchant.
     *
     * @param merchant the new merchant
     */
    public void setMerchant(Merchant merchant) {
        this.merchant = merchant;
    }

    /**
     * Gets the id of the drink in inventory.
     *
     * @return the id of the drink
     */
    public long getId() {
        return this.id;
    }

    @Override
    public String toString() {
        return "Inventory{" +
                "id=" + id +
                ", merchant=" + merchant.getId() +
                ", merchantName='" + merchantName + '\'' +
                ", drinkName='" + drinkName + '\'' +
                ", quantity=" + quantity +
                '}';
    }
    
}
