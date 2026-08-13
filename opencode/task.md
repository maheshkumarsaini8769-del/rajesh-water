Build a complete modern water bottle supply website.

Business contact / WhatsApp number:
7742735762

IMPORTANT:
Do not ask me unnecessary questions. Build the website directly according to these requirements.

PROJECT:
Create a premium, modern, clean and highly animated water bottle supply website.

THEME:
- Light theme
- White background
- Very light fresh green accents
- Water-blue accents can be used with green
- Clean glassmorphism where appropriate
- Premium but simple
- Do NOT make it look like a complicated corporate website
- It should immediately look like a professional local water supply business

PRODUCTS:
Only these four bottle sizes:

1. 200 ML
2. 500 ML
3. 1 LITRE
4. 2 LITRE

Each product card must have:
- Bottle image
- Bottle size
- Price placeholder
- Quantity selector
- + button
- - button
- Add to Cart button
- Smooth hover animation
- Small bottle movement/tilt animation
- Product image must remain clear

IMAGE REQUIREMENT:
Do NOT require me to manually download product images.

Use remote online images through an image API or public CDN.

Prefer:
- Unsplash API
- Pexels API
- another legal image API/CDN if required

Create a reusable image configuration so I can easily replace the API later.

Use environment variables for API keys if the selected API requires one.

Do not hard-code private API keys into frontend code.

If the image API is unavailable, use a clean local fallback placeholder so the website never shows a broken image.

Do not scrape random websites.

HOME PAGE:

Create a premium hero section.

LEFT SIDE:
- Main heading:
  "Pure Water. Delivered Fresh."

- Supporting text:
  "Quality drinking water delivered to your doorstep."

- CTA button:
  "Order Now"

- Secondary CTA:
  "View Bottles"

RIGHT SIDE:
Create a large water bottle visual.

The bottle should:
- slightly float
- gently rotate/tilt
- move according to mouse movement
- have a soft shadow
- have water ripple/glow effects around it
- react smoothly to mouse movement

VERY IMPORTANT:
When the user moves the mouse over the bottle, the bottle should move upward slightly and then smoothly return.
It should feel like the bottle is floating in water.

Do not make the animation too aggressive.

HOME SCROLL ANIMATION:

The homepage must have strong scroll-based animation.

When scrolling:
- Hero text fades in
- Hero text slightly moves upward
- Bottle moves/rotates
- Water particles move
- Sections reveal smoothly
- Product cards reveal one by one
- Headings animate
- Images scale from slightly smaller to normal size
- Cards have subtle parallax
- Background water shapes move slowly

Use GSAP + ScrollTrigger for advanced scroll animations.

Do not animate everything at once.
Keep animations smooth and professional.

NAVBAR:

Create a sticky navbar.

Left:
- Logo
- Business name:
  "RAJESH WATER"

Middle:
- Home
- Products
- About
- Contact

Right:
- Cart icon
- Cart item count

Navbar should become slightly smaller / more glass-like when scrolling.

FLOATING BUTTONS:

On the right side of the website create two floating buttons:

1. WhatsApp button
2. Contact / Call button

WhatsApp number:
7742735762

WhatsApp button must open:

https://wa.me/917742735762

Call button must open:

tel:+917742735762

Use proper icons.

PRODUCT SECTION:

Heading:
"Choose Your Bottle"

Show the four products:

200 ML
500 ML
1 LITRE
2 LITRE

Use a beautiful responsive grid.

Each card should have:
- Product image
- Size
- Price
- Quantity selector
- Add to Cart

Add hover effects:
- card lifts slightly
- image moves upward
- image rotates slightly
- shadow increases
- button animates

CART:

Create a proper shopping cart.

Cart should show:
- Product name
- Bottle size
- Quantity
- Price
- Total
- + / - quantity controls
- Remove button
- Grand total

Cart should remain available from navbar.

Use localStorage so the cart remains after refreshing the page.

MINIMUM ORDER:

IMPORTANT:

Minimum order quantity is 50 bottles.

The customer must NOT be allowed to complete the order if total quantity is less than 50.

If total quantity is below 50, show:

"Minimum order is 50 bottles."

Show current quantity:

"Your order: 32 / 50 bottles"

When quantity reaches 50:
- Show success state
- Enable checkout/order button

CHECKOUT:

Create a simple checkout/order form.

Fields:

Customer Name
Customer Mobile Number
Delivery Address
City
Optional Message

Validate:
- Name required
- Mobile number required
- Valid Indian mobile number
- Address required
- Minimum 50 bottles

After successful validation, show order summary:

Customer Name
Mobile Number
Address
Products
Quantity
Total bottles
Total amount

WHATSAPP ORDER:

When customer clicks:

"ORDER ON WHATSAPP"

Create a WhatsApp message automatically.

Example format:

Hello RAJESH WATER,

I want to place a water bottle order.

Customer Name: Rahul
Mobile: 9876543210
Address: __________
City: __________

Order:
200 ML - 20 bottles
500 ML - 10 bottles
1 LITRE - 20 bottles
2 LITRE - 0 bottles

Total Bottles: 50

Total Amount: ₹____

Please confirm my order.

Then open WhatsApp using:

https://wa.me/917742735762?text=ENCODED_MESSAGE

IMPORTANT:
The customer's mobile number must be included in the WhatsApp order message.

The business WhatsApp number is 7742735762.

Do NOT confuse customer's number with business number.

CONTACT SECTION:

Create a beautiful contact section.

Show:
- WhatsApp
- Call
- Order online
- Delivery information

WhatsApp:
7742735762

Call:
7742735762

ABOUT SECTION:

Create a short professional section explaining:

"Fresh drinking water supplied directly to homes, offices, shops, events and businesses."

Do not invent fake certifications, fake addresses or fake claims.

FOOTER:

Include:
- RAJESH WATER
- Products
- Home
- Contact
- WhatsApp
- Phone
- Copyright

RESPONSIVE DESIGN:

Must work perfectly on:
- Mobile
- Tablet
- Laptop
- Desktop

Mobile:
- Hamburger menu
- Sticky cart button
- Floating WhatsApp and call buttons
- Product cards optimized for small screens

ANIMATION:

Use:
- GSAP
- ScrollTrigger
- CSS transitions
- subtle floating animation
- mouse parallax
- hover animations
- reveal animations
- scale animations
- fade animations

Do not overdo animations.

PERFORMANCE:

- Lazy load images
- Optimize animations
- Avoid huge video files
- Avoid unnecessary libraries
- Respect prefers-reduced-motion
- Keep website fast
- Do not block page rendering

TECH STACK:

If React project:
- React
- Vite
- Tailwind CSS
- GSAP
- React Icons
- localStorage for cart

Keep components clean.

Suggested structure:

src/
  components/
    Navbar.jsx
    Hero.jsx
    ProductCard.jsx
    ProductSection.jsx
    Cart.jsx
    Checkout.jsx
    FloatingActions.jsx
    About.jsx
    Contact.jsx
    Footer.jsx

  data/
    products.js

  context/
    CartContext.jsx

  pages/
    Home.jsx

  utils/
    whatsapp.js

  App.jsx
  main.jsx

Make the website functional, not just a visual mockup.

IMPORTANT FINAL REQUIREMENT:

The website must feel like a real water supply ordering website.

Do not create unnecessary pages or unnecessary features.

Focus on:
1. Beautiful homepage
2. Bottle products
3. Cart
4. Minimum 50 bottle order
5. Customer details
6. WhatsApp order
7. Contact
8. Smooth professional animations
9. Online remote images
10. Mobile responsiveness

Build everything completely and test for errors.