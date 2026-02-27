# Complete Setup Guide - Sign Builder with Shopify Integration

## ✅ What's Been Fixed

### 1. Cart Integration Fixed
- Updated `addToShopifyCart()` function to properly format requests to Shopify's cart API
- Fixed CORS issues by using the correct Shopify store URL from `window.NEXT_PUBLIC_SHOPIFY_STORE`
- Now properly sends single item format instead of array wrapper

### 2. Navigation Header Added
- Created new `SiteHeader` component with navigation links
- Links to: Home, Products, Contact, Cart
- Sticky header that stays at top of page
- Responsive design (icons show on mobile, text on desktop)

### 3. Metafields Display
- "Here Metafields Are" section shows all scraped product data
- Always visible (even if empty) so you know what's been fetched
- Shows: Description, Price per Sq Ft, Sizes, Materials

## 📋 Installation Steps

### Step 1: Update Shopify Theme with New Template

Go to Shopify Admin → Online Store → Themes → Edit Code

**In the Snippets folder, create a NEW snippet:**
- Name: `sign-builder-iframe`
- Copy entire code from `/SHOPIFY_IFRAME_TEMPLATE_FINAL.liquid`
- Save

**Then in product.json template:**
1. Find where you want the designer to appear
2. Add this line: `{% render 'sign-builder-iframe' %}`
3. Save

### Step 2: Verify Setup

1. Visit https://signografx.com/products/custom
2. Open browser console (F12)
3. Look for logs:
   - `[Shopify] Template loaded` ✓
   - `[Shopify] Iframe loaded` ✓
   - `[Shopify] Sending product data to iframe` ✓
   - `[Shopify] postMessage sent` ✓

4. In the Sign Builder, check the "Here Metafields Are" section:
   - Description should show
   - Price per Sq Ft should show
   - Sizes should list
   - Materials should list

### Step 3: Test Cart

1. Design something in the builder
2. Click "Add to Cart"
3. Should see success message with item count and price
4. Verify item appears in Shopify cart

## 🎨 What Users See

### Navigation Header (Top)
- Home | Products | Contact | Cart buttons
- Easy access to other pages from within the builder

### Design Builder
- Left sidebar: Product info + Metafields + Size/Material controls
- Center: Full canvas for design
- Right sidebar: Text/Image tools
- Top toolbar: Save, Undo, Zoom, Preview, Add to Cart, Buy Now

### Metafields Section (Left Panel)
\`\`\`
Here Metafields Are
---
Description: [Your product description]
Price per Sq Ft: $XX.XX
Sizes: 12"×12", 18"×12", etc
Materials: Vinyl, Canvas, Wood, etc
\`\`\`

## 🔧 Troubleshooting

### Cart Not Working
- Check browser console for errors
- Verify variant ID is showing in logs
- Make sure Shopify store URL is correct in template
- Test on actual Shopify product page, not local

### No Metafields Showing
- Check that product has metafields set in Shopify Admin
- Verify they're in: `Product.metafields.custom.*`
- Check console logs for: `[Shopify] Sending product data`
- Look for messages showing metafields count

### Iframe Not Loading
- Verify SHOPIFY_IFRAME_TEMPLATE_FINAL.liquid is installed
- Check that `{% render 'sign-builder-iframe' %}` is in product.json
- Ensure vercel.app is not blocked by Shopify CSP
- Try clearing browser cache

## 📝 Files Updated

- ✅ `/lib/shopify-utils.ts` - Fixed cart API calls
- ✅ `/components/site-header.tsx` - NEW navigation header
- ✅ `/app/page.tsx` - Added header to page
- ✅ `/SHOPIFY_IFRAME_TEMPLATE_FINAL.liquid` - NEW complete template

## 🚀 Next Steps

1. Install the Shopify snippet
2. Test on product page
3. Verify all features work
4. Go live!
