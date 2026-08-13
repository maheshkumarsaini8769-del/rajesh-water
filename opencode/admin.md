Create a simple, modern and responsive Admin Panel for the water bottle supply website.

Do NOT make it overly complicated.

ADMIN PANEL SHOULD HAVE ONLY THESE MAIN SECTIONS:

1. DASHBOARD

* Today's orders
* Total orders
* Pending orders
* Completed orders
* Total bottles sold
* Today's sales
* Small sales/order chart

2. ORDERS
   Show all customer orders in a clean table.

Columns:

* Order ID
* Customer Name
* Customer Mobile
* Address
* Products
* Total Bottles
* Total Amount
* Order Date
* Status

Order status:

* Pending
* Confirmed
* Delivered
* Cancelled

Admin should be able to:

* View order
* Change status
* Delete order

3. PRODUCTS
   Manage only these 4 products:

* 200 ML
* 500 ML
* 1 LITRE
* 2 LITRE

Admin can:

* Change price
* Change image URL
* Enable/disable product
* Change stock/status

Do NOT create complicated inventory management.

4. CUSTOMERS
   Show:

* Customer name
* Mobile number
* Address
* Total orders
* Total bottles ordered
* Last order

Clicking a customer should show their order history.

5. WHATSAPP ORDERS
   Show orders that came through the website.

Add buttons:

* Open WhatsApp
* Call Customer

Business WhatsApp:
7742735762

WhatsApp:
https://wa.me/917742735762

6. SETTINGS
   Keep settings very simple.

Allow admin to change:

* Business name
* WhatsApp number
* Contact number
* Delivery message
* Minimum order quantity

Default minimum order:
50 bottles

TECHNICAL REQUIREMENTS:

Use:

* React
* Tailwind CSS
* Node.js
* Express
* MongoDB

Create proper API endpoints for:

* Products
* Orders
* Customers
* Dashboard statistics

Admin login:

* Email/username
* Password
* Secure authentication

Do NOT expose admin credentials in frontend code.

DESIGN:

Use the same light theme as the main website:

* White
* Light green
* Water blue accents

Admin panel should be:

* Clean
* Fast
* Responsive
* Easy to understand

Sidebar:
Dashboard
Orders
Products
Customers
Settings

Top bar:

* Page title
* Admin profile
* Logout

MOBILE:
On mobile, sidebar should become a hamburger menu.

IMPORTANT:

Do not add unnecessary features such as:

* Complex accounting
* GST management
* Employee management
* Payroll
* Advanced warehouse system
* Complicated analytics
* Multiple admin roles

Keep it simple.

The main purpose of this panel is:

SEE ORDERS
→ SEE CUSTOMER DETAILS
→ MANAGE PRODUCTS/PRICES
→ CHANGE ORDER STATUS
→ CONTACT CUSTOMER
→ SEE BASIC SALES DATA

Build the frontend and backend completely and connect the Admin Panel to MongoDB.
Make sure refreshing the page does not lose data.
Handle loading, empty and error states properly.
