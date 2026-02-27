# How Metafields Work in Sign Builder

## Overview
The Sign Builder app displays Shopify product metafields in the **Product Panel** on the left sidebar. The metafields are fetched from your Shopify store and automatically displayed when you load the app.

## What Metafields Are Displayed

The app looks for these metafields in the **`custom` namespace** of your Shopify products:

| Metafield Key | Type | Display Location | Example Value |
|---|---|---|---|
| `description` | Single line text | Product Description card (top) | "Premium vinyl signs for outdoor use" |
| `price_per_sqft` | Single line text | Price card | "5.50" |
| `sizes` | JSON | Available Sizes buttons | `["12x12", "18x12", "24x18"]` |
| `materials` | JSON | Material dropdown | `["Aluminum", "Acrylic", "PVC"]` |

## How to Setup Metafields in Shopify

1. Go to **Shopify Admin → Products**
2. Select a product
3. Scroll to **Custom data** section → **Metafields**
4. Click **Add metafield** and create these four fields:

### Field 1: Description
- **Namespace:** `custom`
- **Key:** `description`
- **Type:** Single line text
- **Value:** Your product description

### Field 2: Price Per Sqft
- **Namespace:** `custom`
- **Key:** `price_per_sqft`
- **Type:** Single line text
- **Value:** `5.50` (or your price)

### Field 3: Sizes
- **Namespace:** `custom`
- **Key:** `sizes`
- **Type:** JSON
- **Value:** `["12x12", "18x12", "24x18"]` or `[{"width": 12, "height": 12}, {"width": 18, "height": 12}]`

### Field 4: Materials
- **Namespace:** `custom`
- **Key:** `materials`
- **Type:** JSON
- **Value:** `["Aluminum", "Acrylic", "PVC"]`

## How to Install on Your Shopify Product Page

### Option 1: Use HTML Template (Simplest)
1. Copy the content from `/public/shopify-product-template.html`
2. In Shopify Admin:
   - Go to **Settings → Files → Add files**
   - Upload as `sign-builder-template.html`
   - Copy the URL

3. In your product template (`product.liquid`):
   \`\`\`liquid
   <!-- Add this where you want the sign builder to appear -->
   <div id="sign-builder-container" style="width: 100%; min-height: 600px;">
     {% include 'sign-builder-template' %}
   </div>
   \`\`\`

### Option 2: Use Shopify App Embed
If using Shopify's app embed system, the template file is already provided at `/public/shopify-product-template.html`.

## How the Data Flow Works

\`\`\`
1. Shopify Product Page
   ↓
   Loads iframe pointing to: https://customsigns.vercel.app
   ↓
2. Shopify Template (HTML)
   ↓
   Uses postMessage() to send product data + metafields to iframe
   ↓
3. Sign Builder App (React)
   ↓
   Receives message in layout.tsx
   ↓
   Sets window.SHOPIFY_PRODUCT
   ↓
4. Left Sidebar Component
   ↓
   Reads window.SHOPIFY_PRODUCT
   ↓
   Extracts and displays metafields:
   - Product Description
   - Price Per Sqft
   - Available Sizes (buttons)
   - Material dropdown
\`\`\`

## Product Panel Sections (Displayed Order)

The **Product Panel** (when you click the "Product" tab) displays:

1. **Product Description** - From `custom.description` metafield
2. **Price per sq. ft.** - From `custom.price_per_sqft` metafield
3. **Current Size Display** - Shows canvas dimensions + area calculation
4. **Custom Size Input** - Manual width/height entry
5. **Available Sizes** - Buttons loaded from `custom.sizes` metafield
6. **Material Dropdown** - Loaded from `custom.materials` metafield

## Troubleshooting

### Metafields Not Showing?
1. Open browser console (F12)
2. Look for logs starting with `[v0]` and `[Shopify Template]`
3. Check:
   - `[Shopify Template] Sending product data:` → Shows if template is sending data
   - `[v0] Loading product metafields. Product object:` → Shows if app received data
   - `[v0] Processing X metafields` → Shows if metafields were found

### Common Issues

**"SHOPIFY_PRODUCT not found"**
- Template not installed on product page
- Metafields not added to product
- Check browser console for `[Shopify Template]` logs

**Metafields array is empty**
- Metafields not created in Shopify
- Wrong namespace (must be `custom`)
- Wrong key names

**JSON Parsing errors**
- Metafield value is not valid JSON
- For sizes/materials, use: `["item1", "item2"]` format

## Files Reference

- **Template:** `/public/shopify-product-template.html`
- **App receives data in:** `/app/layout.tsx`
- **Displays metafields in:** `/components/sign-builder/left-sidebar.tsx` (Product Panel)
- **Extracts metafields in:** Lines 170-211 of left-sidebar.tsx
