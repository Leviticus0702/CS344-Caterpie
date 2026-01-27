package com.caterpie.BarWebsite.service;

import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Inventory;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Admin;
import com.caterpie.BarWebsite.model.User;
import com.caterpie.BarWebsite.repository.CustomerRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;

import jakarta.transaction.Transactional;

import com.caterpie.BarWebsite.repository.InventoryRepository;
import com.caterpie.BarWebsite.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import com.caterpie.BarWebsite.config.WebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing system administration tasks, including viewing and deleting users.
 * <p>
 * This service handles operations related to customers and merchants, including retrieving all users
 * and deleting specific users from the system.
 * </p>
 */
@Service
public class SystemAdminService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private AdminRepository adminRepository;

    /**
     * Retrieves all customers from the repository.
     * 
     * @return A list of all customers.
     */
    public List<Customer> viewCustomers() {
        return customerRepository.findAll();
    }

    /**
     * Retrieves all merchants from the repository.
     * 
     * @return A list of all merchants.
     */
    public List<Merchant> viewMerchants() {
        return merchantRepository.findAll();
    }

    /**
     * Retrieves admin from the repository.
     * 
     * @return admin.
     */
    public Admin getMyAdmin(String email) {
        return adminRepository.findByEmail(email);
    }

    /**
     * Deletes a user (customer or merchant) by username.
     * <p>
     * Checks if the user exists in either the customer or merchant repositories. If found, deletes the user
     * from the respective repository and returns a success message. If not found, returns a not found message.
     * </p>
     * 
     * @param username The username of the user to be deleted.
     * @return A message indicating the result of the deletion operation.
     */
    public String deleteUser(String email) {
        // Check and delete from CustomerRepository
        Customer customer = customerRepository.findByUsername(email);
        if (customer != null) {
            customerRepository.delete(customer);
            return "Customer " + email + " deleted.";
        }

        // Check and delete from MerchantRepository
        Merchant merchant = merchantRepository.findByUsername(email);
        if (merchant != null) {
            merchantRepository.delete(merchant);
            return "Merchant " + email + " deleted.";
        }

        // If not found in either repository
        return "User " + email + " not found.";
    }

    public List<Inventory> viewInventory(WebSocketSession session) throws IOException {

        User user = WebSocketHandler.getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Admin sysAdmin = adminRepository.findByEmail(sysAdminEmail);
        List<Inventory> inventory = inventoryRepository.findByMerchant(sysAdmin.getMerchant());
        return inventory;

    }

    public List<Inventory> viewStdInventory(String email) throws IOException {
        
        Admin sysAdmin = adminRepository.findByEmail(email);
        List<Inventory> inventory = inventoryRepository.findByMerchant(sysAdmin.getMerchant());
        return inventory;
        
    }

    /**
     * Saves or updates an admin in the repository.
     *
     * @param admin the {@link Admin} item to be saved or updated
     */
    @Transactional
    public void saveAdmin(Admin admin) {
        adminRepository.save(admin);
    }

}
