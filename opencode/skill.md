Now create and integrate a professional animation system for the water bottle website.

IMPORTANT:
Do not redesign the website.
Only improve the animation and interaction system.

Use:
- GSAP
- GSAP ScrollTrigger
- CSS transitions
- Lottie animations where useful

For ready-made animation assets, search legal/free animation libraries such as LottieFiles.

Useful sources:
LottieFiles water animations
LottieFiles website animations

Do NOT scrape random websites.
Do NOT use copyrighted animation files without permission.
Prefer free-to-use Lottie animations.

If a Lottie animation can be embedded remotely, use its official embed/CDN method instead of forcing me to manually download the file.

ANIMATION 1 — HERO BOTTLE

Place a large water bottle on the right side of the hero section.

Bottle animation:
- gentle floating
- slight rotation
- subtle scale
- soft shadow
- water ripple
- small particles
- smooth infinite loop

The bottle must NOT look like it is shaking.

ANIMATION 2 — MOUSE FOLLOW

The hero bottle should react to mouse movement.

When mouse moves:
- bottle follows mouse slightly
- maximum movement should be small
- use smooth interpolation
- add slight rotation

Example:
mouse moves right → bottle moves slightly right
mouse moves left → bottle moves slightly left
mouse moves upward → bottle moves slightly upward

Do not make it follow the cursor exactly.

ANIMATION 3 — BOTTLE HOVER

This is very important.

When mouse enters the bottle:

Bottle should:
- move upward
- slightly rotate
- scale up a little
- shadow becomes stronger
- water ripple appears

When mouse leaves:
- smoothly return to original position

The movement should feel like the bottle is floating upward in water.

ANIMATION 4 — SCROLL HERO

As the user scrolls down:

Bottle:
- moves slightly
- rotates
- scales down
- transitions toward the next section

Hero text:
- fades out
- moves upward
- slightly blurs if performance allows

Use GSAP ScrollTrigger with scrub.

ANIMATION 5 — PRODUCT CARDS

When products enter viewport:

Card animation:
- opacity 0 → 1
- translateY 50px → 0
- scale 0.95 → 1

Animate cards sequentially.

Bottle image:
- slight upward movement
- slight rotation

Button:
- subtle hover movement

ANIMATION 6 — PRODUCT HOVER

On product card hover:

- card moves upward 6-10px
- image moves upward
- image rotates 2-4 degrees
- shadow becomes stronger
- Add to Cart button moves slightly upward

Keep it fast and smooth.

ANIMATION 7 — WATER BACKGROUND

Create very subtle animated water effects:

- floating transparent circles
- small bubbles
- flowing wave shapes
- soft green/blue gradients

These should move slowly in the background.

Do NOT make the background distracting.

ANIMATION 8 — SECTION REVEAL

Every major section should reveal when entering viewport.

Use:
- fade
- slide
- scale
- stagger

Sections:
Hero
Products
About
Order
Contact
Footer

ANIMATION 9 — ADD TO CART

When user clicks Add to Cart:

- button briefly changes to "Added ✓"
- product image slightly jumps
- small animation travels toward cart icon
- cart counter updates smoothly

Example:

Bottle → flies toward cart icon

Keep this animation short.

ANIMATION 10 — CART

When cart opens:

- cart panel slides from right
- background overlay fades in
- products appear with stagger
- close button rotates slightly on hover

ANIMATION 11 — CHECKOUT SUCCESS

After valid WhatsApp order click:

Show a small success animation.

Use a free Lottie success/check animation if appropriate.

Message:

"Order Ready ✓"

Then:

"Opening WhatsApp..."

Do not fake an actual order confirmation because WhatsApp confirmation is handled by the customer/business.

ANIMATION 12 — FLOATING WHATSAPP BUTTON

Right side WhatsApp button:

- subtle floating animation
- small pulse
- hover scale
- tooltip:
  "Order on WhatsApp"

Do not use an aggressive infinite pulse.

ANIMATION 13 — CALL BUTTON

Right side call button:

- subtle hover scale
- slight icon movement
- tooltip:
  "Call Us"

ANIMATION 14 — NAVBAR SCROLL

When page scrolls:
- navbar background becomes slightly opaque
- backdrop blur increases
- navbar height reduces slightly
- shadow appears

Keep it smooth.

ANIMATION 15 — MOBILE

On mobile:
- reduce animation intensity
- disable expensive mouse-parallax
- maintain scroll reveal animations
- keep buttons easy to tap

Use:

@media (prefers-reduced-motion: reduce)

to reduce/disable non-essential animations.

IMPORTANT:

Do NOT put animation everywhere just for the sake of animation.

The website should look premium, smooth and modern.

The main visual focus should remain:

WATER BOTTLE
→ PRODUCTS
→ CART
→ ORDER
→ WHATSAPP

Use GSAP ScrollTrigger for scroll-linked animations because it supports scrub, pin and viewport-triggered animations.

Use LottieFiles for suitable ready-made water/loading/success animations.

Make all animations performant and clean.

Finally:
- remove animation bugs
- prevent horizontal scrolling
- prevent layout shifts
- check mobile
- check desktop
- check mouse hover
- check scrolling
- check Add to Cart animation
- check WhatsApp order flow
## IMAGE + ANIMATION SOURCE RULES

Do not ask the user to manually download images.

For bottle/product images:

* Use legal remote image URLs, public CDN images, or an image API.
* Images must load directly on the website.
* Do not scrape random websites.
* Do not use copyrighted images without permission.
* Keep image URLs/configuration in one separate file so they can easily be replaced later.
* Use high-quality realistic water bottle images matching 200 ML, 500 ML, 1 Litre and 2 Litre bottles.
* If a suitable API image is unavailable, use a clean remote placeholder instead of showing a broken image.

For ready-made animations:

* Use free/legal animations from LottieFiles or another legal animation library.
* Do not force the user to download animation files manually.
* If the animation library provides an official embed/CDN URL, use that directly.
* Use Lottie animations only where they actually improve the design.

For custom website animations:

* Use GSAP + ScrollTrigger.
* Create the scroll animations directly with code instead of downloading large animation videos.
* Use CSS/GSAP for bottle floating, mouse movement, hover, parallax, fade, reveal, scale and product-card animations.

IMPORTANT BOTTLE INTERACTION:

When the mouse comes near/over the main hero water bottle:

* The bottle should smoothly move upward.
* It should slightly tilt.
* It should slightly scale up.
* Add a subtle water/ripple effect.
* When the mouse leaves, it should smoothly return to its original position.

The effect must feel like the bottle is floating upward in water.

Do not make the bottle jump suddenly.

IMPORTANT SCROLL EFFECT:

When the user scrolls:

* Hero text should fade/move smoothly.
* Main bottle should move and rotate.
* Product cards should reveal one by one.
* Images should slightly scale and move.
* Water background elements should move slowly.
* Sections should have smooth reveal animations.

Use GSAP ScrollTrigger with scrub where appropriate.

Do not over-animate the website.

The website must remain fast, clean and professional on both desktop and mobile.

On mobile, disable mouse-follow effects and reduce heavy animations.
Respect `prefers-reduced-motion`.

FINAL RULE:

Do not tell the user to download images or animation files manually.

Use remote/legal sources whenever possible and generate the remaining animations using GSAP/CSS.
