package com.caterpie.BarWebsite.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents an order entity in the system.
 * <p>
 * This class is a JPA entity that maps to the "orders" table in the database.
 * It contains various attributes related to an order, such as the order number,
 * status, customer, order details, date, cost, and associated merchant.
 * </p>
 */
@Entity
@Table(name = "orders")
public class Order {

    /**
     * The unique identifier for the order.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The unique order number for identifying the order.
     */
    @Column(name = "OrderNum")
    private String orderNum;

    /**
     * The unique otp for identifying the order.
     */
    @Column(name = "otp")
    private String otp;

    /**
     * The status of the order (e.g., Incoming, Processed, Shipped, etc.).
     */
    @Column(name = "status")
    private String status;

    /**
     * The customer who placed the order.
     */
    @ManyToOne
    @JoinColumn(name = "CustomerID", nullable = false)
    private Customer customerId;

    /**
     * The detailed information about the order items.
     */
    @Column(name = "OrderDetails")
    private String orderDetails;

    /**
     * The detailed information about the order items.
     */
    @Column(name = "Order_Quantities")
    private String orderquantities;

    /**
     * The date and time when the order was placed.
     */
    @Column(name = "Date")
    private LocalDateTime date;

    /**
     * The total cost of the order.
     */
    @Column(name = "Cost")
    private float cost;

    /**
     * Special instructions.
     */
    @Column(name = "Special_Instructions")
    private String instructions;

    /**
     * Order receipt
     */
    @Column(name = "Receipt")
    private String receipt;

    /**
     * Order rating
     */
    @Column(name = "Rating")
    private int rating;

    /**
     * The merchant associated with this order.
     */
    @ManyToOne
    @JoinColumn(name = "MerchantID", nullable = false)
    private Merchant merchantId;

    // Getters and Setters

    /**
     * Gets the unique identifier for the order.
     * 
     * @return the unique identifier for the order
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier for the order.
     * 
     * @param id the unique identifier for the order
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the otp.
     * 
     * @return the otp
     */
    public String getotp() {
        return otp;
    }

    /**
     * Sets the otp.
     * 
     * @param otp the otp.
     */
    public void setOtp(String otp) {
        this.otp = otp;
    }

    /**
     * Gets the order number.
     * 
     * @return the order number
     */
    public String getOrderNum() {
        return orderNum;
    }

    /**
     * Sets the order number.
     * 
     * @param orderNum the order number
     */
    public void setOrderNum(String orderNum) {
        this.orderNum = orderNum;
    }

    /**
     * Gets the status of the order.
     * 
     * @return the status of the order
     */
    public String getstatus() {
        return status;
    }

    /**
     * Sets the status of the order.
     * 
     * @param status the status of the order
     */
    public void setstatus(String status) {
        this.status = status;
    }

    /**
     * Gets the customer who placed the order.
     * 
     * @return the customer who placed the order
     */
    public Customer getCustomerId() {
        return customerId;
    }

    /**
     * Sets the customer who placed the order.
     * 
     * @param customerId the customer who placed the order
     */
    public void setCustomerId(Customer customerId) {
        this.customerId = customerId;
    }

    /**
     * Gets the order details.
     * 
     * @return the order details
     */
    public String getOrder() {
        return orderDetails;
    }

    /**
     * Sets the order quantities.
     * 
     * @param orderquantities the order quantities
     */
    public void setOrderQuantities(String orderquantities) {
        this.orderquantities = orderquantities;
    }

    /**
     * Gets the order quantities
     * 
     * @return the order quantities
     */
    public String getOrderQuantities() {
        return orderquantities;
    }

    /**
     * Sets the order details.
     * 
     * @param orderDetails the order details
     */
    public void setOrder(String orderDetails) {
        this.orderDetails = orderDetails;
    }


    /**
     * Gets the date and time when the order was placed.
     * 
     * @return the date and time when the order was placed
     */
    public LocalDateTime getDate() {
        return date;
    }

    /**
     * Sets the date and time when the order was placed.
     * 
     * @param date the date and time when the order was placed
     */
    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    /**
     * Gets the total cost of the order.
     * 
     * @return the total cost of the order
     */
    public float getCost() {
        return cost;
    }

    /**
     * Sets the total cost of the order.
     * 
     * @param cost the total cost of the order
     */
    public void setCost(Float cost) {
        this.cost = cost;
    }

    /**
     * Gets the merchant associated with the order.
     * 
     * @return the merchant associated with the order
     */
    public Merchant getMerchantId() {
        return merchantId;
    }

    /**
     * Sets the merchant associated with the order.
     * 
     * @param merchantId the merchant associated with the order
     */
    public void setMerchantId(Merchant merchantId) {
        this.merchantId = merchantId;
    }

    /**
     * Gets the instructions associated with the order.
     * 
     * @return the instructions associated with the order
     */
    public String getInstructions() {
        return instructions;
    }

    /**
     * Sets the instructions associated with the order.
     * 
     * @param instructions the instructions associated with the order
     */
    public void setInstructions(String instructions) {
        if (instructions != null) {
            this.instructions = instructions;
        }
    }

        /**
     * Gets the receipt associated with the order.
     * 
     * @return the receipt associated with the order
     */
    public String getReceipt() {
        return receipt;
    }

    /**
     * Sets the receipt associated with the order.
     * 
     * @param receipt the receipt associated with the order
     */
    public void setReceipt(String receipt) {
        if (receipt != null) {
            this.receipt = receipt;
        }
    }

    public void setRating(int stars) {
        if (stars >= 0) {
            this.rating = stars;
        } else {
            throw new IllegalArgumentException("Rating cannot be negative.");
        }
    }

    public int getRating() {
        return this.rating;
    }

    /**
     * Returns a string representation of the order.
     * 
     * @return a string representation of the order
     */
    @Override
    public String toString() {
        return "Order{" +
               "id=" + id +
               ", orderNum='" + orderNum + '\'' +
               ", order='" + orderDetails + '\'' +
               ", date=" + date +
               ", cost=" + cost +
               '}';
    }
}
