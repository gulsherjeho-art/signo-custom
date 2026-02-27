# Cloudinary Setup Guide

## Overview
The sign design app now uploads user-created designs as images to Cloudinary for permanent storage and display in Shopify carts.

## Configuration Required

### 1. Get Cloudinary Credentials
- Sign up for a free Cloudinary account: https://cloudinary.com
- From the Cloudinary Dashboard, get:
  - **Cloud Name** (visible on dashboard)
  - **Upload Preset** (create one or use default `ml_default`)

### 2. Add Environment Variables

Add these to your `.env.local` (for local development):
\`\`\`
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=ml_default
\`\`\`

Add these to your Vercel project settings:
1. Go to Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_PRESET`

**Note:** The `NEXT_PUBLIC_` prefix makes these available on the client side, which is needed for image uploads from the iframe.

## How It Works

### Upload Flow
1. User creates a design in the sign builder
2. When clicking "Add to Cart", the design is captured from the canvas
3. Canvas is converted to a PNG blob (via `canvas.toBlob()`)
4. Image is uploaded to our API endpoint: `/api/upload-design`
5. API forwards upload to Cloudinary
6. Cloudinary returns a secure permanent URL
7. URL is included in cart properties as `_Custom Design Image`

### File Structure
- **API Route:** `/app/api/upload-design/route.ts`
- **Upload Utility:** `/lib/shopify-utils.ts` → `uploadDesignImage()`
- **Canvas Component:** `/components/sign-builder/design-canvas.tsx`
- **Top Toolbar:** `/components/sign-builder/top-toolbar.tsx` → `handleAddToCart()`

## Cart Properties Sent

When adding to cart, these properties are included:
\`\`\`
{
  'Size': '18" × 24"',
  'Sides': '1 Side' or '2 Sides',
  'Quantity': '1',
  'Price Per Unit': '9.00',
  'Total Price': '9.00',
  '_Custom Design Image': 'https://res.cloudinary.com/...',
  '_thumbnail': 'https://res.cloudinary.com/...'
}
\`\`\`

The `_` prefix properties are typically shown as line item images in Shopify carts.

## Troubleshooting

### Images not uploading
1. Check browser console for `[v0]` error messages
2. Verify Cloudinary credentials in environment variables
3. Check that upload preset exists in Cloudinary
4. Ensure Canvas is accessible (check for `data-design-canvas` attribute)

### Images showing as blank
- Verify Cloudinary URL is accessible
- Check CORS settings in Cloudinary dashboard
- Ensure image was properly captured (check file size in upload logs)

### Price not displaying in cart
- Check that `Price Per Unit` and `Total Price` are in properties
- Verify Shopify cart template supports custom properties
- Check that line item properties are enabled in your Shopify theme

## Testing

### Local Testing
\`\`\`bash
# 1. Create a design in the editor
# 2. Click "Add to Cart"
# 3. Check browser console for logs:
#    [v0] Starting design image upload...
#    [v0] Design image uploaded successfully: https://res.cloudinary.com/...
\`\`\`

### Production Testing
1. Deploy to Vercel with env vars set
2. Access product page via iframe
3. Create design and add to cart
4. Verify image appears in Shopify cart
5. Verify price shows correctly

## API Reference

### POST `/api/upload-design`

**Request:**
\`\`\`
FormData with 'image' field containing Blob
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "url": "https://res.cloudinary.com/xxx/image/upload/v123/signo_designs/design-123.png",
  "publicId": "signo_designs/design-123"
}
\`\`\`

**Response (Error - 500):**
\`\`\`json
{
  "error": "Upload failed",
  "message": "Error details here"
}
\`\`\`

## Limits
- **Free Cloudinary tier:** 25GB storage
- **Image size limit:** 100MB per file (designs typically <2MB)
- **Rate limiting:** Generous for free tier

## Best Practices
1. Compress images during upload (already done with 0.95 quality)
2. Use organized folder structure (uses `signo_designs/`)
3. Add timestamps to prevent duplicates
4. Keep design canvas resolution optimal (avoid extreme zooming)
