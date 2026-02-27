# Shopify Files API Setup for Design Image Upload

## Overview
The design image upload now uses Shopify's native Files API instead of Cloudinary. This stores design images directly in your Shopify store, making them appear as proper product thumbnails in the cart.

## Required Setup

### 1. Get Your Shopify Access Token

You need a Shopify app with the required API scopes:

**Scopes Required:**
\`\`\`
write_files
read_files
write_products
read_products
\`\`\`

**Steps to Create an App:**
1. Go to: `https://admin.shopify.com/store/signografx/apps/app-management/development`
2. Click "Create an app"
3. Name it: "Signo Design Upload"
4. Under "Admin API access scopes", enable:
   - `write_files` - Upload design images
   - `read_files` - List design images
   - `write_products` - Update product metafields
   - `read_products` - Read product data
5. Click "Save"
6. Click "Install app"
7. Go to "Configuration" → "Admin API credentials"
8. Copy the "Access token"

### 2. Add Environment Variable

Add to your Vercel project environment variables:

**Variable Name:** `SHOPIFY_ACCESS_TOKEN`
**Variable Value:** `{paste your access token here}`

Or add to `.env.local` for local development:
\`\`\`bash
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
\`\`\`

### 3. Verify Configuration

The upload endpoint expects:
- `SHOPIFY_ACCESS_TOKEN` - Shopify API access token with file scopes
- Store domain automatically set to: `signografx.myshopify.com`

### 4. How It Works

When a user adds a design to cart:

1. **Canvas → PNG:** Design canvas is converted to PNG image
2. **Staged Upload:** API calls Shopify's `stagedUploadsCreate` GraphQL mutation
3. **Get Upload URL:** Shopify returns a temporary upload URL
4. **Upload Image:** Image is uploaded to that URL via multipart form data
5. **Permanent URL:** Shopify returns permanent resource URL (e.g., `cdn.shopify.com/s/files/...`)
6. **Cart Property:** Image URL stored in cart item properties as `_thumbnail`
7. **Display:** Cart shows thumbnail image of custom design

### 5. Testing

After setup, test the flow:

1. Load the design builder
2. Create a custom design
3. Click "Add to Cart"
4. Check Vercel logs for:
   \`\`\`
   [v0] Received image: design-xxxxx.png
   [v0] Creating staged upload with Shopify...
   [v0] Image uploaded successfully to Shopify
   \`\`\`
5. Go to cart - you should see the design image thumbnail

### 6. Troubleshooting

**Error: "Missing SHOPIFY_ACCESS_TOKEN"**
- Add the environment variable to Vercel project settings
- Restart the deployment

**Error: "GraphQL errors"**
- Verify the access token has correct scopes
- Check the token hasn't expired

**Error: "Upload failed"**
- Check network/CORS isn't blocking the upload
- Verify file size isn't too large (should be under 20MB)

**Image not showing in cart:**
- Design upload succeeded but cart properties not displaying
- Check Shopify store settings for custom property display
- Ensure `_thumbnail` property is being sent

### 7. Files Modified

- `/app/api/upload-design/route.ts` - Implements Shopify Files API upload
- `/lib/shopify-utils.ts` - Contains `uploadDesignImage()` function
- `/components/sign-builder/top-toolbar.tsx` - Calls upload before add-to-cart

## API Documentation

**GraphQL Mutation:** `stagedUploadsCreate`
- Creates a temporary upload URL for Shopify Files
- Returns `url` (where to POST the file) and `resourceUrl` (permanent URL)

**Upload Method:** HTTP POST (multipart form data)
- Parameters from Shopify response added as form fields
- File added as `file` field last

**Result:** Permanent Shopify CDN URL for the uploaded image
