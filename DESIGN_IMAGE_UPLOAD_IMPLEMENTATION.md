# Design Image Upload & Pricing Fix - Implementation Summary

## Issues Fixed

1. ✅ **Large design data bloating postMessage** - Removed base64 image strings and JSON design data from properties
2. ✅ **Missing design images in cart** - Now uploads actual design images to Cloudinary with permanent URLs
3. ✅ **Incorrect price display** - Fixed to calculate unit price separately from total price
4. ✅ **Cart redirect on add** - "Add to Cart" now stays on page; only "Buy Now" redirects to checkout

## New Components

### 1. API Endpoint: `/app/api/upload-design/route.ts`
- Handles image blob uploads from the iframe
- Proxies to Cloudinary for secure storage
- Returns permanent image URL for cart properties
- Stores images in `signo_designs/` folder with timestamp

### 2. Upload Utilities: `/lib/shopify-utils.ts`
Added two new functions:
- `uploadDesignImage()` - Captures canvas element and uploads to Cloudinary
- `divToCanvas()` - Fallback conversion for HTML elements to canvas

### 3. Canvas Data Attribute: `/components/sign-builder/design-canvas.tsx`
- Added `data-design-canvas` attribute to main canvas container
- Allows easy targeting for image capture and upload

## Updated Components

### 1. Top Toolbar: `/components/sign-builder/top-toolbar.tsx`
**Changes:**
- Added import for `uploadDesignImage` utility
- Updated `handleAddToCart()`:
  - Calculates unit price separately (not including quantity multiplier)
  - Calls `uploadDesignImage()` to upload design
  - Includes design image URL in postMessage
  - Sends correct pricing: `Price Per Unit` and `Total Price`
  - Includes `_Custom Design Image` property for cart display

- Updated `handleBuyNow()`:
  - Same pricing fix and image upload logic
  - Still redirects to checkout after adding to cart

### 2. Shopify Template: `/public/shopify-product-template.liquid`
**Changes:**
- Updated message listener to accept `designImageUrl`
- Updated `addToCart()` function to:
  - Extract pricing from properties
  - Log extracted prices for debugging
  - Send success response with pricing data back to iframe

## Pricing Logic

### Calculation (in React component)
\`\`\`
sqFt = (width × height) / 144
basePrice = sqFt × pricePerSqft
sidesMultiplier = (sides === 2) ? 1.5 : 1
unitPrice = basePrice × sidesMultiplier
totalPrice = unitPrice × quantity
\`\`\`

### Sent to Shopify
\`\`\`
properties = {
  'Price Per Unit': unitPrice.toFixed(2),
  'Total Price': totalPrice.toFixed(2),
  ...other properties
}
\`\`\`

## Cart Properties Sent

\`\`\`javascript
{
  'Size': '18" × 24"',
  'Sides': '1 Side' or '2 Sides',
  'Quantity': '1',
  'Price Per Unit': '9.00',      // Unit price
  'Total Price': '9.00',         // Total for all units
  '_Custom Design Image': 'https://res.cloudinary.com/...',
  '_thumbnail': 'https://res.cloudinary.com/...'
}
\`\`\`

## Environment Variables Required

\`\`\`
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=ml_default
\`\`\`

## Flow Diagram

\`\`\`
User Creates Design
        ↓
Clicks "Add to Cart"
        ↓
handleAddToCart() starts
        ↓
Calculate unit + total prices
        ↓
uploadDesignImage() captures canvas
        ↓
POST to /api/upload-design
        ↓
API proxies to Cloudinary
        ↓
Cloudinary returns permanent URL
        ↓
Build cart properties with URL + pricing
        ↓
postMessage to parent window
        ↓
Shopify template receives message
        ↓
Add to cart via Shopify Cart API
        ↓
Stay on page OR redirect (if checkout=true)
\`\`\`

## Testing Checklist

- [ ] Create a design with text/images
- [ ] Click "Add to Cart"
- [ ] Check browser console for upload success message
- [ ] Verify design image appears in Shopify cart
- [ ] Verify pricing shows: Price Per Unit and Total Price
- [ ] Click "Continue Shopping" and verify page doesn't reload
- [ ] Click "Buy Now" and verify checkout redirect works
- [ ] Verify cart shows custom design image thumbnail

## Files Modified/Created

**Created:**
- `/app/api/upload-design/route.ts` - Image upload endpoint
- `/CLOUDINARY_SETUP.md` - Cloudinary configuration guide

**Modified:**
- `/components/sign-builder/design-canvas.tsx` - Added data-design-canvas attribute
- `/components/sign-builder/top-toolbar.tsx` - Image upload + pricing fixes
- `/lib/shopify-utils.ts` - Added upload utility functions
- `/public/shopify-product-template.liquid` - Updated message handler

## Key Improvements

1. **Cleaner postMessage** - Only essential data sent, no massive strings
2. **Persistent images** - Designs stored permanently on Cloudinary, not re-generated
3. **Correct pricing** - Unit and total prices separated and clearly labeled
4. **Better UX** - Add to cart doesn't leave page, improving browsing experience
5. **Production-ready** - Cloudinary handles image hosting at scale
