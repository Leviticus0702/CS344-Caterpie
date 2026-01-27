package com.caterpie.BarWebsite.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caterpie.BarWebsite.model.Admin;
import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Order;
import com.caterpie.BarWebsite.model.SystemAdmin;
import com.caterpie.BarWebsite.repository.AdminRepository;
import com.caterpie.BarWebsite.repository.CustomerRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.repository.SystemAdminRepository;

import jakarta.transaction.Transactional;

import com.caterpie.BarWebsite.repository.OrderRepository;


/**
 * Service class for managing user-related operations such as login validation and profile creation.
 * <p>
 * This service handles user authentication and profile management for customers, merchants, and system admins.
 * </p>
 */
@Service
public class UserService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private SystemAdminRepository systemAdminRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Validates user login credentials based on the user type.
     * <p>
     * Checks if the provided email and password match an existing user in the appropriate repository
     * (merchant, system admin, or customer).
     * </p>
     * @param email The email of the user.
     * @param password The password of the user.
     * @param isMerchant Indicates if the user is a merchant.
     * @param isSystemAdmin Indicates if the user is a system admin.
     * @return {@code true} if the credentials are valid, {@code false} otherwise.
     */
    public int validateLogin(String email, String password, boolean isMerchant, boolean isSystemAdmin, boolean isAdmin) {
        
        if (isAdmin) {
            Admin admin = adminRepository.findByEmail(email);
            if (admin != null) {
                if (admin.getPassword().equals(password)) {
                    return 1;
                } else {
                    return 2;
                }
            }

        } else if (isMerchant) {

            Merchant merchant = merchantRepository.findByEmail(email);
            if (merchant != null) {
                if (merchant.getPassword().equals(password)) {
                    return 1;// valid credential
                } else {
                    return 2;// invalid credentials
                }
            }
            
        } else if (isSystemAdmin) {
            SystemAdmin s = getSystemAdminFromEmail(email);
            if (s != null) {
                if (s.getPassword().equals(password)) {
                    return 1;// valid credential
                } else {
                    return 2;// invalid credentials
                }
            }
            return 3;// account does not exist
        } else {
            Customer customer = getCustomerFromEmail(email);
            if (customer != null) {
                if (customer.checkPassword(password)) {
                    return 1;// valid credential
                } else {
                    return 2;// invalid credentials
                }
            }
            return 3;// account does not exist
        }
        
        return 3;
    }

    /**
     * Creates a new user profile based on the user type.
     * <p>
     * Checks if a user with the provided email already exists in the appropriate repository
     * (merchant, system admin, or customer). If not, creates a new profile and saves it.
     * </p>
     * 
     * @param username The username of the new user.
     * @param email The customer's unique email.
     * @param password The password of the new user.
     * @param password The email of the new user.
     * @param isMerchant Indicates if the new user is a merchant.
     * @param isSystemAdmin Indicates if the new user is a system admin.
     * @return {@code true} if the profile was created successfully, {@code false} otherwise.
     */
    public boolean createProfile(String username, String password, String email, boolean isMerchant, boolean isSystemAdmin) {
        if (isMerchant) {
            if (getMerchantFromEmail(email) == null) {
                Merchant newMerchant = new Merchant();
                newMerchant.setUsername(username);
                newMerchant.setPassword(password);
                newMerchant.setEmail(email);
                merchantRepository.save(newMerchant);
                return true;
            }
        } else if (isSystemAdmin) {
            if (getSystemAdminFromEmail(email) == null) {
                SystemAdmin sysAdmin = new SystemAdmin();
                sysAdmin.setUsername(username);
                sysAdmin.setPassword(password);
                sysAdmin.setEmail(email);
                systemAdminRepository.save(sysAdmin);
                return true;
            } else {
                return false;
            }
        } else {
            if (getCustomerFromEmail(email) == null) {
                Customer newCustomer = new Customer();
                newCustomer.setUsername(username);
                newCustomer.setPassword(password);
                newCustomer.setEmail(email);
                customerRepository.save(newCustomer);
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public boolean createAdminProfile(String username, String password, String email, boolean isAdmin, Merchant merchant) {

        if (isAdmin) {
            if (getAdminFromEmail(email) == null) {
                Admin newAdmin = new Admin();
                newAdmin.setUsername(username);
                newAdmin.setPassword(password);
                newAdmin.setEmail(email);
                newAdmin.setMerchant(merchant);
                adminRepository.save(newAdmin);
                return true; 
            }

        }
        return false;
    }

    public List<Admin> getAdminsByMerchant(Merchant merchant) {
        return adminRepository.findByMerchant(merchant);
    }   

    /**
     * Returns a Customer with the given email.
     * @param email the email to search for
     * @return the Customer with the given email
     */
    public Customer getCustomerFromEmail(String email) {
        List<Customer> customers = customerRepository.findAll();
        for (Customer c : customers) {
            if (c.getEmail().equals(email)) {
                return c;
            }
        }
        return null;
    }

    /**
     * Returns a System Admin with the given email.
     * @param email the email to search for
     * @return the System Admin with the given email
     */
    public SystemAdmin getSystemAdminFromEmail(String email) {
        List<SystemAdmin> sysAdmins = systemAdminRepository.findAll();
        for ( SystemAdmin s : sysAdmins) {
            if (s.getEmail().equals(email)) {
                return s;
            }
        }
        return null;
    }

    /**
     * Returns a Merchant with the given email.
     * @param email the email to search for
     * @return the Merchant with the given email
     */
    public Merchant getMerchantFromEmail(String email) {
        List<Merchant> merchants = merchantRepository.findAll();
        for (Merchant c : merchants) {
            if (c.getEmail().equals(email)) {
                return c;
            }
        }
        return null;
    }

    public Admin getAdminFromEmail(String email) {
        List<Admin> admins = adminRepository.findAll();
        for (Admin a : admins) {
            if (a.getEmail().equals(email)) {
                return a;
            }
        }
        return null;
    }


    /**
     * Generates a new order number for a merchant based on their existing orders.
     * 
     * <p>
     * This method retrieves all orders from the repository and determines the highest
     * existing order number for the specified merchant. It then generates the next
     * sequential order number by incrementing the highest found order number.
     * If no orders exist for the merchant, it starts with "0001".
     * </p>
     * 
     * @param ID The unique identifier of the merchant for whom the order number is being generated.
     * @return A string representing the new order number, formatted as a four-digit number (e.g., "0001", "0002").
     */
    public String getNewOrderNum(int ID) {

        int max = 0;
        List<Order> orders = orderRepository.findAll();
        
        if (orders == null) {    
            return ("0001");
        }

        for (Order c : orders) {
            if (c.getMerchantId().getId().intValue() == ID && max < Integer.parseInt(c.getOrderNum())) {
                max = Integer.parseInt(c.getOrderNum());
            }
        }

        return String.format("%04d", (max + 1));
    }

    public Merchant getMerchantByAdminEmail(String email) {
        Admin admin = adminRepository.findByEmail(email);
        if (admin != null) {
            return admin.getMerchant(); // Get the merchant associated with the admin
        }
        return null;
    }

    /**
     * Saves or updates an merchant in the repository.
     *
     * @param merchant the {@link Merchant} item to be saved or updated
     */
    @Transactional
    public void saveMerchant(Merchant merchant) {
        merchantRepository.save(merchant);
    }
    

}
