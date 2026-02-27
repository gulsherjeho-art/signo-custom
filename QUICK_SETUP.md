# Quick Setup Checklist

## Step 1: Add Metafields to Shopify Product
- [ ] Go to Shopify Admin → Products → Your Product
- [ ] Scroll to "Custom data" → Metafields
- [ ] Add 4 metafields in namespace `custom`:
  - [ ] `description` = "Your description text"
  - [ ] `price_per_sqft` = "5.50"
  - [ ] `sizes` = `["12x12", "18x12", "24x18"]`
  - [ ] `materials` = `["Aluminum", "Acrylic", "PVC"]`

## Step 2: Install Template on Product Page

Copy the template code from `/public/shopify-product-template.html` into your `product.liquid` theme file:

\`\`\`liquid
<!-- In product.liquid, add this section -->
<div id="sign-builder">
  <!-- Copy entire HTML from shopify-product-template.html here -->
</div>
\`\`\`

OR use the liquid embed directly:

\`\`\`liquid
{% capture template_code %}
<!-- Entire content from shopify-product-template.html -->
{% endcapture %}
{{ template_code }}
\`\`\`

## Step 3: Test

1. Visit your product page on Shopify
2. Open browser console (F12)
3. Look for these logs:
   - `[Shopify Template] Sending product data:` ✓
   - `[v0] Loading product metafields. Product object:` ✓
   - `[v0] Processing X metafields` ✓

4. Click the "Product" tab in the left sidebar
5. Verify you see:
   - Product Description
   - Price per sq. ft.
   - Available Sizes buttons
   - Material dropdown

## What the Template Does

The `shopify-product-template.html` file:
1. Creates an iframe pointing to https://customsigns.vercel.app
2. **Extracts all product data including metafields from Shopify**
3. Sends this data to the iframe via postMessage()
4. The Sign Builder app receives it and displays in the Product Panel

## Key Files

- **Template to use:** `shopify-product-template.html`
- **Full documentation:** `HOW_METAFIELDS_WORK.md`
- **App receives data:** `app/layout.tsx`
- **Displays data:** `components/sign-builder/left-sidebar.tsx` (Product Panel)
