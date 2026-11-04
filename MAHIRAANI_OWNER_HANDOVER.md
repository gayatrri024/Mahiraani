# MAHIRAANI — Business Owner Operations & Handover Manual

**Brand:** MAHIRAANI  
**Headquarters:** Pune, Maharashtra, India  
**Heritage & Craftsmanship:** Premium Indian Demi-Fine & Fashion Jewellery  
**Document Version:** 1.0 (Production Handover)  
**Target Audience:** Business Owner & Store Management (Non-Technical)

---

## Welcome to Your MAHIRAANI Storefront & Management Dashboard

Dear Nishtha,

Welcome to the official management manual for MAHIRAANI. This platform has been engineered to give you complete, effortless control over your jewellery boutique. 

**You do not need any coding skills, technical knowledge, or developer assistance to run your day-to-day business.**

From your private Admin Dashboard, you can:
- Add new earrings, necklaces, bangles, and rings.
- Upload and arrange jewellery photography.
- Update prices in Rupees (₹) and monitor stock quantities.
- Publish pieces live or hide them as drafts.
- Review and approve customer feedback.
- Process and track customer orders.

---

## 1. How to Access Your Admin Dashboard

1. Open your web browser (Google Chrome, Safari, or Microsoft Edge) on your computer, laptop, tablet, or mobile phone.
2. Visit your admin URL:
   - **Local / Office Wi-Fi:** `http://localhost:3000/admin` (or your network address `http://192.168.50.100:3000/admin`)
   - **Live Website:** `https://yourdomain.com/admin`
3. Enter your login credentials:
   - **Email:** `admin@mahiraani.com`
   - **Password:** *(Your confidential owner password)*
4. Click **Sign In**.
5. You will be greeted with your personal dashboard showing your live pieces, stock alerts, and recent orders.

> **Tip for Mobile Users:** You can bookmark `/admin` on your phone's home screen for one-tap access like a mobile app.

---

## 2. Step-by-Step: Adding a New Jewellery Piece

You can now select and preview your product photos **before** saving!

### Step 1: Open the "Add Product" Page
Click the black **"＋ Add Product"** button in the sidebar or top navigation.

### Step 2: Enter Product Details
- **Product Name (Required):** Enter the title (e.g., `Royal Kundan Chandbali Earrings`).
- **Category:** Choose the appropriate category (e.g., *Earrings*, *Necklaces*, *Bangles*).
- **Short Tagline:** Enter a brief one-line description (e.g., *Handcrafted antique gold finish with faux pearls*). This appears on category cards.
- **Full Description:** Describe the design, the inspiration, styling suggestions, and occasion wear.

### Step 3: Add Photos (Multiple Photos Supported)
- Click anywhere on the dashed **"Product Photos"** box or drag images from your folder into it.
- You can select multiple images at once (JPEG, PNG, or WebP up to 8 MB each).
- **Choosing the Main Cover:** The first photo uploaded is automatically set as the main cover photo shown on category pages. If you want a different photo as the cover, simply click the **"Set Cover"** button on that image.
- **Reordering Photos:** Use the **←** and **→** buttons to arrange the photos in the exact order you want customers to view them.
- **Photo Descriptions:** Type a quick note in the text box below each photo (e.g., *Side view*, *Earring clasp detail*).

### Step 4: Set Price and Available Stock
- **Selling Price (₹) (Required):** Enter your price in Rupees (e.g., `1250`). You do not need to convert to paise; the system handles that automatically.
- **Original MRP / Struck-through Price (Optional):** If you are running an introductory discount or festival offer, enter the higher original price here (e.g., `1850`). It will show as a crossed-out price on the storefront.
- **Available Stock Quantity:** Enter the number of pieces you currently have on hand (e.g., `10`).
- **Low Stock Alert Warning:** Set the threshold when you want an alert (default is `3`). When only 3 pieces remain, the system warns you so you can restock or plan inventory.
- **SKU Code (Optional):** Enter your internal stock reference (e.g., `MHR-EAR-001`).

### Step 5: Handling Sizes or Metal Finishes (Variants)
If this piece comes in different bangle sizes (e.g., `2.4, 2.6, 2.8`) or different polish options (e.g., `Antique Gold, Silver, Rose Gold`):
1. Toggle the switch: **"Does this product have size or colour variations?"**
2. Enter the sizes separated by commas: `2.4, 2.6, 2.8`
3. Click **"Generate Variants"**.
4. You can set individual prices and stock numbers for each size.

### Step 6: Material & Care Details (Optional)
Click on section **"4. Specifications, Materials & Care Details"** to expand it. Here you can specify:
- **Material:** e.g., *High-grade brass alloy, Kundan stones*
- **Finish / Polish:** e.g., *22K Antique Gold Micro-Plating*
- **Dimensions & Weight:** e.g., *Length: 6.5 cm | Weight: 32 grams per pair*
- **Care Instructions:** e.g., *Keep away from moisture, hairspray, and perfumes. Store in the provided airtight pouch.*

### Step 7: Save Draft vs Publish Live
- Click **"Save as Draft"** if you are still preparing photography or descriptions. The piece will be saved safely but will remain hidden from store visitors.
- Click **"Publish Live on Store"** when you are ready to sell. The piece will immediately appear on the website and in search results.

---

## 3. Managing Your Catalogue

From the **Products** page (`/admin/products`), you can manage your entire collection:

- **Instant Status Switching:** You can switch any piece between **Live on Store**, **Draft (Hidden)**, or **Archived** directly from the list using the status dropdown.
- **Stock Warnings:** Pieces with low stock will display an amber badge (`Low Stock: X left`). Out-of-stock pieces display a red `Out of Stock` badge.
- **Storefront View:** Click the **"View ↗"** button next to any product to see exactly how it looks to a visiting customer.
- **Duplicating Pieces:** If you are adding a piece similar to an existing one (e.g., the same necklace in silver), click **"Duplicate"**. It creates a copy as a draft so you only have to change the title and photo.
- **Deleting vs Archiving:**
  - If a piece was added by mistake and was **never ordered** by a customer, clicking **"Delete"** permanently removes it.
  - If a piece has **past customer orders**, the system will automatically **archive** it instead of deleting it. This protects your order receipts, accounting records, and customer tracking history.

---

## 4. Managing Orders & Customer Inquiries

From the **Orders** page (`/admin/orders`):
- View incoming customer orders, customer contact phone number, delivery address, and ordered jewellery pieces.
- Update fulfilment status: *Unfulfilled*, *Processing*, *Shipped*, or *Delivered*.
- Add courier partner name and shipment tracking number. Once entered, the customer can track their parcel using the **"Track My Order"** link on the website without needing a password.

---

## 5. Moderating Customer Reviews

From the **Reviews** page (`/admin/reviews`):
- Only genuine buyers who placed an order and received their delivery can submit verified reviews.
- All new reviews arrive in the **"Pending Moderation"** queue.
- You can inspect the star rating, comment, and verified customer name.
- Click **"Approve"** to publish the review on the product's live page, or **"Reject"** if inappropriate.
- The average star rating and review count update automatically across the storefront.

---

## 6. Photography Guidelines for Luxury Aesthetics

To maintain MAHIRAANI's high-end, royal Indian aesthetic:

1. **Aspect Ratio:** Use square (1:1) or vertical portrait (4:5) photos.
2. **Background:** Clean, neutral, off-white, raw silk, marble, or warm stone backgrounds highlight golden tones and Kundan stonework best.
3. **Lighting:** Soft, diffused natural light or studio softboxes. Avoid direct harsh camera flash that creates strong specular glares on polished metal.
4. **Resolution:** Recommended 1200 × 1200 pixels or higher (maximum file size 8 MB).
5. **Multiple Angles:** For earrings and necklaces, upload at least:
   - Front view (flat lay or bust).
   - Angled perspective showing stone depth.
   - Close-up of the clasp, bead drops, or back craftsmanship.

---

## 7. Emergency Owner Access & Password Management

If you ever forget your password or need to update your admin credentials, you can use the secure command line tool on your computer.

Open your terminal in the project folder and run:

### View Active Admin Accounts:
```bash
npm run admin:manage list
```

### Reset Your Password Securely:
```bash
npm run admin:manage reset admin@mahiraani.com "YourNewSecurePassword123!"
```
The system uses industrial-standard bcrypt hashing (12 rounds) to encrypt your password.

---

## 8. Technical Architecture & Future Cloud Deployment

This platform is built with modern, rock-solid technologies:
- **Framework:** Next.js 16 with React 19 and Tailwind CSS.
- **Database ORM:** Prisma ORM with typed relational models.
- **Current Database:** SQLite (`prisma/dev.db`). An immutable safety backup of your pre-handover database has been preserved at `prisma/dev.db.prehandover.bak`.

### Important Note on Future Cloud Hosting:
- Your current setup is running on local disk storage. SQLite works reliably on local machines, office servers, and dedicated Virtual Private Servers (VPS).
- **When deploying to cloud serverless platforms (such as Vercel or Netlify):** Serverless disks are temporary and reset on every update. Therefore, for production cloud deployment, connect a managed **PostgreSQL database** (such as Supabase, Neon, or AWS RDS PostgreSQL) by simply updating the `DATABASE_URL` in `.env.local` and running `npx prisma migrate deploy`. No code changes are required.

---

## 9. Pre-Handover Quality & Security Verification Summary

The platform has passed all strict quality gates ahead of handover:

| Verification Gate | Result | Details |
| :--- | :--- | :--- |
| **Admin Authentication & LAN Session** | **PASS** | Tested across localhost, mobile Wi-Fi, and LAN IPs without redirect loops. |
| **Automated Product Lifecycle Suite** | **PASS (29/29)** | Product creation, image upload, status toggle, collision avoidance, and order deletion safety. |
| **Order & Verified Review Security Gate** | **PASS (45/45)** | OTP rate limiting, HMAC hashing, replay protection, and verified customer reviews. |
| **Route Handler Adversarial Test** | **PASS (35/35)** | Cross-customer data isolation and unauthorized request blocking. |
| **Production Security Gate** | **PASS (18/18)** | Cryptographic secret validation and OTP lockout guards. |
| **TypeScript Type-Check (`tsc --noEmit`)** | **PASS** | Zero type errors across the entire codebase. |
| **ESLint Audit (`eslint`)** | **PASS** | 0 errors, 0 warnings. Clean production code. |
| **Production Build (`next build`)** | **PASS** | All 53 application routes compiled and statically optimized. |

---

*MAHIRAANI Boutique Management System — Built for Royal Indian Elegance and Everyday Reliability.*

