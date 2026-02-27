# Shopify Variant Requirements & Add to Cart Integration

## ⚠️ Critical Variant Setup

Before using the Sign Designer on Shopify, ensure each product variant has:

### ✅ Real Price
- **Required**: Each variant MUST have a real price set
- **Format**: Any positive number (e.g., $10.00, $25.99)
- **Why**: Without a price, the cart API will reject the item
- **Location**: Shopify Admin → Products → [Product] → Variants → [Variant] → Price

### ✅ Real SKU (Recommended)
- **Format**: Any unique identifier (e.g., "CUSTOM-001")
- **Why**: Helps track inventory and orders

### ✅ Inventory Tracking (Recommended)
- **Status**: Can be set to "Track quantity" or "Don't track"
- **Why**: Set quantity if you want to limit availability

---

## Add to Cart PostMessage Format

The iframe sends the following exact postMessage structure:

\`\`\`javascript
window.parent.postMessage({
  type: "ADD_TO_CART",
  variantId: "YOUR_VARIANT_ID",           // Shopify variant ID (numeric)
  quantity: 1,                             // Number of items
  properties: {
    Width: "24\"",                        // Width in inches
    Height: "18\"",                       // Height in inches
    Size: "24\" × 18\"",                  // Formatted size
    Sides: "1 Side" | "2 Sides",          // Design sides
    Quantity: "1",                        // User quantity
    "Price Per Unit": "25.00",            // Price breakdown
    "Total Price": "25.00",               // Total price breakdown
    "Design Image": "data:image/png...",  // Base64 design image
    "Design Data": "{...json...}"         // Full design JSON data
  },
  checkout: false                          // false = add to cart, true = go to checkout
}, "*");
\`\`\`

---

## Shopify Template Response

The parent window listens for this message and:

1. **Validates** the variantId and quantity
2. **Sends to Shopify Cart API**:
   \`\`\`javascript
   fetch('/cart/add.js', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-Requested-With': 'XMLHttpRequest'
     },
     body: JSON.stringify({
       id: variantId,
       quantity: quantity,
       properties: properties
     })
   })
   \`\`\`
3. **Redirects** to cart or checkout based on checkout flag

---

## Setup Checklist

- [ ] Product created in Shopify
- [ ] At least 1 variant exists
- [ ] ✅ **Variant has a real price** (e.g., $25.00)
- [ ] Shopify product template includes the iframe code
- [ ] Designer iframe is embedded in product.liquid
- [ ] Test "Add to Cart" - item appears in cart with properties
- [ ] Test "Buy Now" - redirects to checkout
- [ ] Verify cart shows design properties and price

---

## Troubleshooting

### "Add to Cart Failed" Error
**Cause**: Variant price is $0.00 or missing
**Fix**: Set a real price in Shopify Admin

### Properties Not Showing in Cart
**Cause**: Cart template doesn't display custom properties
**Fix**: Ensure your Shopify cart template includes `{% if item.properties %}` block

### Wrong Quantity Added
**Cause**: Quantity selector in sidebar not working
**Fix**: Check that `quantity` state is properly updated in context

---

## Example Shopify Admin Setup

\`\`\`
Product: Custom Signs
├── Variant 1: 12×12"
│   ├── Price: $15.00 ✅
│   ├── SKU: SIGN-12x12
│   └── Inventory: Track quantity
├── Variant 2: 18×24"
│   ├── Price: $25.00 ✅
│   ├── SKU: SIGN-18x24
│   └── Inventory: Track quantity
└── Variant 3: 24×36"
    ├── Price: $35.00 ✅
    ├── SKU: SIGN-24x36
    └── Inventory: Track quantity
\`\`\`

Each variant needs a **real price** for the cart system to work!
