package com.caterpie.BarWebsite.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.caterpie.BarWebsite.config.WebSocketHandler;
import com.caterpie.BarWebsite.model.Customer;
import com.caterpie.BarWebsite.model.Inventory;
import com.caterpie.BarWebsite.model.Merchant;
import com.caterpie.BarWebsite.model.Order;
import com.caterpie.BarWebsite.model.User;
import com.caterpie.BarWebsite.repository.CustomerRepository;
import com.caterpie.BarWebsite.repository.MerchantRepository;
import com.caterpie.BarWebsite.repository.OrderRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

import jakarta.transaction.Transactional;

/**
 * Service class for managing business logic related to orders, including
 * handling order statuses,
 * notifying users, and managing connected users.
 */
@Service
public class OrderService {

    private final UserService userService;

    private final ItemService itemService;

    private final InventoryService inventoryService;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    private Order currentOrder;

    @Autowired
    public OrderService(UserService userService, ItemService itemService, InventoryService inventoryService, OrderRepository orderRepository) {
        this.userService = userService;
        this.itemService = itemService;
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
    }

    public List<Order> getMerchantsOrdersFromStatus(WebSocketSession session, String status) throws IOException {

        User user = WebSocketHandler.getUserFromSession(session);
        String merchant = user.getUsername();
        Merchant newmerch = merchantRepository.findByEmail(merchant);
        List<Order> merchantsOrders = orderRepository.findByMerchantId(newmerch);
        List<Order> updatedlist = new ArrayList<>();

        for (Order orders : merchantsOrders) {

            if (orders.getstatus().equals(status)) {
                updatedlist.add(orders);
            }

        }

        return updatedlist;

    }

    public void handleDeclineOrder(WebSocketSession session, String stringPacket) throws IOException {
        // Usage: <decline>,<orderNum>,<"+","-">

        String[] orderDetails = stringPacket.split(",");

        if (orderDetails.length == 3) {

            String orderNum = orderDetails[1].trim();
            User user = WebSocketHandler.getUserFromSession(session);
            String merchant = user.getUsername();
            Merchant newmerch = merchantRepository.findByEmail(merchant);
            Order myOrder = getMyOrder(orderNum, newmerch);
            String customer = myOrder.getCustomerId().getEmail();
            currentOrder = myOrder;

            if ("-".equals(orderDetails[2])) {
            
                updateOrder("Declined");
            
            } else {

                updateOrder("Incoming");

            }

            notifyUser(customer, "Order has been declined");
            orderRepository.save(myOrder);

        } else {
            System.out.println("Usage: <decline>,<orderNum>\n" +
                    "argc = " + orderDetails.length + " Got: " + stringPacket);
        }
        
    }

    public List<Order> getAdminOrdersFromStatus(WebSocketSession session, String status) throws IOException {

        User user = WebSocketHandler.getUserFromSession(session);
        String sysAdminEmail = user.getUsername();
        Merchant newmerch = userService.getMerchantByAdminEmail(sysAdminEmail);
        List<Order> merchantsOrders = orderRepository.findByMerchantId(newmerch);
        List<Order> updatedlist = new ArrayList<>();

        for (Order orders : merchantsOrders) {

            if (orders.getstatus().equals(status)) {
                updatedlist.add(orders);
            }

        }

        return updatedlist;

    }

    /**
     * Handles the acceptance of an order.
     * <p>
     * Updates the order status and sends a confirmation message to the customer.
     * </p>
     *
     * @param session      The WebSocket session for communication.
     * @param stringPacket The order details in a comma-separated format.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    public void acceptOrder(WebSocketSession session, String stringPacket) throws IOException {

        // Usage: <accept>,<<orderNum>
        String[] orderDetails = stringPacket.split(",");
        if (orderDetails.length == 2) {

            String orderNum = orderDetails[1].trim();
            User user = WebSocketHandler.getUserFromSession(session);
            String merchant = user.getUsername();
            Merchant newmerch = merchantRepository.findByEmail(merchant);
            merchant = newmerch.getUsername();
            Order myOrder = getMyOrder(orderNum, newmerch);
            String customer = myOrder.getCustomerId().getEmail();
            Customer c = customerRepository.findByEmail(customer);
            String[] drinks = myOrder.getOrder().split("/");
            String[] quantities = myOrder.getOrderQuantities().split("/");
            String otp = myOrder.getotp();
            Long id = myOrder.getId();
            float totalprice = myOrder.getCost();
            boolean paid = c.sub(totalprice);
            if (!paid) {
                notifyUser(customer, "Insufficient funds in your wallet.");
                return;
            }
            customerRepository.save(c);

            // try {
            // totalprice = orderDetails[6].trim();
            // } catch (Exception e) {
            // totalprice = "0.0";
            // }

            currentOrder = myOrder;
            updateOrder("Accepted");

            String receipt = "accepted,************************\n" +
                    "Your order has been accepted!\n" +
                    "Order Number: " + orderNum + "\n" +
                    "Order Id: " + id + "\n" +
                    "Drinks:\n";

            for (int i = 0; i < drinks.length; i++) {
                receipt = receipt + drinks[i] + ":" + quantities[i] + "\n";
            }

            receipt = receipt + "Merchant: " + merchant + "\n" +
                    "OTP: " + otp + "\n" + "Total Price: " + totalprice + "\n************************";

            notifyUser(customer, receipt);
            myOrder.setReceipt(receipt);
            orderRepository.save(myOrder);
        } else {
            System.out.println("Usage: <accept>,<customer>,<drink>,<quantity>,<orderNum>,<otp>\n" +
                    "argc = " + orderDetails.length + " Got: " + stringPacket);
        }
    }

    public Order getMyOrder(String orderNum, Merchant merchant) {

        List<Order> templist = orderRepository.findByOrderNum(orderNum);

        for (Order orders : templist) {
            if (orders.getMerchantId().getEmail().equals(merchant.getEmail())) {
                return orders;
            }
        }

        return null;

    }

    /**
     * Notifies the customer when their order is almost ready.
     * <p>
     * Sends a notification message to the customer with the order status.
     * </p>
     *
     * @param session      The WebSocket session for communication.
     * @param stringPacket The order details in a comma-separated format.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    public void readyOrder(WebSocketSession session, String stringPacket) throws IOException {

        // Usage: <ready>,<orderNum>
        String[] orderDetails = stringPacket.split(",");
        if (orderDetails.length == 2) {
            String orderNum = orderDetails[1].trim();
            User user = WebSocketHandler.getUserFromSession(session);
            String merchant = user.getUsername();
            Merchant newmerch = merchantRepository.findByEmail(merchant);
            Order myOrder = getMyOrder(orderNum, newmerch);
            currentOrder = myOrder;
            updateOrder("Ready");
            String customer = myOrder.getCustomerId().getEmail();

            String receipt = "ready,************************\n" +
                    "Your order is almost ready. \nPlease head to the bar, and show them your order number and OTP. \n ************************";
            notifyUser(customer, receipt);
            myOrder.setReceipt(receipt);
            orderRepository.save(myOrder);
        } else {
            System.out.println("Usage: <ready>,<customer>,<orderNum>\n" +
                    "Got: " + stringPacket);
        }
    }

    /**
     * Marks an order as collected and notifies the customer.
     * <p>
     * Sends a collection confirmation message to the customer.
     * </p>
     *
     * @param session      The WebSocket session for communication.
     * @param stringPacket The order details in a comma-separated format.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    public void collectOrder(WebSocketSession session, String stringPacket) throws IOException {

        // Usage: <collect>,<orderNum>,<otp>
        String[] orderDetails = stringPacket.split(",");
        if (orderDetails.length == 3) {
            String orderNum = orderDetails[1].trim();
            String otp = orderDetails[2].trim();
            User user = WebSocketHandler.getUserFromSession(session);
            String merchant = user.getUsername();
            Merchant newmerch = merchantRepository.findByEmail(merchant);
            merchant = newmerch.getUsername();
            Order myOrder = getMyOrder(orderNum, newmerch);

            if (otp.equals(myOrder.getotp())) {
                session.sendMessage(new TextMessage("correct_otp"));
            } else {
                session.sendMessage(new TextMessage("wrong_otp"));
                return;
            }

            String customer = myOrder.getCustomerId().getEmail();
            String[] drinks = myOrder.getOrder().split("/");
            String[] quantities = myOrder.getOrderQuantities().split("/");

            currentOrder = myOrder;
            currentOrder.setstatus("Collected");
            currentOrder.setOtp(null);
            updateOrder("Collected");
            updateOtp(null);

            String receipt = "collected,************************\n" +
                    "Your order has been collected!\n" +
                    "Order Number: " + orderNum + "\n"
                    + "Drinks:\n";

            for (int i = 0; i < drinks.length; i++) {
                receipt = receipt + drinks[i] + ":" + quantities[i] + "\n";
            }

            receipt = receipt + "Merchant: " + merchant + "\n************************";

            notifyUser(customer, receipt);
            myOrder.setReceipt(receipt);
            orderRepository.save(myOrder);
        } else {
            System.out.println("Usage: <collect>,<customer>,<drink>,<quantity>,<orderNum>\n" +
                    "Got: " + stringPacket);
        }
    }

    /**
     * Handles a new order by sending it to the merchant and notifying the customer
     * of the order status.
     * <p>
     * Checks if the merchant is available and sends the order accordingly. Notifies
     * the customer about
     * the order status based on merchant availability.
     * </p>
     *
     * @param session      The WebSocket session for communication.
     * @param stringPacket The order details in a comma-separated format.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    public void handleOrder(WebSocketSession session, String stringPacket) throws IOException {
        // Usage: <order>,<merchant's email>,<drinks>,<quantity>,<optional instructions>
        // On the Customer UI the customer will see the Merchant's name though not
        // email.
        String[] orderDetails = stringPacket.split(",");
        String specialInstructions = null;

        if ((orderDetails.length == 4) || (orderDetails.length == 5)) {
            User user = WebSocketHandler.getUserFromSession(session);
            // String customer = user.getUsername();
            String customer_email = user.getEmail();
            String merchant_email = orderDetails[1].trim(); // has to be the merchant's email now.
            Customer custom1 = customerRepository.findByEmail(customer_email);
            String customer = custom1.getUsername();
            if (orderDetails.length == 5) {
                specialInstructions = orderDetails[4];
            }

            boolean merchantAvailable = false;
            System.err.println(merchantRepository.findByEmail(merchant_email).getUsername() + "^^^^^^^^^^^^^^^^");

            // if (checkQuantities(orderDetails[2], orderDetails[3], merchantRepository.findByEmail(merchant_email).getUsername(), customer_email)) {

                if (WebSocketHandler.sessions.containsKey(merchant_email)) {
                    merchantAvailable = true;
                    // Send order to merchant
                    Merchant tempMerchant = merchantRepository.findByEmail(merchant_email);
                    String orderNum = userService.getNewOrderNum(tempMerchant.getId().intValue());
                    String otp = generateOTP(tempMerchant);
                    float totalPrice = calculateCost(orderDetails[2], orderDetails[3], tempMerchant.getId());
    
                    stringPacket = "order," + customer + "," + orderDetails[2] + "," + orderDetails[3] + "," + orderNum + "," + otp + "," + totalPrice;
    
                    User targetMerchant = WebSocketHandler.sessions.get(merchant_email);
                    if (targetMerchant != null) {
                        targetMerchant.getSession().sendMessage(new TextMessage("newOrder," + orderNum + ","
                        + orderDetails[2] + "," + orderDetails[3] + "," + String.valueOf(totalPrice)));
                    } else {
                        System.out.println("Merchant " + tempMerchant + " not found by sendOrder()\n");
                    }
    
                    createOrder(orderNum, custom1, orderDetails[2], orderDetails[3],LocalDateTime.now(), totalPrice, tempMerchant, otp, specialInstructions);
                    if (specialInstructions != null && !(specialInstructions.isEmpty())) {
                        sendOrder(merchant_email, stringPacket + "," + specialInstructions);
                    } else {
                        sendOrder(merchant_email, stringPacket);
                    }
                    
                    if (specialInstructions != null){
                        sendOrder(custom1.getEmail(), "orderDetails," + customer + "," + orderDetails[2] + "," + orderDetails[3] + "," + orderNum + "," + otp + "," + totalPrice + "," + specialInstructions);
                    } else {
                        sendOrder(custom1.getEmail(), "orderDetails," + customer + "," + orderDetails[2] + "," + orderDetails[3] + "," + orderNum + "," + otp + "," + totalPrice);
                    }
                }
                // Notify the customer about the order status
                notifyOrderStatus(customer_email, merchant_email, merchantAvailable);

        }

        // } else {
        //     System.out.println("Usage: <order>,<merchant's email>,<drink>,<quantity>,<optional_instructions>");
        // }
    }

    public boolean checkQuantities(String items, String quantities, String merchantName, String customerEmail) throws IOException {

        String[] itemNames = items.split("/");
        String[] itemQuants = quantities.split("/");
        
        StringBuilder responseBuilder = new StringBuilder("QuantityViolated");
        boolean quantityViolated = false;
    
        for (int i = 0; i < itemNames.length; i++) {
            // Retrieve inventory once for each item
            Inventory currentInventory = inventoryService.getInventory(merchantName, itemNames[i]);
    
            if (currentInventory != null) {
                int requestedQuantity = Integer.parseInt(itemQuants[i]);
    
                // Check if requested quantity exceeds available quantity
                if (currentInventory.getQuantity() < requestedQuantity) {
                    quantityViolated = true;
                    responseBuilder.append(",").append(currentInventory.getDrinkName())
                                   .append("/").append(currentInventory.getQuantity());
                }
            }
        }
    
        if (quantityViolated) {
            // Remove the last comma
            notifyUser(customerEmail, responseBuilder.toString());
            return false;

        } else {

            for (int i = 0; i < itemNames.length; i++) {

                Inventory currentInventory = inventoryService.getInventory(merchantName, itemNames[i]);
                currentInventory.setQuantity(currentInventory.getQuantity() - Integer.parseInt(itemQuants[i]));
                inventoryService.saveInventory(currentInventory);

            }

            return true;
        }
    }

    public void checkAvailability(WebSocketSession session, String[] parts) throws IOException {
        // <checkAvailability>
        
    }

    /**
     * Calculates and returns a cost value.
     * 
     * <p>
     * This method returns a cost value. The cost value is of type
     * {@code float}.
     * </p>
     * 
     * @return The cost value.
     */
    private float calculateCost(String items, String amounts, long merchantId) {

        String[] listItems = items.split("/");
        String[] listQuantity = amounts.split("/");

        float totalCost = 0;

        for (int i = 0; i < listItems.length; i++) {

            try {
                float itemCost = itemService.findItemCost(listItems[i], merchantId);
                int quantity = Integer.parseInt(listQuantity[i]);
                totalCost += itemCost * quantity;
            } catch (Exception e) {
                System.err.println("Error occurred: for item: " + listItems[i] + ", quantity: " + listQuantity[i]);
                e.printStackTrace();
            }
        }

        return totalCost;
    }

    private String generateOTP(Merchant merchant) {

        String tempotp = generateOTP(5);

        List<Order> tempOrders = orderRepository.findByMerchantId(merchant);
        ArrayList<String> otps = new ArrayList<>();

        for (Order orders : tempOrders) {

            if (orders.getstatus().equals("Completed")) {
                otps.add(orders.getotp());
            }

        }

        while (otps.contains(tempotp)) {
            tempotp = generateOTP(5);
        }

        return tempotp;
    }

    /**
     * Generates a One-Time Password (OTP) of the specified length using digits.
     * 
     * <p>
     * This method creates a random OTP consisting only of numeric digits. The OTP
     * is generated using a {@link SecureRandom} to ensure strong randomness.
     * </p>
     * 
     * @param length The length of the OTP to be generated.
     * @return A string representing the generated OTP.
     */
    private static String generateOTP(int length) {

        String digits = "0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();

        for (int i = 0; i < length; i++) {
            otp.append(digits.charAt(random.nextInt(digits.length())));
        }

        return otp.toString();
    }

    /**
     * Notifies the customer about the status of their order.
     * <p>
     * Sends a message to the customer indicating whether the merchant is available
     * or offline.
     * </p>
     *
     * @param customer          The username of the customer.
     * @param merchant          The username of the merchant.
     * @param merchantAvailable Whether the merchant is available.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    private void notifyOrderStatus(String customer, String merchant, boolean merchantAvailable) throws IOException {
        User targetCustomer = WebSocketHandler.sessions.get(customer);
        if (targetCustomer != null) {
            String message = merchantAvailable ? "pending..." : "Currently offline";
            targetCustomer.getSession().sendMessage(new TextMessage(message));
        } else {
            System.out.println("Customer " + customer + " not found by notifyOrderStatus()\n" +
                    "Merchant found: " + merchantAvailable);
        }
    }

    /**
     * Sends an order message to the specified merchant.
     * <p>
     * This method sends the order details to the merchant if they are connected.
     * </p>
     *
     * @param merchant The username of the merchant.
     * @param order    The order details in a comma-separated format.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    private void sendOrder(String merchant, String order) throws IOException {
        User targetMerchant = WebSocketHandler.sessions.get(merchant);
        if (targetMerchant != null) {
            targetMerchant.getSession().sendMessage(new TextMessage(order));
        } else {
            System.out.println("Merchant " + merchant + " not found by sendOrder()\n");
        }
    }

    /**
     * Creates a new order with the given details and saves it to the repository.
     * 
     * <p>
     * This method is transactional, meaning that if any exception occurs during
     * the execution of this method, all database operations within the transaction
     * will be rolled back to maintain data consistency.
     * </p>
     * 
     * @param orderNum   The unique identifier for the order.
     * @param customerId The customer who placed the order.
     * @param order      The order details as a string.
     * @param date       The date and time when the order was placed.
     * @param cost       The total cost of the order.
     * @param merchantId The merchant associated with the order.
     * @return {@code true} if the order is successfully created and saved.
     */
    @Transactional
    private boolean createOrder(String orderNum, Customer customerId, String order, String quants, LocalDateTime date,
            float cost, Merchant merchantId, String otp, String instructions) {

        currentOrder = new Order();
        currentOrder.setCost(cost);
        currentOrder.setCustomerId(customerId);
        currentOrder.setDate(date);
        currentOrder.setMerchantId(merchantId);
        currentOrder.setOrder(order);
        currentOrder.setOrderQuantities(quants);
        currentOrder.setOrderNum(orderNum);
        currentOrder.setOtp(otp);
        currentOrder.setstatus("Incoming");
        currentOrder.setInstructions(instructions);
        orderRepository.save(currentOrder);
        return true;

    }

    /**
     * Updates the status of the current order and saves the changes to the
     * repository.
     * 
     * @param status The new status of the order (e.g., "Incoming", "Processed",
     *               etc.).
     */
    private void updateOrder(String status) {

        currentOrder.setstatus(status);
        orderRepository.save(currentOrder);

    }

    /**
     * Updates the status of the current order and saves the changes to the
     * repository.
     * 
     * @param status The new status of the order (e.g., "Incoming", "Processed",
     *               etc.).
     */
    private void updateOtp(String otp) {

        currentOrder.setOtp(otp);
        orderRepository.save(currentOrder);

    }

    /**
     * Notifies a user with a specific message.
     * <p>
     * This method sends a notification message to the specified user if they are
     * connected.
     * </p>
     *
     * @param customer The username of the customer.
     * @param message  The message to be sent.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    private void notifyUser(String customer, String message) throws IOException {
        User target = WebSocketHandler.sessions.get(customer);
        if (target != null) {
            target.getSession().sendMessage(new TextMessage(message));
        } else {
            System.out.println("Customer " + customer + " not found by notifyUser\n");
        }
    }

    /**
     * Retrieves an order based on the provided OTP (One-Time Password).
     *
     * @param otp the One-Time Password (OTP) used to identify the order. This
     *            should not be {@code null}.
     * @return the {@link Order} that matches the provided OTP, or {@code null} if
     *         no matching order is found.
     */
    public Order getOrderByOtp(String otp) {

        List<Order> templist = orderRepository.findByotp(otp);

        for (Order order : templist) {
            if (order.getotp().equals(otp)) {
                return order;
            }
        }
        return null;
    }

    /**
     * Retrieves an order based on the provided id
     *
     * @param id the id used to identify the order. This should not be {@code null}.
     * @return the {@link Order} that matches the provided id, or {@code null} if no
     *         matching order is found.
     */
    public Order getOrderById(String id) {
        // Parsing the String ID to a Long
        Long orderId = Long.parseLong(id);
        return orderRepository.findById(orderId).orElse(null);
    }

    /**
     * Saves the receipt for a given order as a PDF file and sends a WebSocket
     * message to the session
     * with the status of the operation.
     *
     * @param session the WebSocket session used for sending messages back to the
     *                client
     * @param parts   an array containing the command and the order id. The array
     *                must have exactly 2 elements:
     *                the command ("orderHistory") and the id used to find the order
     */
    public void saveReceiptById(WebSocketSession session, String[] parts) throws IOException {
        if (parts.length != 2) {
            session.sendMessage(new TextMessage("usage: orderHistory,<id>"));
            return;
        }

        String id = parts[1];

        Order order = getOrderById(id);

        if (order == null) {
            System.out.println("Order not found");
            session.sendMessage(new TextMessage("Order not found"));
            return;
        }

        StringBuilder receiptBuilder = new StringBuilder();
        receiptBuilder.append("************************\n");
        String status = order.getstatus();
        if (status.equals("Incomming")) {
            status = "pending";
        }
        // Get the Merchant name using the merchantId from the order
        Merchant merchant = order.getMerchantId();
        String merchantName = (merchant != null) ? merchant.getUsername() : "Unknown Merchant";

        // Append the order details
        receiptBuilder.append("Order Number: ").append(order.getOrderNum()).append("\n")
                .append("Order Details: ").append(order.getOrder()).append("\n")
                .append("Quantities: ").append(order.getOrderQuantities()).append("\n")
                .append("Total Price: ").append(order.getCost()).append("\n")
                .append("Status: ").append(status).append("\n")
                .append("Merchant Name: ").append(merchantName).append("\n")
                .append("Date: ").append(order.getDate()).append("\n")
                .append("Id: ").append(order.getId()).append("\n");
        // Check if order instructions are not null, and append if they exist
        if (order.getInstructions() != null && !order.getInstructions().isEmpty()) {
            receiptBuilder.append("Instructions: ").append(order.getInstructions()).append("\n");
        }
        if (order.getotp() != null) {
            receiptBuilder.append("OTP: ").append(order.getotp()).append("\n");
        }
        receiptBuilder.append("************************\n");

        String receipt = receiptBuilder.toString();

        if ((receipt == null) || receipt.isEmpty()) {
            session.sendMessage(new TextMessage("Error saving receipt"));
            return;
        }

        // Specify the directory and file path
        String directoryPath = "receipts";
        File directory = new File(directoryPath);

        // Create the directory if it doesn't exist
        if (!directory.exists()) {
            directory.mkdir();
        }

        // Specify the file name and path in the "receipts" directory
        String fileName = directoryPath + File.separator + "order_receipt_" + id + ".pdf";

        try {
            // Create a PDF writer and document
            PdfWriter pdfWriter = new PdfWriter(fileName);
            PdfDocument pdfDocument = new PdfDocument(pdfWriter);
            Document document = new Document(pdfDocument);

            // Add content to the PDF
            document.add(new Paragraph(receipt));

            // Close the document
            document.close();
            session.sendMessage(new TextMessage("Receipt saved as PDF: " + fileName));

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * Retrieves the entire order history for a customer(except for orders with an
     * "Incoming status").
     * 
     * @param session The WebSocket session for communication.
     * @throws IOException If an I/O error occurs while sending messages.
     */
    public void getOrderHistory(WebSocketSession session) throws IOException {

        User user = WebSocketHandler.getUserFromSession(session);
        String customer_email = user.getEmail();

        Customer customer = customerRepository.findByEmail(customer_email);
        if (customer == null) {
            session.sendMessage(new TextMessage("Customer not found."));
            return;
        }

        List<Order> orders = orderRepository.findByCustomerId(customer);
        if (orders.isEmpty()) {
            session.sendMessage(new TextMessage("No orders found for this customer."));
            return;
        }

        // Sort orders by order number in descending order
        orders.sort(Comparator.comparing(Order::getOrderNum).reversed());

        StringBuilder historyMessage = new StringBuilder();
        historyMessage.append("************************\n");
        historyMessage.append("Order History:\n");

        for (Order order : orders) {
            String status = order.getstatus();
            if (!status.equalsIgnoreCase("Incoming")) {

                // Get the Merchant name using the merchantId from the order
                Merchant merchant = order.getMerchantId();
                String merchantName = (merchant != null) ? merchant.getUsername() : "Unknown Merchant";

                // Append the order details
                historyMessage.append("Order Number: ").append(order.getOrderNum()).append("\n")
                        .append("Order Details: ").append(order.getOrder()).append("\n")
                        .append("Quantities: ").append(order.getOrderQuantities()).append("\n")
                        .append("Total Price: ").append(order.getCost()).append("\n")
                        .append("Status: ").append(status).append("\n")
                        .append("Merchant Name: ").append(merchantName).append("\n")
                        .append("Date: ").append(order.getDate()).append("\n")
                        .append("Id: ").append(order.getId()).append("\n")
                        .append("OTP: ").append(order.getotp()).append("\n")
                        .append("Rating: ").append(order.getRating()).append("\n");
                // Check if order instructions are not null, and append if they exist
                if (order.getInstructions() != null && !order.getInstructions().isEmpty()) {
                    historyMessage.append("Instructions: ").append(order.getInstructions()).append("\n");
                }
                historyMessage.append("************************\n");
            }
        }

        session.sendMessage(new TextMessage(historyMessage.toString()));
    }
    
    public void rateOrder(WebSocketSession session, String[] parts) throws IOException {
        if (parts.length != 3) {
            session.sendMessage(new TextMessage("usage: rate,order_id,stars"));
            return;
        } 
        String id = parts[1];
        int stars = Integer.parseInt(parts[2]);

        Order order = getOrderById(id);

        if (order == null) {
            System.out.println("Order not found");
            session.sendMessage(new TextMessage("Order not found"));
            return;
        }

        order.setRating(stars);
        orderRepository.save(order);

    }

}