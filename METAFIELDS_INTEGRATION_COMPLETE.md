# Product Metafields Integration - Complete Summary

## What Was Built

Your sign builder now pulls all product data directly from Shopify metafields and displays it in the Product panel of the left sidebar.

## Your Store Configuration

**Store URL**: signografx.myshopify.com

This has been set as the environment variable:
\`\`\`
NEXT_PUBLIC_SHOPIFY_STORE=signografx.myshopify.com
\`\`\`

## Data Currently Displayed

The Product panel in the left sidebar shows:

### 1. **Product Description**
- Source: `custom.description` metafield
- Display: Card at top of product panel
- Shows brief product information

### 2. **Price Per Square Foot**
- Source: `custom.price_per_sqft` metafield
- Display: Green card with formatted price
- Example: "$5.50 per sq. ft."

### 3. **Current Size & Calculator**
- Shows current canvas dimensions in inches
- If price_per_sqft is set, shows:
  - Area in square inches
  - Equivalent square footage
  - Useful for quick pricing

### 4. **Available Sizes** (from `custom.sizes`)
- Shows as clickable buttons
- Quick preset sizing
- Updates canvas immediately when clicked
- Supports both formats:
  - String: `"12x12"`, `"18x12"`
  - Object: `{width: 12, height: 12}`

### 5. **Material Selector** (from `custom.materials`)
- Dropdown menu with available options
- Pulled from `custom.materials` JSON array
- Customer can select their preferred material

## How It Works

\`\`\`
Shopify Product Page
        ↓
shopify-sign-builder.liquid sends product data
        ↓
iframe receives postMessage
        ↓
layout.tsx stores in window.SHOPIFY_PRODUCT
        ↓
left-sidebar.tsx extracts & displays metafields
\`\`\`

## Metafield Setup in Shopify

For each product, add these metafields in Admin > Products > [Product] > Custom data:

| Key | Type | Example Value |
|-----|------|----------------|
| `description` | Single line text | "Professional aluminum sign material" |
| `materials` | JSON | `["Aluminum", "Acrylic", "PVC"]` |
| `sizes` | JSON | `["12x12", "18x12", "24x18"]` |
| `price_per_sqft` | Single line text | `"5.50"` |

## Files Modified

1. **`/public/shopify-sign-builder.liquid`**
   - Now sends all product metafields via postMessage

2. **`/app/layout.tsx`**
   - Listens for product data from Shopify iframe
   - Stores in window.SHOPIFY_PRODUCT
   - Exposes store URL from environment variable

3. **`/components/sign-builder/left-sidebar.tsx`**
   - Extracts metafields on component mount
   - Displays in Product panel
   - Supports both array and object formats for sizes
   - Handles missing/invalid JSON gracefully

4. **`/lib/shopify-utils.ts`**
   - Added metafield extraction helpers
   - Design image generation function
   - Cart integration functions

## Console Debugging

When the app loads, check browser console (F12) for:

\`\`\`javascript
// Success indicators:
[v0] Received Shopify product data: { ... }
[v0] Loading product metafields: { ... }
[v0] Extracted metafields: {
  materials: ["Aluminum", "Acrylic"],
  sizes: ["12x12", "18x12"],
  description: "...",
  pricePerSqft: 5.50
}
\`\`\`

## Testing Checklist

- [ ] Visit product page in Shopify
- [ ] Check console for `[v0]` logs
- [ ] Verify description shows in Product panel
- [ ] Verify price per sqft shows
- [ ] Click size buttons - canvas should update
- [ ] Material dropdown should show all options
- [ ] Area calculation should update with new sizes

## Next Steps

1. Add metafields to your first product
2. Visit product page and verify data displays
3. Test cart functionality ("Add to Cart" sends all design data)
4. Test "Buy Now" (redirects to checkout with design in cart)

## Documentation Files

- **`SHOPIFY_METAFIELDS_SETUP.md`** - Complete setup guide with examples
- **`SHOPIFY_INSTALLATION.md`** - Quick start checklist
- **`CART_INTEGRATION.md`** - How cart & checkout work

All metafield data is now properly connected to your sign builder!
