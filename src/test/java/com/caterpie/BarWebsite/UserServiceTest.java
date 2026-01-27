package com.caterpie.BarWebsite;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.caterpie.BarWebsite.model.Admin;
import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Merchant;

import com.caterpie.BarWebsite.repository.AdminRepository;
import com.caterpie.BarWebsite.repository.CustomerRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.repository.OrderRepository;
import com.caterpie.BarWebsite.repository.SystemAdminRepository;
import com.caterpie.BarWebsite.service.UserService;

public class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private SystemAdminRepository systemAdminRepository;

    @Mock
    private OrderRepository orderRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }
@Test
/**
 * Tests the validateLogin method of the UserService class.
 * <p>
 * This test verifies that when valid credentials are provided for a merchant,
 * the method returns 1, indicating valid credentials.
 * </p>
 */
public void testValidateLogin() {
    // Arrange
    String email = "merchant@example.com";
    String password = "password";
    Merchant merchant = new Merchant();
    merchant.setEmail(email);
    merchant.setPassword(password);

    when(merchantRepository.findByEmail(email)).thenReturn(merchant);

    // Act
    int result = userService.validateLogin(email, password, true, false, false);

    // Assert
    assertEquals(1, result); // Valid credential
}

@Test
/**
 * Tests the createProfile method of the UserService class.
 * <p>
 * This test verifies that when a new merchant profile is created successfully,
 * the method returns true and the save method is called on the repository.
 * </p>
 */
public void testCreateProfile() {
    // Arrange
    String username = "newMerchant";
    String email = "newmerchant@example.com";
    String password = "password";
    
    when(merchantRepository.findByEmail(email)).thenReturn(null); // No existing merchant

    // Act
    boolean result = userService.createProfile(username, password, email, true, false);

    // Assert
    assertTrue(result); // Profile created successfully
    verify(merchantRepository, times(1)).save(any(Merchant.class)); // Save method called
}

@Test
/**
 * Tests the createAdminProfile method of the UserService class.
 * <p>
 * This test verifies that when a new admin profile is created successfully,
 * the method returns true and the save method is called on the admin repository.
 * </p>
 */
public void testCreateAdminProfile() {
    // Arrange
    String username = "newAdmin";
    String email = "newadmin@example.com";
    String password = "password";
    Merchant merchant = new Merchant(); // Mock merchant

    when(adminRepository.findByEmail(email)).thenReturn(null); // No existing admin

    // Act
    boolean result = userService.createAdminProfile(username, password, email, true, merchant);

    // Assert
    assertTrue(result); // Admin profile created successfully
    verify(adminRepository, times(1)).save(any(Admin.class)); // Save method called
}

@Test
/**
 * Tests the getCustomerFromEmail method of the UserService class.
 * <p>
 * This test verifies that when a valid email is provided,
 * the method returns the corresponding customer object.
 * </p>
 */
public void testGetCustomerFromEmail() {
    // Arrange
    String email = "customer@example.com";
    Customer customer = new Customer();
    customer.setEmail(email);

    List<Customer> customers = new ArrayList<>();
    customers.add(customer);

    when(customerRepository.findAll()).thenReturn(customers);

    // Act
    Customer result = userService.getCustomerFromEmail(email);

    // Assert
    assertNotNull(result); // Customer should not be null
    assertEquals(email, result.getEmail()); // Email should match
}

@Test
/**
 * Tests the getMerchantFromEmail method of the UserService class.
 * <p>
 * This test verifies that when a valid email is provided,
 * the method returns the corresponding merchant object.
 * </p>
 */
public void testGetMerchantFromEmail() {
    // Arrange
    String email = "merchant@example.com";
    Merchant merchant = new Merchant();
    merchant.setEmail(email);

    List<Merchant> merchants = new ArrayList<>();
    merchants.add(merchant);

    when(merchantRepository.findAll()).thenReturn(merchants);

    // Act
    Merchant result = userService.getMerchantFromEmail(email);

    // Assert
    assertNotNull(result); // Merchant should not be null
    assertEquals(email, result.getEmail()); // Email should match
}

@Test
/**
 * Tests the getAdminFromEmail method of the UserService class.
 * <p>
 * This test verifies that when a valid email is provided,
 * the method returns the corresponding admin object.
 * </p>
 */
public void testGetAdminFromEmail() {
    // Arrange
    String email = "admin@example.com";
    Admin admin = new Admin();
    admin.setEmail(email);

    List<Admin> admins = new ArrayList<>();
    admins.add(admin);

    when(adminRepository.findAll()).thenReturn(admins);

    // Act
    Admin result = userService.getAdminFromEmail(email);

    // Assert
    assertNotNull(result); // Admin should not be null
    assertEquals(email, result.getEmail()); // Email should match
}

@Test
/**
 * Tests the saveMerchant method of the UserService class.
 * <p>
 * This test verifies that when a merchant is saved,
 * the save method is called on the merchant repository exactly once.
 * </p>
 */
public void testSaveMerchant() {
    // Arrange
    Merchant merchant = new Merchant();

    // Act
    userService.saveMerchant(merchant);

    // Assert
    verify(merchantRepository, times(1)).save(merchant); // Save method called once
}

}
