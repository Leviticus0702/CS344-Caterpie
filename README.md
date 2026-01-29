## Academic Context

This project was developed as part of the Bachelor of Science in Computer Science program at 
Stellenbosch University.

While this was a **group project**, this repository contains the components and contributions 
I was personally responsible for, including system design and implementation.

*************************************************************************************************
SYSTEM REQUIREMENTS:
*************************************************************************************************
* Java Development Kit (JDK) 17
* Apache Maven: Version 3.6.3 (or higher)
* Spring Boot 3.3.2
*************************************************************************************************

*************************************************************************************************
DEPENDENCIES:
*************************************************************************************************
* Spring Boot: Provides the framework for developing the application.
* Spring Data JPA: Used for data access and persistence.
* Current database hosted by Supabase.
    * If you want to test with a local database:
        * Ensure you have a database system installed and configured.
        * The application.properties file also needs to be set accordingly then.
* WebSocket: For real-time communication.
* Maven: Build and dependency management tool.
*************************************************************************************************

*************************************************************************************************
CURRENT DATA SCHEMA:
*************************************************************************************************
1. **Admin Table**  
   **Columns:**
   - `id`: Unique identifier (int8).
   - `email`: Admin email (varchar).
   - `username`: Admin username (varchar).
   - `password`: Admin password (varchar).
   - `merchant_id`: Foreign key linking the admin to a merchant (int8).

2. **Customers Table**  
   **Columns:**
   - `id`: Unique identifier (int8).
   - `password`: Customer password (varchar).
   - `username`: Customer username (varchar).
   - `email`: Customer email (varchar).
   - `balance`: Balance associated with the customer's Pourtal wallet (float8).

3. **Inventory Table**  
   **Columns:**
   - `id`: Unique identifier (int8).
   - `drink_name`: Name of the drink (varchar).
   - `quantity`: Quantity of the drink available (int4).
   - `merchant_id`: Foreign key linking to the merchant (int8).
   - `merchant_name`: Name of the merchant the drink belongs to (varchar).

4. **Items Table**  
   **Columns:**
   - `id`: Unique identifier (int8).
   - `cost`: Cost of the item (float4).
   - `image`: Image associated with the item (varchar).
   - `item`: Name of the item (varchar).
   - `merchant_id`: Foreign key linking to the merchant the item belongs to (int8).

5. **Merchants Table**  
   **Columns:**
   - `id`: Unique identifier (int8).
   - `password`: Merchant password (varchar).
   - `username`: Merchant username (varchar).
   - `email`: Merchant email (varchar).

6. **Orders Table**
   **Columns:**
   - `id`: Unique identifier (int8).
   - `cost`: The total cost of the order (float4).
   - `customer_id`: Foreign key linking to the customer who placed the order (int8).
   - `date`: Date and time when the order was placed (timestamp).
   - `merchant_id`: Foreign key linking to the merchant the order is for (int8).
   - `order_details`: A list of what was ordered (varchar).
   - `order_num`: Order number (varchar).
   - `status`: Status of the order (varchar).
   - `otp`: One-Time Password for the order (varchar).
   - `order_quantities`: Quantities of items ordered (varchar).
   - `special_instructions`: Special instructions provided by the customer (varchar).
   - `receipt`: Receipt details (varchar).
   - `rating`: Rating given to the order (int4).

7. **Specials Table**  
   **Columns:**
   - `id`: Unique identifier (int8).
   - `duration`: Duration of the special (varchar).
   - `frequency`: Frequency of the special (varchar).
   - `items`: Items involved in the special (varchar).
   - `type`: Type of the special (varchar).
   - `value`: Value or discount of the special (float4).
   - `merchant_id`: Foreign key linking to the merchant who is having that special (int8).


*************************************************************************************************

*************************************************************************************************
HOW TO USE THE APPLICATION:
*************************************************************************************************
* Install wscat globally (if you have not done so previously):
    * `$ npm install -g wscat`

* Build the app:
    * Navigate to Your Project Root Directory
    * `$ mvn clean compile`

* Run the backend:
    * Navigate to Your Project Root Directory
    * `$ mvn spring-boot:run`

* Run the customer front-end:
    * Navigate to client_frontend
    * `$ npm run build`
    * `$ npm start`
    * Navigate to the web application by clicking on the link in the terminal
   
* Run the merchant/admin front-end:
    * Navigate to the bar-web-app directory
    * `$ npm run build`
    * `$ npm start`

Backend Testing Commands:

Customer:
* Choose a role:
        `role,C`
* Login with email and Password:
        `account,login,<email>,<password>`
* Create a new account:
        `account,create,<username>,<email>,<password>`
* Place an Order(Single item):
        `order,<merchant_email>,<drink>,<quantity>`
* Place an Order(with instructions):
        `order,<merchant_email>,<drink>,<quantity>,<instruction>`
* Place an Order(Multiple items):
        `order,<merchant_email>,<Drink1/Drink2>,<Quantity1/Quantity2>`
* Reset password:
        `resetPassword,<user_email>,<newPassword>,<confirmNewPassword>`
* Reset username:
        `resetUsername,<user_email>,new_Username`
* View info:
        `myProfile`
* View Balance:
        `viewBalance`
* Deposit:
        `deposit,<amount>`
* Withdraw:
        `withdraw,<amount>`
* Rate Order:
        `rate,<order_id>,<number of stars>`
* Order history:
        `orderHistory`
* Download receipt(saved in the receipts directory at the root):
        `saveReceipt,<order id>`
* Logout (only if you've logged in):
        `<logout>`

Merchant:
* Choose a role:
        `role,M`
* Login with email and Password:
        `account,login,<email>,<password>`
* Create a new account:
        `account,create,<username>,<email>,<password>`
* Accept an Order:
        `accept,<orderNum>`
* Mark Order as Ready:
        `ready,<orderNum>`
* Collect Order:
        `collect,<orderNum>,<otp>`
* Add new inventory:
     `<newInventory>,<drinkName>,<quantity>`
* Increase inventory:
     `<incInventory>,<drink name>,<quantity>`
* Decrease inventory:
     `<decInventory>,<drink name>,<quantity>`
* Reset password:
        `resetPassword,<user_email>,<newPassword>,<confirmNewPassword>`
* Reset username:
        `resetUsername,<user_email>,new_Username`
* View info:
        `myProfile`

* Logout (only if you've logged in):
        `<logout>`


System Admin:
* Choose role:
     `role,SA`
* Login with email and password: 
     `account,login,<email>,<password>`
* View registered Customers:
     `<viewCustomers>` 
* View registered Merchants:
     `<viewMerchants>`
* Delete Users (Customers or Merchants):
     `<deleteUser>,<username>`
* Logout:
     `<logout>`


******************************************************************************************
TROUBLESHOOTING
******************************************************************************************
* Compilation Issues:
    * Make sure all system requirements are properly installed.
    * Ensure your device is connected to stable internet.
* Runtime Errors:
    * Check application logs for errors and exceptions. Address issues based on log messages.
    * Ensure your device is connected to stable internet.
