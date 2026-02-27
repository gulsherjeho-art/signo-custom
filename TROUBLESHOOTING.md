# Troubleshooting Guide - Sign Builder

## Issue: Product Metafields Not Showing

### Root Cause
The `SHOPIFY_PRODUCT` object is not being received by the iframe app because:
1. Product data is not being passed from Shopify Liquid template
2. The postMessage is not reaching the iframe 
3. The component mounts before data arrives

### Solution

**Step 1: Verify Shopify Liquid Template Installation**

The file `shopify-sign-builder.liquid` should be added to your Shopify theme's templates. To install:

1. Go to **Shopify Admin → Themes**
2. Click **Actions → Edit code** on your active theme
3. Navigate to **Snippets** folder
4. Click **Add a new snippet**
5. Name it `sign-builder`
6. Copy the entire content from `/public/shopify-sign-builder.liquid`
7. Save

**Step 2: Add Snippet to Product Template**

1. In the same theme editor, go to **Templates → product.liquid**
2. Add this line where you want the designer to appear:
\`\`\`liquid
{% include 'sign-builder' %}
\`\`\`
3. Save

**Step 3: Verify Product Has Metafields**

1. Go to **Shopify Admin → Products**
2. Select the product you're testing
3. Scroll to **Custom data** section
4. Verify you have these metafields in the `custom` namespace:
   - `description` (Single line text)
   - `materials` (JSON) - Example: `["Aluminum", "Acrylic"]`
   - `sizes` (JSON) - Example: `["12x12", "18x12"]`
   - `price_per_sqft` (Single line text) - Example: `"5.50"`

### Debug Steps

**Open Browser Console** and check for these logs:

1. After page load, you should see:
\`\`\`
[v0] Layout initialized, waiting for product data from Shopify...
\`\`\`

2. When the iframe loads, you should see:
\`\`\`
[v0] Received Shopify product data: {id: 123..., title: "...", ...}
[v0] Set variant ID: gid://shopify/ProductVariant/12345
\`\`\`

3. When the sidebar loads, you should see:
\`\`\`
[v0] Product loaded event received, reloading data...
[v0] Loading product metafields. Product object: {...}
[v0] Extracted metafields: {materials: [...], sizes: [...], ...}
\`\`\`

---

## Issue: "Product Variant Not Found" on Add to Cart

### Root Cause
The variant ID is not being extracted from the product data.

### Solution

**Check the following in Browser Console:**

1. Type this to see the product data:
\`\`\`javascript
console.log(window.SHOPIFY_PRODUCT)
console.log(window.SHOPIFY_VARIANT_ID)
\`\`\`

2. The output should look like:
\`\`\`javascript
// SHOPIFY_PRODUCT should have this structure:
{
  id: 123456,
  title: "My Sign",
  selected_or_first_available_variant: {
    id: "gid://shopify/ProductVariant/12345",
    price: "9.99"
  },
  metafields: [...]
}

// SHOPIFY_VARIANT_ID should be:
"gid://shopify/ProductVariant/12345"
\`\`\`

### Common Problems

**Problem 1: Variant ID is null**
- Solution: The postMessage from Shopify didn't include variant data
- Check: Make sure `shopify-sign-builder.liquid` includes `product.selected_or_first_available_variant.id`

**Problem 2: Product object is undefined**
- Solution: The app is not being loaded inside an iframe on the Shopify product page
- Check: Verify the snippet was properly added to `product.liquid`

**Problem 3: postMessage timing issue**
- Solution: Data arrives after component mounts
- This is handled automatically - just wait a moment and try again

---

## Issue: Metafields Show as Empty

### Check Your JSON Format

Make sure JSON metafields are valid. Examples:

**Materials (correct):**
\`\`\`json
["Aluminum", "Acrylic", "PVC"]
\`\`\`

**Sizes (correct):**
\`\`\`json
["12x12", "18x12", "24x18"]
\`\`\`

**Common mistakes:**
- Extra spaces or line breaks
- Single quotes instead of double quotes
- Missing commas
- Missing brackets

---

## Testing Locally

If you're testing without Shopify:

1. Open Browser DevTools Console
2. Manually set the data:
\`\`\`javascript
window.SHOPIFY_PRODUCT = {
  id: 12345,
  title: "Test Product",
  selected_or_first_available_variant: {
    id: "gid://shopify/ProductVariant/12345",
    price: "9.99"
  },
  metafields: [
    {namespace: "custom", key: "materials", value: '["Aluminum","Acrylic"]'},
    {namespace: "custom", key: "sizes", value: '["12x12","18x12"]'},
    {namespace: "custom", key: "description", value: "Great sign"},
    {namespace: "custom", key: "price_per_sqft", value: "5.50"}
  ]
}

window.SHOPIFY_VARIANT_ID = "gid://shopify/ProductVariant/12345"

// Trigger the event
window.dispatchEvent(new CustomEvent('shopify-product-loaded', {detail: window.SHOPIFY_PRODUCT}))
\`\`\`

3. Refresh the page and check if metafields appear

---

## Full Debug Checklist

- [ ] Shopify `sign-builder` snippet installed in theme
- [ ] Snippet added to `product.liquid` template
- [ ] Product has all 4 metafields in `custom` namespace
- [ ] Metafield values are valid JSON (if JSON type)
- [ ] Product has at least one variant
- [ ] Browser console shows no errors
- [ ] Check logs show product data being received
- [ ] `window.SHOPIFY_PRODUCT` is not undefined
- [ ] `window.SHOPIFY_VARIANT_ID` contains a valid ID
