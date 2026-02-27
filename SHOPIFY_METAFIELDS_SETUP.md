# Shopify Metafields Setup & Product Details Integration

## Overview

The sign builder now automatically fetches and displays product metafields from your Shopify store. This includes description, available sizes, materials, and pricing information.

## Store Configuration

Your Shopify store URL is: `signografx.myshopify.com`

This is set as the environment variable:
\`\`\`
NEXT_PUBLIC_SHOPIFY_STORE=signografx.myshopify.com
\`\`\`

## Required Metafields

Add the following metafields to your Shopify products at:
**Admin > Products > [Product] > Custom data > Metafields**

### 1. Description (Single line text)
- **Namespace**: `custom`
- **Key**: `description`
- **Type**: Single line text
- **Value**: Brief product description
- **Example**: "Professional aluminum sign material with weather-resistant coating"

### 2. Materials (JSON)
- **Namespace**: `custom`
- **Key**: `materials`
- **Type**: JSON
- **Value**: Array of available materials
- **Example**:
\`\`\`json
["Aluminum", "Acrylic", "PVC", "Corrugated Plastic"]
\`\`\`

### 3. Sizes (JSON)
- **Namespace**: `custom`
- **Key**: `sizes`
- **Type**: JSON
- **Value**: Array of available sizes (can be strings or objects)
- **Example - String format**:
\`\`\`json
["12x12", "18x12", "24x18", "36x24", "48x36"]
\`\`\`
- **Example - Object format**:
\`\`\`json
[
  {"width": 12, "height": 12, "label": "12\"×12\""},
  {"width": 18, "height": 12, "label": "18\"×12\""},
  {"width": 24, "height": 18, "label": "24\"×18\""}
]
\`\`\`

### 4. Price Per Square Foot (Single line text)
- **Namespace**: `custom`
- **Key**: `price_per_sqft`
- **Type**: Single line text
- **Value**: Price as decimal number
- **Example**: `5.50`

## Data Flow

### 1. Product Page Load
When a customer visits a product page in Shopify with the sign builder app installed, the Shopify Liquid template (`shopify-sign-builder.liquid`) runs.

### 2. Data Transmission
The Liquid template:
- Collects all product data including metafields using Shopify Liquid
- Serializes the data as JSON
- Sends it to the iframe via `postMessage()` API

\`\`\`javascript
// From shopify-sign-builder.liquid
iframe.contentWindow.postMessage({
  type: 'SHOPIFY_PRODUCT_DATA',
  product: {
    id, title, handle,
    metafields, // All custom metafields
    images
  }
}, '*');
\`\`\`

### 3. Iframe Reception
The app layout (`app/layout.tsx`) listens for the message:

\`\`\`javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'SHOPIFY_PRODUCT_DATA') {
    window.SHOPIFY_PRODUCT = event.data.product;
    window.dispatchEvent(new CustomEvent('shopify-product-loaded'));
  }
});
\`\`\`

### 4. Component Data Loading
The left sidebar (`components/sign-builder/left-sidebar.tsx`) extracts metafields:

\`\`\`javascript
const product = window.SHOPIFY_PRODUCT;
const materials = product.metafields
  .filter(m => m.namespace === 'custom' && m.key === 'materials')
  .map(m => JSON.parse(m.value));
\`\`\`

## Product Panel Display

The product details section in the left sidebar shows:

1. **Product Description** - From `custom.description` metafield
2. **Price Per Sq Ft** - From `custom.price_per_sqft` metafield with $ symbol
3. **Current Size Display** - Shows current canvas dimensions
4. **Size Calculator** - Shows square footage calculation if price_per_sqft is set
5. **Available Sizes** - Buttons for quick preset sizes from `custom.sizes`
6. **Material Selector** - Dropdown with options from `custom.materials`

## Metafield Value Format Support

### Materials
- **Expected**: Array of strings
- **Accepted formats**:
  - `["Aluminum", "Acrylic"]` ✓
  - `"Aluminum"` (will convert to array) ✓

### Sizes  
- **Expected**: Array of size values
- **Accepted formats**:
  - String format: `["12x12", "18x12"]` ✓
  - Object format: `[{width: 12, height: 12}]` ✓
  - Mixed: Will parse dimensions from strings or objects ✓

### Description
- **Expected**: Plain text string
- Supports up to 255 characters

### Price Per Sq Ft
- **Expected**: Decimal number as string
- **Examples**: `"5.50"`, `"10.00"` ✓
- Will be converted to float for calculations

## Testing the Integration

1. **Verify Metafields Exist**
   - Go to your product in Shopify admin
   - Check Custom data section
   - All four metafields should be visible

2. **Open Sign Builder**
   - Navigate to product page with sign builder app
   - Check browser console for `[v0]` logs
   - Should see: "Extracted metafields: {...}"

3. **Verify Display**
   - Product panel should show all data
   - Sizes should be clickable buttons
   - Materials should be selectable in dropdown
   - Price calculation should work for size/sqft

## Troubleshooting

### Metafields Not Showing

**Issue**: Product panel shows empty metafields
\`\`\`
[v0] Loading product metafields: undefined
\`\`\`

**Solution**:
1. Verify metafields are added to product in Shopify admin
2. Check metafield namespace is exactly `custom`
3. Check metafield keys match exactly: `description`, `materials`, `sizes`, `price_per_sqft`
4. Ensure values are properly formatted JSON for array fields

### JSON Parse Error

**Issue**: 
\`\`\`
[v0] Error parsing metafield: SyntaxError: Unexpected token
\`\`\`

**Solution**:
- Verify JSON syntax in metafield values
- Common issues:
  - Single quotes instead of double quotes: `['Material']` ❌ should be `["Material"]` ✓
  - Missing commas: `["A","B"]` ✓
  - Trailing commas: `["A","B",]` ❌

### Sizes Not Parsing

**Issue**: Size buttons don't appear or show NaN

**Solution**:
- For string format: ensure format is `"12x12"` (number-x-number)
- For object format: ensure properties are `width` and `height` (not `w`, `h`, `size`)

## API Reference

### Window Objects

\`\`\`javascript
// Product data from Shopify
window.SHOPIFY_PRODUCT = {
  id: "gid://shopify/Product/...",
  title: "Professional Sign",
  metafields: [
    {
      namespace: "custom",
      key: "description",
      value: "...",
      type: "single_line_text"
    },
    // ... more metafields
  ]
}

// Store URL
window.NEXT_PUBLIC_SHOPIFY_STORE = "signografx.myshopify.com"
\`\`\`

### Event Listeners

\`\`\`javascript
// Listen for product data loaded
window.addEventListener('shopify-product-loaded', () => {
  console.log('Product data ready:', window.SHOPIFY_PRODUCT);
});

// Listen for iframe resize requests
window.addEventListener('message', (event) => {
  if (event.data.type === 'RESIZE_IFRAME') {
    console.log('New height:', event.data.height);
  }
});
\`\`\`

## Environment Variables

**Project Environment Variables** (set in Vercel):
- `NEXT_PUBLIC_SHOPIFY_STORE` = `signografx.myshopify.com`

## File Changes

- `/public/shopify-sign-builder.liquid` - Sends product data via postMessage
- `/app/layout.tsx` - Listens for and stores product data
- `/components/sign-builder/left-sidebar.tsx` - Displays metafield data in UI
- `/lib/shopify-utils.ts` - Helper functions for metafield extraction
