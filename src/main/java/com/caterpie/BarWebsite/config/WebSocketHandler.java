package com.caterpie.BarWebsite.config;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.caterpie.BarWebsite.model.User;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Inventory;
import com.caterpie.BarWebsite.model.Order;
import com.caterpie.BarWebsite.model.Item;
import com.caterpie.BarWebsite.model.Admin;
import com.caterpie.BarWebsite.service.SystemAdminService;
import com.caterpie.BarWebsite.service.InventoryService;
import com.caterpie.BarWebsite.service.UserService;
import com.caterpie.BarWebsite.service.OrderService;
import com.caterpie.BarWebsite.service.ItemService;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.repository.CustomerRepository;

/**
 * WebSocketHandler handles WebSocket messages and manages user sessions.
 */
@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private final OrderService orderService;
    private final UserService userService;
    private final SystemAdminService systemAdminService;
    private final InventoryService inventoryService;
    private final ItemService itemService;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public static final Map<String, User> sessions = new HashMap<>();

    @Autowired
    public WebSocketHandler(OrderService orderService, UserService userService, SystemAdminService systemAdminService, InventoryService inventoryService, ItemService itemService) {
        this.orderService = orderService;
        this.userService = userService;
        this.systemAdminService = systemAdminService;
        this.inventoryService = inventoryService;
        this.itemService = itemService;
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        String[] parts = payload.split(",");
        String action = parts[0];


        // Handle role selection
        if (action.equals("role")) {
            handleRoleSelection(session, parts);
        } 
        // Handle password reset request
        else if (action.equals("resetPassword")) {
            handleResetPassword(session, parts);
        } 
        // Handle username reset request
        else if (action.equals("resetUsername")) {
            handleResetUsername(session, parts);
        } 
        // Handle account creation or login
        else if (action.equals("account")) {
            handleAccountAction(session, parts);
        }
        // Handle deposit
        else if (action.equals("deposit")) {
            handleDeposit(session, parts);
        }
        // Withdrawal
        else if (action.equals("withdraw")) {
            handleWithdrawal(session, parts);
        }
        // Balance
        else if (action.equals("viewBalance")) {
            handleViewBalance(session, parts);
        }
        // Other actions
        else {
            User user = getUserFromSession(session);
            if (user != null) {
                switch (action) {
                    case "accept":
                        orderService.acceptOrder(session, payload);
                        break;
                    case "ready":
                        orderService.readyOrder(session, payload);
                        break;
                    case "collect":
                        orderService.collectOrder(session, payload);
                        break;
                    case "order":
                        orderService.handleOrder(session, payload);
                        break;
                    case "logout":
                        handleLogout(session);
                        break;
                    case "viewMerchants":
                        viewMerchants(session);
                        break;
                    case "viewOrdersMenu":
                        onMerchantLogin(session);
                        break;
                    case "checkAvailability":
                        orderService.checkAvailability(session, parts);
                        break;
                    case "viewCustomers":
                        viewCustomers(session);
                        break;
                    case "deleteUser":
                        handleDeleteUser(session, parts);
                        break;
                    case "viewInventory":
                        handleViewInventory(session);
                        break;
                    case "viewStdInventory":
                        handleStdViewInventory(session);
                        break;
                    case "editInventory":
                        handleEditInventory(session, parts);
                        break;
                    case "deleteInventory":
                        deleteInventory(session, parts);
                        break;
                    case "newInventory":
                        handleNewInventory(session, parts);
                        break;
                    case "decInventory":
                        decreaseInventory(session, parts);
                        break;
                    case "incInventory":
                        increaseInventory(session, parts);
                        break;
                    case "viewMenu":
                        viewMerchantMenu(session);
                        break;
                    case "EditMenu": 
                        editMerchantMenu(session, payload);
                        break;
                    case "deleteMenuItem":
                        deleteMerchantMenuItem(session, payload);
                        break;
                    case "addMenuItem":
                        addMerchantMenuItem(session, payload);
                        break;
                    case "updateUsername":
                        handleUpdateUsername(session, payload);
                        break;
                    case "viewStdMenu":
                        handleviewStdMenu(session);
                        break;
                    case "viewAccountDetails":
                        handleViewAccountDetails(session, payload);
                        break;
                    case "updatePassword":
                        handleUpdatePassword(session, payload);
                        break;
                    case "viewMerchantOrderHistory":
                        handleMerchantOrderHistory(session);
                        break;
                    case "viewDeclinedOrders":
                        handleViewDeclinedOrders(session);
                        break;
                    case "orderHistory":
                        orderService.getOrderHistory(session);
                        break;
                    case "saveReceipt":
                        orderService.saveReceiptById(session, parts);
                        break;
                    case "rate":
                        orderService.rateOrder(session, parts);
                        break;
                    case "myProfile":
                        handleMyProfile(session);
                        break;
                    case "declineOrder":
                        orderService.handleDeclineOrder(session, payload);
                        break;
                    case "viewSpecials":
                        handleViewSpecials(session);
                        break;
                    case "createSpecial":
                        handleCreateSpecial(session, parts);
                        break;
                    case "editSpecial":
                        handleEditSpecial(session, parts);
                        break;
                    case "deleteSpecial":
                        handleDeleteSpecial(session, parts);
                        break;
                    default:
                        sendMessage(session, "Unknown action");
                        break;
                }
            } 
        }
    }

    private void handleViewSpecials(WebSocketSession session) throws IOException {

        User user = getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);
        Merchant merchant = merchantRepository.findByEmail(sysAdmin.getMerchant().getEmail());
        String response = itemService.getSpecialsByMerchantId(merchant.getId());

        if (sysAdmin != null) {
            sendMessage(session, response);
        } else {
            sendMessage(session, "Admin not found.");
        }
        
    }

    private void handleviewStdMenu(WebSocketSession session) throws IOException {
        
        String sysAdminEmail = "mypourtal@gmail.com";
        Admin admin = systemAdminService.getMyAdmin(sysAdminEmail);
        
        if (admin != null) {
            Merchant merchant = admin.getMerchant();
            sendMerchantItemsToAdmin(session, merchant);
        } else {
            sendMessage(session, "Admin not found.");
        }
        
    }

    private void handleViewDeclinedOrders(WebSocketSession session) throws IOException {
        //<"viewDeclinedOrders">
        
        List<Order> declinedOrders = orderService.getMerchantsOrdersFromStatus(session, "Declined");
        try {
            if (!declinedOrders.isEmpty()) {
                // Sending incoming orders
                
                session.sendMessage(new TextMessage("declined Orders:" + formatCollectedOrders(declinedOrders)));
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void handleCreateSpecial(WebSocketSession session, String[] parts) throws IOException {
        // <"createSpecial">,<Items>,<"-","%">,<value>,<duration>,<"once","recurring">

        if (parts.length != 6) {
            sendMessage(session, "Usage: <\"createSpecial\">,<Items>,<\"-\",\"%\">,<value>,<duration>,<\"once\",\"recurring\">");
            return;
        }

        User user = getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);

        if (user != null && user.isAdmin()) {
            String drinkName = parts[1];
            float value;
            try {
                value = Float.parseFloat(parts[3]);
            } catch (NumberFormatException e) {
                sendMessage(session, "Invalid value");
                return;
            }
            String result = itemService.newSpecial(sysAdmin.getMerchant().getEmail(), parts);
            sendMessage(session, result);
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }

    private void handleEditSpecial(WebSocketSession session, String[] parts) throws IOException {
        // <"editSpecial">,<Items>,<"-","%">,<value>,<duration>,<"once","recurring">

        if (parts.length != 6) {
            sendMessage(session, "Usage: <\"editSpecial\">,<Items>,<\"-\",\"%\">,<value>,<duration>,<\"once\",\"recurring\">");
            return;
        }

        User user = getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);

        if (user != null && user.isAdmin()) {
            String drinkName = parts[1];
            float value;
            try {
                value = Float.parseFloat(parts[3]);
            } catch (NumberFormatException e) {
                sendMessage(session, "Invalid value");
                return;
            }
            String result = itemService.editSpecial(sysAdmin.getMerchant().getEmail(), parts);
            sendMessage(session, result);
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }

    private void handleDeleteSpecial(WebSocketSession session, String[] parts) throws IOException {
        // <"deleteSpecial">,<Item>

        if (parts.length != 2) {
            sendMessage(session, "Usage: <\"deleteSpecial\">,<Item>");
            return;
        }

        User user = getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);

        if (user != null && user.isAdmin()) {

            itemService.deleteSpecial(sysAdmin.getMerchant().getEmail(), parts[1]);
            sendMessage(session, "Special deleted successfully.");
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }



    private void handleMerchantOrderHistory(WebSocketSession session) throws IOException {
        //<"viewAccountDetails">
        
        List<Order> completedOrders = orderService.getAdminOrdersFromStatus(session, "Collected");
        try {
            if (!completedOrders.isEmpty()) {
                // Sending incoming orders
                
                session.sendMessage(new TextMessage("orderHistory:" + formatCollectedOrderHistory(completedOrders)));
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String formatCollectedOrderHistory(List<Order> orders) {
        // Format the orders as a string, e.g., orderNumber,otp,drinks/quantities
        return orders.stream()
            .map(order -> order.getOrderNum() + "," + order.getOrder() + "," + order.getDate()
            + "," + order.getOrderQuantities() + "," + order.getRating() 
            + "," + String.valueOf(order.getCost()))
            .collect(Collectors.joining(";"));
    }


    private String formatCollectedOrders(List<Order> orders) {
        // Format the orders as a string, e.g., orderNumber,otp,drinks/quantities
        return orders.stream()
            .map(order -> order.getOrderNum() + "," + order.getOrder() + "," + order.getDate() + "," + order.getOrderQuantities() 
            + "," + String.valueOf(order.getCost()))
            .collect(Collectors.joining(";"));
    }

    private void handleViewAccountDetails(WebSocketSession session, String payload) throws IOException {
        //<"viewAccountDetails">,<"A"/"M">
        
        User user = getUserFromSession(session);
        
        if (user == null) {
            sendMessage(session, "User not found. Please log in.");
            return;
        }
    
        String userEmail = user.getUsername();
        String[] parts = payload.split(",");
        if (parts.length < 2) {
            sendMessage(session, "Invalid format. Usage: <\"viewAccountDetails\">,<\"A\"/\"M\">");
            return;
        }
    
        String accountType = parts[1];

        switch (accountType) {
            case "A":
                System.out.println("email : " + userEmail);
                Admin sysAdmin = systemAdminService.getMyAdmin(userEmail);
                synchronized(session) {
                    if (session.isOpen()) {
                        sendMessage(session, "Username :" + sysAdmin.getUsername());
                    }
                }
                break;
            case "M":
                Merchant merchant = userService.getMerchantFromEmail(userEmail);
                sendMessage(session, "Username :" + merchant.getUsername());
                break;
            default:
                sendMessage(session, "Incorrect account type received.");
                break;
        }
    }

    private void handleUpdateUsername(WebSocketSession session, String payload) throws IOException {
        //<"updateUsername">,<"A"/"M">,<newUsername>
        
        User user = getUserFromSession(session);

        if (user == null) {
            sendMessage(session, "User not found. Please log in.");
            return;
        }
    
        String userEmail = user.getUsername(); 
        String[] parts = payload.split(",");
        if (parts.length < 3) {
            sendMessage(session, "Invalid format. Usage: <\"updateUsername\">,<\"A\"/\"M\">,<newUsername>");
            return;
        }
    
        String accountType = parts[1];
        String newUsername = parts[2];

        switch (accountType) {
            case "A":

                String sysAdminEmail = user.getUsername();
                Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);
                sysAdmin.setUsername(newUsername);
                systemAdminService.saveAdmin(sysAdmin);
                sendMessage(session, "Updated username successfully.");
                break;
            case "M":
                Merchant merchant = userService.getMerchantFromEmail(userEmail);
                merchant.setUsername(newUsername);
                userService.saveMerchant(merchant);
                sendMessage(session, "Updated username successfully.");
                break;
            default:
                sendMessage(session, "Updated username failed. Incorrect account type received.");
                break;
        }
    }

    private void handleUpdatePassword(WebSocketSession session, String payload) throws IOException {
        //<"updatePassword">,<"A"/"M">,<newPassword>
        
        User user = getUserFromSession(session);

        if (user == null) {
            sendMessage(session, "User not found. Please log in.");
            return;
        }
    
        String userEmail = user.getUsername(); 
        String[] parts = payload.split(",");
        if (parts.length < 3) {
            sendMessage(session, "Invalid format. Usage: <\"updatePassword\">,<\"A\"/\"M\">,<newPassword>");
            return;
        }
    
        String accountType = parts[1];
        String newPassword = parts[2];

        switch (accountType) {
            case "A":
                String sysAdminEmail = user.getUsername();
                Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);
                sysAdmin.setPassword(newPassword);
                systemAdminService.saveAdmin(sysAdmin);
                sendMessage(session, "Updated username successfully.");
                break;
            case "M":
                Merchant merchant = userService.getMerchantFromEmail(userEmail);
                merchant.setPassword(newPassword);
                userService.saveMerchant(merchant);
                sendMessage(session, "Updated username successfully.");
                break;
            default:
                sendMessage(session, "Updated username failed. Incorrect account type received.");
                break;
        }
    }

    private void addMerchantMenuItem(WebSocketSession session, String payload) throws IOException {
        //<addMenuItem>,<itemName>,<cost>,<image(optional)>
        
        User user = getUserFromSession(session); 

        if (user == null) {
            sendMessage(session, "User not found. Please log in.");
            return;
        }
    
        String[] parts = payload.split(",");
        if (parts.length < 3) {
            sendMessage(session, "Invalid format. Usage: <addMenuItem>,<itemName>,<cost>");
            return;
        }
    
        String itemName = parts[1];

        float cost;
        try {
            cost = Float.parseFloat(parts[2]);
        } catch (NumberFormatException e) {
            sendMessage(session, "Invalid cost format.");
            return;
        }
    
        Merchant merchant = userService.getMerchantByAdminEmail(user.getUsername());
        System.out.println(merchant.toString());
        System.out.println(user.getEmail());
        System.out.println(session.getAttributes().toString());
        System.out.println(sessions);
        System.out.println(sessions.toString());
        if (merchant == null) {
            sendMessage(session, "Merchant not found for the current admin.");
            return;
        }
    
        Item newItem = new Item();
        newItem.setItemName(itemName);
        newItem.setCost(cost);
        newItem.setMerchant(merchant);
        
        if (parts.length == 4) {
            newItem.setImage(parts[3]);
        } else {
            newItem.setImage(null);
        }
    
        itemService.saveItem(newItem);
    
        sendMessage(session, "Item '" + itemName + "' added successfully with a cost of " + cost + ".");
    }

    private void deleteMerchantMenuItem(WebSocketSession session, String payload) throws IOException {
        // deleteMenuItem,<itemID>
        String[] parts = payload.split(",");
        
        if (parts.length < 2) {
            sendMessage(session, "Invalid command format. Usage: <deleteMenuItem>,<itemID>");
            return;
        }
        User user = getUserFromSession(session);
        if (user == null) {
            sendMessage(session, "User not found. Please log in.");
            return;
        }

        String sysAdminEmail = user.getUsername();
        Admin admin = userService.getAdminFromEmail(sysAdminEmail);

        if (admin == null) {
            sendMessage(session, "Admin not found.");
            return;
        }
        
        String itemName = parts[1];
        Merchant merchant = admin.getMerchant();
        Item itemToDelete = null;
        List<Item> itemList = itemService.getItemsByMerchantId(merchant.getId());

        for (Item item : itemList) {
            if (Objects.equals(item.getItemName(), itemName)) {
                itemToDelete = item;
            }
        }
        
        Long itemId;
        try {
            itemId = itemToDelete.getId();
        } catch (NumberFormatException e) {
            sendMessage(session, "Invalid item ID.");
            return;
        }
        
        if (itemToDelete == null) {
            sendMessage(session, "Item not found or does not belong to this merchant.");
            return;
        }

        System.out.println("Item to delete: ID = " + itemToDelete.getId() + ", Name = " + itemToDelete.getItemName());

    
        try {
            itemService.deleteItemByIdAndMerchant(itemId, merchant.getId());
            sendMessage(session, "Item with ID " + itemId + " was deleted successfully.");
        } catch (Exception e) {
            sendMessage(session, "Error deleting item: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void editMerchantMenu(WebSocketSession session, String payload) throws IOException {
        //<EditMenu>,<ItemID>,<Name/Cost>,<NewName/NewCost>,<Image>
        User user = getUserFromSession(session);
        
        String sysAdminEmail = user.getUsername();
        if (user != null) {
            
            Admin admin = userService.getAdminFromEmail(sysAdminEmail);
    
            if (admin != null) {
                
                Merchant merchant = admin.getMerchant();
                
                String[] parts = payload.split(",");
    
                // Ensure the payload is correctly formatted: <EditMenu>,<ItemID>,<Name/Cost>,<NewName/NewCost>
                if (parts.length < 4) {
                    sendMessage(session, "Invalid format. Usage: <EditMenu>,<ItemID>,<Name/Cost>,<NewName/NewCost>.");
                    return;
                }
    
                String itemName = parts[2].split("/")[0];  
                String newName = parts[3].split("/")[0];
                float newCost = Float.parseFloat(parts[3].split("/")[1]);
                String imageName = parts[4];

                Item itemToEdit = null;
                List<Item> itemList = itemService.getItemsByMerchantId(merchant.getId());

                for (Item myitem : itemList) {
                    if (Objects.equals(myitem.getItemName(), itemName)) {
                        myitem.setCost(newCost);
                        myitem.setItemName(newName);
                        myitem.setImage(imageName);
                        itemService.saveItem(myitem);
                        sendMessage(session, "Item edit successful.");
                    }
                }
    
            } else {
                sendMessage(session, "Admin not found.");
            }
        } else {
            sendMessage(session, "User not found. Please log in first.");
        }
    }

    private void viewMerchantMenu(WebSocketSession session) throws IOException {
    
        User user = getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
    
        if (user != null) {
            Admin admin = systemAdminService.getMyAdmin(sysAdminEmail);
            if (admin != null) {
                Merchant merchant = admin.getMerchant();
                sendMerchantItemsToAdmin(session, merchant);
            } else {
                sendMessage(session, "Admin not found.");
            }
        } else {
            sendMessage(session, "User not found. Please log in first.");
        }

    }

    private void sendMerchantItemsToAdmin(WebSocketSession session, Merchant merchant) throws IOException {
        // Retrieve all items associated with this merchant
        List<Item> items = itemService.getItemsByMerchantId(merchant.getId());
    
        if (items == null || items.isEmpty()) {
            sendMessage(session, "No items found for merchant: " + merchant.getUsername());
            return;
        }
    
        // Construct a response message with the merchant's items
        StringBuilder response = new StringBuilder("Items for Merchant: ").append(merchant.getUsername()).append("\n");
    
        for (Item item : items) {
            response.append("Item Name: ").append(item.getItemName())
                    .append(", Cost: ").append(item.getCost())
                    .append(", Image: ").append(item.getImage() != null ? item.getImage() : "No Image")
                    .append("\n");
        }
    
        // Send the constructed message via WebSocket
        sendMessage(session, response.toString());
    }

private void handleDeposit(WebSocketSession session, String[] parts) throws IOException {
    if (parts.length < 2) {
        session.sendMessage(new TextMessage("Error: Usage: deposit,amount"));
        return;
    }
    // Parse the amount as BigDecimal to avoid scientific notation
    BigDecimal amount = new BigDecimal(parts[1]);

    // Format the amount to display with two decimal places
    amount = amount.setScale(2, RoundingMode.HALF_UP); 

    User user = getUserFromSession(session);
    String email = user.getEmail();
    Customer customer = customerRepository.findByEmail(email);
    
    // Deposit the amount
    if (customer.add(amount.floatValue())) {
        customerRepository.save(customer);
        session.sendMessage(new TextMessage("Success: You deposited R" + amount.toPlainString() + " into your wallet"));
        return;
    }
    
    session.sendMessage(new TextMessage("Error depositing R" + amount.toPlainString() + " into your wallet"));
    return;
}


private void handleWithdrawal(WebSocketSession session, String[] parts) throws IOException {
    if (parts.length < 2) {
        session.sendMessage(new TextMessage("Error: Usage: withdraw,amount"));
        return;
    }
    // Parse the amount as BigDecimal to avoid scientific notation
    BigDecimal amount = new BigDecimal(parts[1]);

    // Format the amount to display with two decimal places
    amount = amount.setScale(2, RoundingMode.HALF_UP); 

    User user = getUserFromSession(session);
    String email = user.getEmail();
    Customer customer = customerRepository.findByEmail(email);
    
    // Withdraw the amount
    if (customer.sub(amount.floatValue())) {
        customerRepository.save(customer);
        session.sendMessage(new TextMessage("Success: R" + amount.toPlainString() + " was withdrawn from your wallet"));
        return;
    }
    
    session.sendMessage(new TextMessage("Error withdrawing R" + amount.toPlainString() + " from your wallet"));
    return;
}

private void handleViewBalance(WebSocketSession session, String[] parts) throws IOException {
    User user = getUserFromSession(session);
    String email = user.getEmail();
    Customer customer = customerRepository.findByEmail(email);
    // Get the balance as a BigDecimal
    BigDecimal balance = new BigDecimal(customer.getBalance());

    // Format the balance to display with two decimal places
    balance = balance.setScale(2, RoundingMode.HALF_UP);  // Adjust precision if necessary

    session.sendMessage(new TextMessage("Balance: " + balance.toPlainString()));
}


    /**
     * Retrieves the user's profile information
     * and sends it to the client via the WebSocket session.
     * @param session the WebSocket session associated with the user, used for sending the profile information back to the client
     */
    private void handleMyProfile(WebSocketSession session) throws IOException {
        User user = getUserFromSession(session);
        String email = user.getEmail();
        String password = user.getPassword();
        Long id = (long) 0;
        String userType = "";
        String username ="";
        Customer customer = customerRepository.findByEmail(email);
        Merchant merchant = merchantRepository.findByEmail(email);
        if (customer != null) {
            id = customer.getId();
            userType = "Customer";
            username = customer.getUsername();
        } else if (merchant != null) {
            id  =merchant.getId();
            userType = "Merchant";
            username = merchant.getUsername();
        }
        String info ="\nEmail: " + email + "\nPassword: " + password + "\nID: " + id + "\nType: " + userType + "\nUsername: " + username;  
        session.sendMessage(new TextMessage(info));
    }

    /**
    * Handles a reset password request by verifying the provided email, checking for the user's existence,
    * confirming password validity(matching), and updating the password in the appropriate repository (Customer or Merchant).
    * @param session the WebSocket session used for communication with the client
    * @param parts   an array containing the reset password command and parameters: email, new password, and confirmation password
    */
    public void handleResetPassword(WebSocketSession session, String[] parts) throws IOException {
        //usage:resetPassword,<user_email>,newPassword,confirmNewPassword
        if (parts.length < 4) {
            session.sendMessage(new TextMessage("Error: Usage: resetPassword,<user_email>,newPassword,confirmNewPassword"));
            return;
        }

        String email = parts[1].trim();
    
        // Check in Customer Repository
        Customer customer = customerRepository.findByEmail(email);
        Merchant merchant = null;

        if (customer == null) {
            // If not found in Customer Repository, check Merchant Repository
            merchant = merchantRepository.findByEmail(email);
            if (merchant == null) {
                // If not found in either repository, notify the user
                session.sendMessage(new TextMessage("Error: Account not found for email: " + email));
                return;
            }
        }

        String newPassword = parts[2].trim();
        String newPasswordConfirm = parts[3].trim();

        // Check that both passwords match and are not empty
        if (newPassword.isEmpty() || newPasswordConfirm.isEmpty()) {
            session.sendMessage(new TextMessage("Error: Password cannot be empty."));
            return;
        }

        if (!newPassword.equals(newPasswordConfirm)) {
            session.sendMessage(new TextMessage("Error: Passwords do not match."));
            return;
        }

        // Update the password for the user (Customer or Merchant)
        if (customer != null) {
            customer.setPassword(newPassword);
            customerRepository.save(customer);
            session.sendMessage(new TextMessage("Success: Your password has been reset."));
        } else if (merchant != null) {
            merchant.setPassword(newPassword);
            merchantRepository.save(merchant);
            session.sendMessage(new TextMessage("Success: Your password has been reset."));
        }
    }

    /**
    * Handles a reset username request by verifying the provided email, checking for the user's existence,
    and updating the username in the appropriate repository (Customer or Merchant).
    * @param session the WebSocket session used for communication with the client
    * @param parts   an array containing the reset username command and parameters: email, new username
    */
    public void handleResetUsername(WebSocketSession session, String[] parts) throws IOException {
        //usage:resetUsername,<user_email>,new_Username
        if (parts.length < 3) {
            session.sendMessage(new TextMessage("Error: Usage:resetUsername,<user_email>,new_Username"));
            return;
        }

        String email = parts[1].trim();
    
        // Check in Customer Repository
        Customer customer = customerRepository.findByEmail(email);
        Merchant merchant = null;

        if (customer == null) {
            // If not found in Customer Repository, check Merchant Repository
            merchant = merchantRepository.findByEmail(email);
            if (merchant == null) {
                // If not found in either repository, notify the user
                session.sendMessage(new TextMessage("Error: Account not found for email: " + email));
                return;
            }
        }

        String newUsername = parts[2].trim();

        // Update the password for the user (Customer or Merchant)
        if (customer != null) {
            customer.setUsername(newUsername);
            customerRepository.save(customer);
            session.sendMessage(new TextMessage("Success: Your Username has been reset."));
        } else if (merchant != null) {
            merchant.setUsername(newUsername);
            merchantRepository.save(merchant);
            session.sendMessage(new TextMessage("Success: Your Username has been reset."));
        }
    }

    /**
    * Handles the selection of a user role during a WebSocket session.
    * The method processes the role selection based on the input received from the session. 
    * It supports three roles: Customer, Merchant, and System Admin.
    * If an invalid role or incorrect format is provided, an error message is sent back to the session.
    * @param session the WebSocket session through which the role selection message was received
    * @param parts   an array containing the command and the role selection, where the first element is the command 
    *                and the second element is the selected role
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    private void handleRoleSelection(WebSocketSession session, String[] parts) throws IOException {
        //usage: <role>,<C/M/SA/A>
        if (parts.length < 2) {
            sendMessage(session, "Invalid role selection format. Usage: <role>,<M/C/SA>");
            return;
        }
        String role = parts[1];
        if (!(role.equals("C") || role.equals("M") || role.equals("SA") || role.equals("A"))) {
            sendMessage(session, "Invalid role. Roles: <C> = Customer, <M> = Merchant, <SA> = System Admin, <A> = Admin");
            return;
        }

        if (role.equals("SA")) {
            sendMessage(session, "NOT FOR SPRINT 1");
            return;
        }
        session.getAttributes().put("role", role);
        sendMessage(session, "Role selected: " + role + ". Now choose to create a new account or log in.");
    }

    /**
    * Handles account-related actions during a WebSocket session, such as creating or logging into an account.
    * This method processes the account action based on the input received from the session.
    * 
    * @param session the WebSocket session through which the account action message was received
    * @param parts   an array containing the command and the account action details. 
    *                The first element is the command, the second is the action (create/login), 
    *                followed by the username, email, and password as applicable.
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    private void handleAccountAction(WebSocketSession session, String[] parts) throws IOException {
        //Usage: <account>,<create/login>,<username>,<email>,<password>"

        String role = (String) session.getAttributes().get("role");

        if (role == null) {
            sendMessage(session, "Please select a role first.");
            return;
        }

        boolean isMerchant = "M".equals(role);
        boolean isSystemAdmin = "SA".equals(role);
        boolean isAdmin = "A".equals(role);

        String username = "";
        String email = "";
        String password = "";

        String action = parts[1];
        if (action.equals("create")) {
            if (parts.length < 5) {
                sendMessage(session, "Invalid account action format. Usage: <account>,<create>,<username>,<email>,<password>");
                return;
            }
            username = parts[2];
            email = parts[3];
            password = parts[4];
            if (role.equals("C")) {
                createCustomerAccount(session, username, password, email, isMerchant, isSystemAdmin);
            } else if (role.equals("M")) {
                createMerchantAccount(session, username, password, email, isMerchant, isSystemAdmin);
            } else if (role.equals("SA")) {
                createAdminAccount(session, username, password, email, isMerchant, isSystemAdmin);
            } else if (role.equals("A")) {
                Merchant merchant = (Merchant) session.getAttributes().get("merchant");
                System.out.println("+++" + merchant.toString() + "++++");
                createMerchantAdminAccount(session, username, password, email, isAdmin, merchant);
            }

        }else if (action.equals("login")) {
            if (parts.length < 4) {
                sendMessage(session, "Invalid account action format. Usage: <account>,<login>,<email>,<password>");
                return;
            }
            email = parts[2];
            password = parts[3];
            if (!(role.equals("M") || role.equals("SA") || role.equals("A"))) {
                loginCustomer(session, email, password, isMerchant, isSystemAdmin, isAdmin);
            } else if (role.equals("M")) {
                loginMerchant(session, email, password, isMerchant, isSystemAdmin, isAdmin);
            } else if (role.equals("A")) {
                loginAdmin(session, email, password, isMerchant, isSystemAdmin, isAdmin);
            }
            
        } else {
            sendMessage(session, "Invalid account action. Use 'create' or 'login'.");
        }

    }


    /**
     * Creates a merchant account based on the provided details and sends a response message to the WebSocket session.
     * 
     * <p>
     * This method attempts to create a new merchant account using the provided username, password, and email. 
     * It also specifies whether the user is a merchant or a system administrator. If the account is successfully created, 
     * a success message is sent to the user via the WebSocket session. If the email is already taken, 
     * an error message is sent instead.
     * </p>
     * 
     * @param session       The WebSocket session through which the response message is sent.
     * @param username      The desired username for the new merchant account.
     * @param password      The password for the new merchant account.
     * @param email         The email address for the new merchant account.
     * @param isMerchant    A boolean indicating if the account is for a merchant.
     * @param isSystemAdmin A boolean indicating if the account is for a system administrator.
     * @throws IOException If an input or output exception occurs while sending the WebSocket message.
     */
    public void createMerchantAccount(WebSocketSession session, String username, String password, String email, boolean isMerchant, boolean isSystemAdmin) throws IOException {
        if (userService.createProfile(username, password, email, isMerchant, isSystemAdmin)) {
            sendMessage(session, "Account created successfully. You can now log in.");
        } else {
            sendMessage(session, "Email taken.");
        }
        
    }

    private void createMerchantAdminAccount(WebSocketSession session, String username, String password, String email, boolean isAdmin, Merchant merchant) throws IOException {
        if (userService.createAdminProfile(username, password, email, isAdmin, merchant)) {
            sendMessage(session, "Account created successfully. You can now log in.");
        } else {
            sendMessage(session, "Email taken.");
        }
    }

    /**
     * Creates an admin account based on the provided details and sends a response message to the WebSocket session.
     * 
     * <p>
     * This method attempts to create a new admin account using the provided username, password, and email.
     * It also specifies whether the user is a merchant or a system administrator. If the account is successfully created,
     * a success message is sent to the user via the WebSocket session. If the email is already taken,
     * an error message is sent instead.
     * </p>
     * 
     * @param session       The WebSocket session through which the response message is sent.
     * @param username      The desired username for the new admin account.
     * @param password      The password for the new admin account.
     * @param email         The email address for the new admin account.
     * @param isMerchant    A boolean indicating if the account is for a merchant.
     * @param isSystemAdmin A boolean indicating if the account is for a system administrator.
     * @throws IOException If an input or output exception occurs while sending the WebSocket message.
     */
    private void createAdminAccount(WebSocketSession session, String username, String password, String email, boolean isMerchant, boolean isSystemAdmin) throws IOException {
        if (userService.createProfile(username, password, email, isMerchant, isSystemAdmin)) {
            sendMessage(session, "Account created successfully. You can now log in.");
        } else {
            sendMessage(session, "Email taken.");
        }
        
    }


    /**
    * Creates a customer account with the provided details.
    * <p>
    * This method attempts to create a new customer account using the provided username, password, 
    * and email. It also determines whether the account is for a Merchant or System Admin based on 
    * the boolean flags. If the account is successfully created, a confirmation message is sent to 
    * the session. If the email is already taken, an error message is sent instead.
    * </p>
    * 
    * @param session      the WebSocket session through which the account creation message was received
    * @param username     the desired username for the new account
    * @param password     the desired password for the new account
    * @param email        the email address associated with the new account
    * @param isMerchant   a flag indicating whether the account is for a Merchant
    * @param isSystemAdmin a flag indicating whether the account is for a System Admin
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    public void createCustomerAccount(WebSocketSession session, String username, String password, String email, boolean isMerchant, boolean isSystemAdmin) throws IOException {
        if (userService.createProfile(username, password, email, isMerchant, isSystemAdmin)) {
            sendMessage(session, "Account created successfully. You can now log in.");
        } else {
            sendMessage(session, "Email taken.");
        }
        
    }

    public void sendOrderUpdatesToMerchant(WebSocketSession session) throws IOException {

        //how sending things to frontend
        List<Order> incomingOrders = orderService.getMerchantsOrdersFromStatus(session, "Incoming");
        List<Order> acceptedOrders = orderService.getMerchantsOrdersFromStatus(session, "Accepted");
        List<Order> completedOrders = orderService.getMerchantsOrdersFromStatus(session, "Ready");

        try {
            if (!incomingOrders.isEmpty()) {
                // Sending incoming orders
                session.sendMessage(new TextMessage("incomingOrders," + formatOrders(incomingOrders)));
            }

            if (!acceptedOrders.isEmpty()) {
                // Sending accepted orders
                session.sendMessage(new TextMessage("acceptedOrders," + formatOrders(acceptedOrders)));                
            }
            
            if (!completedOrders.isEmpty()) {
                // Sending completed orders
                session.sendMessage(new TextMessage("completedOrders," + formatOrders(completedOrders)));
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String formatOrders(List<Order> orders) {
        // Format the orders as a string, e.g., orderNumber,otp,drinks/quantities
        return orders.stream()
            .map(order -> order.getOrderNum() + "," + order.getOrder() + "," + order.getOrderQuantities()
            + "," + String.valueOf(order.getCost()) + "," + order.getInstructions())
            .collect(Collectors.joining(";"));
    }

    // Call this method when a merchant logs in
    public void onMerchantLogin(WebSocketSession session) throws IOException {
        sendOrderUpdatesToMerchant(session);
    }


    /**
    * Handles the login process for a customer.
    * <p>
    * This method validates the login credentials (email and password) for a customer. If the login 
    * is successful, the customer is logged in, and their session is stored. If the credentials 
    * are invalid, or the account is not found, an appropriate error message is sent to the session.
    * </p>
    * 
    * @param session      the WebSocket session through which the login request was received
    * @param email        the email address used for login
    * @param password     the password used for login
    * @param isMerchant   a flag indicating whether the account is for a Merchant
    * @param isSystemAdmin a flag indicating whether the account is for a System Admin
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    public void loginCustomer(WebSocketSession session, String email,  String password, boolean isMerchant, boolean isSystemAdmin, boolean isAdmin) throws IOException {
        int status = userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin);
        if (status == 1) {
            String username = "";
            Customer customer = userService.getCustomerFromEmail(email);
            if (customer != null) {
                username = customer.getUsername();
            }
            User loggedInUser = new User(username, password, isMerchant, isSystemAdmin, isAdmin, session, email);
            sessions.put(email, loggedInUser);
            sendMessage(session, "Logged in successfully");
            if (!isMerchant && !isSystemAdmin && !isAdmin) {
                //sendMerchantsWithInventory(session);
                sendMerchantsWithItems(session);
            }
        } else if (status == 2) {
            sendMessage(session, "Invalid credentials");
        } else {
            sendMessage(session, "Account not found. Please register.");
        }
    }

    /**
    * Handles the login process for a Merchant/admin.
    * <p>
    * This method validates the login credentials (email and password) for a customer. If the login 
    * is successful, the customer is logged in, and their session is stored. If the credentials 
    * are invalid, or the account is not found, an appropriate error message is sent to the session.
    * </p>
    * 
    * @param session      the WebSocket session through which the login request was received
    * @param email        the email address used for login
    * @param password     the password used for login
    * @param isMerchant   a flag indicating whether the account is for a Merchant
    * @param isSystemAdmin a flag indicating whether the account is for a System Admin
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    public void loginMerchant(WebSocketSession session, String email,  String password, boolean isMerchant, boolean isSystemAdmin, boolean isAdmin) throws IOException {
        int status = userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin);
        if (status == 1) {
            String username = "";
            Merchant merchant = userService.getMerchantFromEmail(email);
            if (merchant != null) {
                username = merchant.getEmail();
            }
            User loggedInUser = new User(username, password, isMerchant, isSystemAdmin, isAdmin, session, email);
            //NOTE: FOR MERCHANTS, THE USERNAME STORED IN SESSIONS WILL HAVE TO BE THE EMAIL.
            sessions.put(email, loggedInUser);
            session.getAttributes().put("merchant", merchant);
            sendMessage(session, "Logged in successfully");
            onMerchantLogin(session);
            if (!isMerchant && !isSystemAdmin) {
                sendMerchantsWithInventory(session);
            }
        } else if (status == 2) {
            sendMessage(session, "Invalid credentials");
        } else {
            sendMessage(session, "Account not found. Please register.");
        }
    }

    private void loginAdmin(WebSocketSession session, String email, String password, boolean isMerchant, boolean isSystemAdmin, boolean isAdmin) throws IOException {
    
        int status = userService.validateLogin(email, password, isMerchant, isSystemAdmin, isAdmin);
        if (status == 1) {
            String username = "";
            Admin admin = userService.getAdminFromEmail(email); 
            if (admin != null) {
                username = admin.getEmail();
            }
            
            User loggedInUser = new User(username, password, isMerchant, isSystemAdmin, isAdmin, session, email); 
            sessions.put(email, loggedInUser);
            sendMessage(session, "Admin logged in successfully");
            
            // merchant for that admin
            Merchant merchant = admin.getMerchant();
            
        } else if (status == 2) {
            sendMessage(session, "Invalid credentials");
        } else {
            sendMessage(session, "Account not found. Please register.");
        }
    }

    private void sendMerchantDetailsToAdmin(WebSocketSession session, Merchant merchant) throws IOException {
        if (merchant != null) {
            StringBuilder response = new StringBuilder("Merchant Details for Admin:\n");
            response.append("Merchant Username: ").append(merchant.getUsername()).append("\n");
            response.append("Merchant Email: ").append(merchant.getEmail()).append("\n");
            sendMessage(session, response.toString());
        } else {
            sendMessage(session, "No merchant details available.");
        }
    }

    private void sendAdminDetails(WebSocketSession session, Merchant merchant) throws IOException {
        List<Admin> admins = userService.getAdminsByMerchant(merchant); // assuming this method is implemented in the userService
        if (admins.isEmpty()) {
            sendMessage(session, "No Admins found for this merchant.");
        } else {
            StringBuilder response = new StringBuilder("Admins for Merchant: ").append(merchant.getUsername()).append("\n");
            for (Admin admin : admins) {
                response.append("Admin Username: ").append(admin.getUsername())
                        .append(", Email: ").append(admin.getEmail()).append("\n");
            }
            sendMessage(session, response.toString());
        }
    }
    
    

    /**
    * Handles the logout process for the current session.
    * <p>
    * This method retrieves the logged-in user associated with the current session, sends a logout 
    * confirmation message, and then closes the session.
    * </p>
    * 
    * @param session the WebSocket session that requested the logout
    * @throws IOException if an I/O error occurs while sending a message to the session or closing the session
    */
    public void handleLogout(WebSocketSession session) throws IOException {
        User user = getUserFromSession(session);
        if (user != null) {
            sendMessage(user.getSession(), "Logged out");
            user.getSession().close();
        }
    }

    /**
    * Sends a list of merchants and their available inventory to the session.
    * <p>
    * This method retrieves all merchants who have available inventory and sends a formatted 
    * message containing the merchant names and their corresponding inventory details to the session.
    * </p>
    * 
    * @param session the WebSocket session to which the merchant inventory information will be sent
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    private void sendMerchantsWithInventory(WebSocketSession session) throws IOException {
        List<Merchant> merchants = inventoryService.getAllMerchantsWithInventory();
        StringBuilder response = new StringBuilder("Merchants and their inventories:\n");

        for (Merchant merchant : merchants) {
            response.append("Merchant: ").append(merchant.getUsername()).append("\n");
            for (Inventory inventory : merchant.getInventories()) {
                response.append("  Drink: ").append(inventory.getDrinkName())
                        .append(", Quantityyy: ").append(inventory.getQuantity()).append("\n");
            }
        }

        sendMessage(session, response.toString());
    }

    /**
     * Sends a list of merchants and their associated items (menus) to the client via a WebSocket session.
     * 
     * <p>
     * This method retrieves all merchants who have items (menus) from the {@code itemService}.
     * It then constructs a formatted string response that includes each merchant's username and the details
     * of their items, such as the item name and price. The constructed response is sent to the client
     * through the provided WebSocket session.
     * </p>
     * 
     * @param session The WebSocket session through which the response is sent.
     * @throws IOException If an input or output exception occurs while sending the WebSocket message.
     */
    private void sendMerchantsWithItems(WebSocketSession session) throws IOException {
        List<Merchant> merchants = itemService.getAllMerchantsWithItems();
        StringBuilder response = new StringBuilder("Merchants and Menus:\n");

        for (Merchant merchant : merchants) {
            response.append("Merchant: ").append(merchant.getUsername()).append("\n");
            response.append("MerchantEmail: ").append(merchant.getEmail()).append("\n");
            for (Item item : merchant.getItems()) {
                response.append("  Drink: ").append(item.getItemName())
                        .append(", Price: ").append(item.getCost()).append("\n");
            }
        }

        sendMessage(session, response.toString());
    }

    /**
     * Views all merchants (for system system admin).
     *
     * @param session the WebSocket session
     * throws IOException if an I/O error occurs
     */
    private void viewMerchants(WebSocketSession session) throws IOException {
        User user = getUserFromSession(session);

        if (user != null && user.isSystemAdmin()) {
            List<Merchant> allMerchants = systemAdminService.viewMerchants();
            StringBuilder response = new StringBuilder("All Merchants:\n");

            for (Merchant c : allMerchants) {
                response.append("Username: ").append(c.getUsername()).append("\n");
            }

            sendMessage(session, response.toString());
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }

     /**
     * Views all customers (for system admin).
     *
     * @param session the WebSocket session
     * @throws IOException if an I/O error occurs
     */
        private void viewCustomers(WebSocketSession session) throws IOException {
        User user = getUserFromSession(session);

        if (user != null && user.isSystemAdmin()) {
            List<Customer> allCustomers = systemAdminService.viewCustomers();
            StringBuilder response = new StringBuilder("All Customers:\n");

            for (Customer c : allCustomers) {
                response.append("Username: ").append(c.getUsername()).append("\n");
            }

            sendMessage(session, response.toString());
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }

    /**
    * Handles the deletion of a user account by a System Admin.
    * <p>
    * This method checks if the current session is associated with a logged-in System Admin.
    * If the session is valid and the user has the necessary privileges, it attempts to delete the
    * specified user account based on the provided username. The result of the deletion (success or failure)
    * is then sent back to the session. If the input format is incorrect or the user is unauthorized,
    * an appropriate error message is sent.
    * </p>
    * @param session the WebSocket session through which the delete user request was received
    * @param parts   an array of strings representing the command and its arguments
    * @throws IOException if an I/O error occurs while sending a message to the session
     */
    private void handleDeleteUser(WebSocketSession session, String[] parts) throws IOException {
        User user = getUserFromSession(session);

        if (user != null && user.isSystemAdmin()) {
            if (parts.length == 2) {
                String username = parts[1];
                String result = systemAdminService.deleteUser(username);
                sendMessage(session, result);
            } else {
                sendMessage(session, "<usage: <deleteUser>,<username>");
            }
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }
    

    /**
     * Handles the "newInventory" action for adding a new inventory item.
     *
     * @param session the WebSocket session
     * @param parts   the parts of the message
     * @throws IOException if an I/O error occurs
     */
    private void handleNewInventory(WebSocketSession session, String[] parts) throws IOException {
        if (parts.length !=3 ) {
            sendMessage(session, "Usage: <newInventory>,<drinkName>,<quantity>");
            return;
        }

        User user = getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Admin sysAdmin = systemAdminService.getMyAdmin(sysAdminEmail);

        if (user != null && user.isAdmin()) {
            String drinkName = parts[1];
            int quantity;
            try {
                quantity = Integer.parseInt(parts[2]);
            } catch (NumberFormatException e) {
                sendMessage(session, "Invalid quantity");
                return;
            }
            String result = inventoryService.newInventoryItem(sysAdmin.getMerchant().getEmail(), drinkName, quantity);
            sendMessage(session, result);
        } else {
            sendMessage(session, "Unauthorized action");
        }
    }

    /**
    * Decreases the inventory quantity of a specified drink for the logged-in merchant.
    * <p>
    * This method decreases the inventory of a specified drink by the given quantity for the merchant
    * associated with the current session. If the specified quantity exceeds the available quantity,
    * an error message is sent. Otherwise, the inventory is updated, and a confirmation message is sent.
    * </p>
    * @param session the WebSocket session through which the decrease inventory request was received
    * @param parts   an array of strings representing the command and its arguments
    * @throws IOException if an I/O error occurs while sending a message to the session
    */
    private void decreaseInventory(WebSocketSession session, String[] parts) throws IOException {
        if (parts.length != 3) {
            sendMessage(session, "Usage: <decInventory>,<drinkName>,<quantity>");
            return;
        }
        String drinkName = parts[1];
        int quantity = Integer.parseInt(parts[2]);
        User user = getUserFromSession(session);
        String merchantName = user.getUsername();
        Inventory inventory = inventoryService.getInventory(merchantName, drinkName);
        int availableQuantity = inventory.getQuantity();
        if (inventory != null) {
            if (availableQuantity - quantity >= 0) {
                inventory.setQuantity(availableQuantity - quantity);
                inventoryService.saveInventory(inventory);
                sendMessage(session, drinkName + " decreased by " + quantity);
            } else {
                sendMessage(session, "Not enough quantity");
            }
        }
    }

    /**
    * Increases the inventory quantity of a specified drink for the logged-in merchant.
    * <p>
    * This method increases the inventory of a specified drink by the given quantity for the merchant
    * associated with the current session. If the drink is not found in the inventory, an error message
    * is sent. Otherwise, the inventory is updated, and a confirmation message is sent.
    * </p>
    * @param session the WebSocket session through which the increase inventory request was received
    * @param parts   an array of strings representing the command and its arguments
    * @throws IOException if an I/O error occurs while sending a message to the session
     */
    private void increaseInventory(WebSocketSession session, String[] parts) throws IOException {
        if (parts.length != 3) {
            sendMessage(session, "Usage: <incInventory>,<drinkName>, <quantity>");
            return;
        }
        String drinkName = parts[1];
        int quantity = Integer.parseInt(parts[2]);
        User user = getUserFromSession(session);
        String merchantName = user.getUsername();
        Inventory inventory = inventoryService.getInventory(merchantName, drinkName);
        if (inventory != null) {
            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventoryService.saveInventory(inventory);
            sendMessage(session, drinkName + " increased by " + quantity);
        } else {
            sendMessage(session, "Drink not found");
        }
    }

    private void handleStdViewInventory(WebSocketSession session) throws IOException {

        List<Inventory> inventoryList = systemAdminService.viewStdInventory("mypourtal@gmail.com");

        try {
            if (!inventoryList.isEmpty()) {
                session.sendMessage(new TextMessage("inventoryList:" + formatInventory(inventoryList)));
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void handleViewInventory(WebSocketSession session) throws IOException {

        User user = getUserFromSession(session);
        String sysEmail = user.getUsername();
        List<Inventory> inventoryList = systemAdminService.viewInventory(session);

        try {
            if (!inventoryList.isEmpty()) {
                session.sendMessage(new TextMessage("inventoryList:" + formatInventory(inventoryList)));
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String formatInventory(List<Inventory> inventorys) {
        
        return inventorys.stream()
            .map(inventory -> inventory.getDrinkName() + "," + inventory.getQuantity())
            .collect(Collectors.joining(";"));

    }

    private void handleEditInventory(WebSocketSession session, String[] parts) throws IOException {
        
        String oldName = parts[1];
        String newName =  parts[2];
        Integer newQuantity = Integer.parseInt(parts[3]);
        List<Inventory> inventoryList = systemAdminService.viewInventory(session);

        for (Inventory inventory : inventoryList) {
            if (Objects.equals(inventory.getDrinkName(), oldName)) {
                inventory.setDrinkName(newName);
                inventory.setQuantity(newQuantity);
                inventoryService.saveInventory(inventory);
            }
        }
    }

    private void deleteInventory(WebSocketSession session, String[] parts) throws IOException {
        // deleteInventory,<itemName>

        if (parts.length < 2) {
            sendMessage(session, "Invalid command format. Usage: <deleteMenuItem>,<itemID>");
            return;
        }
        
        String itemName = parts[1];
        
        User user = getUserFromSession(session);
        if (user == null) {
            sendMessage(session, "User not found. Please log in.");
            return;
        }

        String sysAdminEmail = user.getUsername();
        Admin admin = userService.getAdminFromEmail(sysAdminEmail);
        if (admin == null) {
            sendMessage(session, "Admin not found.");
            return;
        }
        
        Merchant merchant = admin.getMerchant();
        Inventory itemToDelete = null;
        List<Inventory> inventoryList = systemAdminService.viewInventory(session);

        for (Inventory inventory : inventoryList) {
            if (Objects.equals(inventory.getDrinkName(), itemName)) {
                itemToDelete = inventory;
            }
        }
        
        if (itemToDelete == null) {
            sendMessage(session, "Item not found or does not belong to this merchant.");
            return;
        }

        System.out.println("Item to delete: ID = " + itemToDelete.getDrinkName() + ", Name = " + itemToDelete.getDrinkName());

        try {
            inventoryService.deleteInventoryByIdAndMerchant(itemToDelete.getId(), merchant.getId());
            sendMessage(session, "Item  " + itemName + " was deleted successfully.");
        } catch (Exception e) {
            sendMessage(session, "Error deleting item: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
    * Retrieves the user associated with the given WebSocket session.
    * <p>
    * This method searches through the active sessions to find and return the user associated with
    * the provided WebSocket session. If no matching user is found, it returns null.
    * </p> 
    * @param session the WebSocket session to retrieve the user for
    * @return the User associated with the session, or null if no user is found
    */
    public static User getUserFromSession(WebSocketSession session) {
        return sessions.values().stream()
                .filter(user -> user.getSession().equals(session))
                .findFirst()
                .orElse(null);
    }


    /**
    * Sends a text message to the specified WebSocket session.
    * <p>
    * This method sends a simple text message to the WebSocket session provided. The message
    * is wrapped in a {@link TextMessage} object before being sent.
    * </p> 
    * @param session the WebSocket session to send the message to
    * @param message the message to be sent
    * @throws IOException if an I/O error occurs while sending the message
    */
    private void sendMessage(WebSocketSession session, String message) throws IOException {
        session.sendMessage(new TextMessage(message));
    }


    /**
    * Handles the closing of a WebSocket connection.
    * <p>
    * This method is called when a WebSocket connection is closed. It removes the user
    * associated with the session from the active sessions map, ensuring that the user
    * is logged out properly.
    * </p> 
    * @param session the WebSocket session that was closed
    * @param status  the status indicating the reason for the closure
    * @throws Exception if an error occurs during the closure process
    */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        User user = getUserFromSession(session);
        if (user != null) {
            sessions.remove(user.getUsername());
        }
    }
     
    public Map<String, User> getSessions() {
        return sessions;
    }
    
}