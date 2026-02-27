# Verification Checklist

## What Should Work After Installation

### When You Visit: https://signografx.com/products/custom

**In the Sign Builder Left Panel, you should see:**

1. **Product Details Section:**
   - Product description
   - Price per sq. ft.
   - Current size (e.g., "24" × 18"")
   - Quick sizes buttons

2. **Here Metafields Are Section:** (NEW)
   - Description text from metafield
   - Price per Sq Ft: $X.XX
   - Sizes: List of available sizes (12"×12", 18"×12", etc.)
   - Materials: List of materials (Aluminum, Acrylic, PVC, etc.)

3. **Material Dropdown:**
   - Auto-populated from metafields (e.g., Aluminum, Acrylic)

4. **Canvas Editor:**
   - Ability to add text, shapes, images
   - Drag and resize elements

5. **Top Toolbar:**
   - Add to Cart button
   - Buy Now button (goes to checkout)

### Browser Console Should Show:

\`\`\`
[Shopify] Sign builder snippet loaded
[Shopify] Sending product data: {...}
[Shopify] Data sent successfully
[v0] Received Shopify product data: {...}
[v0] Extracted metafields: {materials: Array, sizes: Array, ...}
\`\`\`

## If It's NOT Working

**Missing data means:**
- Snippet not installed in theme
- OR product doesn't have metafields defined
- OR wrong product page being viewed

**Check these:**
1. Is snippet showing in Shopify Admin → Edit Code → Snippets?
2. Is `{% render 'sign-builder-iframe' %}` in your product.json template?
3. Do your products have metafields set up?
4. Is the page fully loaded? Try refreshing (Ctrl+Shift+R)

## Expected Final Result

Users can now:
- ✓ See product details and metafields automatically
- ✓ Design their custom sign in the editor
- ✓ Click "Add to Cart" to add design to their shopping cart
- ✓ Click "Buy Now" to go straight to checkout
- ✓ All design data and product info is saved to the cart item
