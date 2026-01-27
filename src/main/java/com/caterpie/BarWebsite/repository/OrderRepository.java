package com.caterpie.BarWebsite.repository;

import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for {@link Order} entities.
 * Provides methods for performing CRUD operations and custom queries.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {


    /**
     * Finds an {@link Order} by its order otp.
     *
     * @param orderOTP the order otp
     * @return the {@link Order} with the specified order otp, or {@code null} if no order is found
     */
    List<Order> findByotp(String orderOTP);

    /**
     * Finds an {@link Order} by its ID.
     *
     * @param id the order id
     * @return the {@link Order} with the specified id, or {@code null} if no order is found
     */
    Order findOrderById(Long id);


    /**
     * Finds an {@link Order} by its order number.
     *
     * @param orderNum the order number
     * @return the {@link Order} with the specified order number, or {@code null} if no order is found
     */
    List<Order> findByOrderNum(String orderNum);

    /**
     * Finds an {@link Order} by its status.
     *
     * @param status the status
     * @return the {@link Order} with the specified status, or {@code null} if no order is found
     */
    List<Order> findByStatus(String status);

    /**
     * Finds an {@link Order} by its merchantId.
     *
     * @param merchantId the merchantId
     * @return the {@link Order} with the specified merchantId, or {@code null} if no order is found
     */
    List<Order> findByMerchantId(Merchant merchantid);

        /**
     * Finds orders by customer.
     *
     * @param customer the customer
     * @return a list of {@link Order} for the specified customer
     */
    List<Order> findByCustomerId(Customer customer);

}