# Cart Integration Guide

## Overview
The sign builder now has fully functional "Add to Cart" and "Buy Now" buttons that capture the design, product specifications, and send everything to Shopify's cart.

## How It Works

### 1. Add to Cart Button
- Generates a high-quality image of the current design (PNG, 150 DPI)
- Captures all design data (objects, canvas size, sides configuration)
- Sends to Shopify cart with the following attributes:
  - **Design Data**: JSON with all objects and canvas dimensions
  - **Design Image**: PNG image of the design
  - **Canvas Size**: Display size (e.g., "24\" × 18\"")
  - **Sides**: Number of sides (1 or 2)
  - **Quantity**: Number of items ordered

### 2. Buy Now Button
- Same as Add to Cart but redirects to checkout immediately after adding

### 3. Design Image Generation
The `generateDesignImage()` function:
- Creates a 150 DPI canvas for quality
- Renders all objects (text, shapes, images) in their exact positions
- Exports as PNG (90% quality for balance between quality and size)
- Handles image CORS by setting `crossOrigin="anonymous"`

## Requirements

### Shopify Store Setup
1. Set `NEXT_PUBLIC_SHOPIFY_STORE` environment variable:
   \`\`\`
   NEXT_PUBLIC_SHOPIFY_STORE=your-store.myshopify.com
   \`\`\`

2. Product must have at least one variant

3. The Shopify product ID and variant ID should be available in window:
   \`\`\`javascript
   window.SHOPIFY_PRODUCT = { /* product data */ }
   window.SHOPIFY_VARIANT_ID = 'gid://...'
   \`\`\`

## Data Structure

### Cart Attributes Format
\`\`\`json
{
  "Design Data": {
    "front": [/* CanvasObject array */],
    "back": [/* CanvasObject array */],
    "canvasWidth": "24",
    "canvasHeight": "18"
  },
  "Design Image": "data:image/png;base64,...",
  "Canvas Size": "24\" × 18\"",
  "Sides": "2",
  "Quantity": "5"
}
\`\`\`

### CanvasObject Structure
\`\`\`typescript
interface CanvasObject {
  id: string
  type: 'text' | 'shape' | 'image'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  // Text properties
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
  textColor?: string
  textAlign?: string
  // Shape properties
  shapeType?: 'rectangle' | 'circle'
  fill?: string
  stroke?: string
  strokeWidth?: number
  // Image properties
  src?: string
}
\`\`\`

## Shopify Liquid Integration

In your Shopify product template, add:
\`\`\`liquid
<!-- Sign Builder Designer - Compact Iframe Version -->
<div class="sign-builder-container" style="margin: 1rem 0;">
  <iframe
    id="designer-iframe"
    src="https://customsigns.vercel.app/?product={{ product.id }}&variant={{ product.selected_or_first_available_variant.id }}"
    style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; display: block;"
  ></iframe>
</div>

<script>
  window.SHOPIFY_PRODUCT = {{ product | json }};
  window.SHOPIFY_VARIANT_ID = "{{ product.selected_or_first_available_variant.id }}";
  window.SHOPIFY_STORE = {
    name: "{{ shop.name }}",
    currency: "{{ shop.currency }}"
  };
</script>
\`\`\`

## Testing

### Local Testing
1. Make sure the Shopify store domain is set in environment variables
2. Ensure you're using a valid product ID and variant ID
3. Open browser console to see debug logs (prefixed with `[v0]`)

### Common Issues

**"Unable to add to cart: Product variant not found"**
- Make sure `SHOPIFY_VARIANT_ID` is set in the window object
- Verify the iframe has access to window object

**"Failed to add item to cart"**
- Check browser console for detailed error
- Verify CORS settings allow requests from your domain to Shopify
- Ensure the variant ID is valid

## File Changes Made

1. `/lib/shopify-utils.ts` - Added `generateDesignImage()` function
2. `/components/sign-builder/top-toolbar.tsx` - Added cart handlers and updated buttons
3. `/app/api/cart/add/route.ts` - New API route for cart operations (if using server-side proxying)

## Future Enhancements

- Store design images in Shopify's file storage
- Add order notes with design specifications
- Support for payment plan selection in cart
- Order preview before checkout
