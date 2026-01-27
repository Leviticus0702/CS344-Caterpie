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
 * Represents an item entity.
 */
@Entity
@Table(name = "items") 
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;

    @Column(name = "cost")
    private float cost;

    @Column(name = "image")
    private String image;

    @Column(name = "item")
    private String itemName;

    @ManyToOne
    @JoinColumn(name = "merchantid", nullable = false)
    private Merchant merchant;

    /**
     * Gets the ID of the item.
     *
     * @return the ID of the item
     */
    public Long getId() {
        return id;
    }

    /**
     * Gets the cost of the item.
     *
     * @return the cost of the item
     */
    public float getCost() {
        return cost;
    }

    /**
     * Gets the image of the item.
     *
     * @return the image of the item
     */
    public String getImage() {
        return image;
    }

    /**
     * Gets the name of the item.
     *
     * @return the name of the item
     */
    public String getItemName() {
        return itemName;
    }

    /**
     * Gets the merchant associated with the item.
     *
     * @return the merchant
     */
    public Merchant getMerchant() {
        return merchant;
    }

    /**
     * Sets the cost of the item.
     *
     * @param cost the new cost of the item
     */
    public void setCost(float cost) {
        this.cost = cost;
    }

    /**
     * Sets the image of the item.
     *
     * @param image the new image of the item
     */
    public void setImage(String image) {
        this.image = image;
    }

    /**
     * Sets the name of the item.
     *
     * @param itemName the new name of the item
     */
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    /**
     * Sets the merchant associated with the item.
     *
     * @param merchant the new merchant
     */
    public void setMerchant(Merchant merchant) {
        this.merchant = merchant;
    }
}

