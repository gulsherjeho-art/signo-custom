# Shopify Sign Builder Deployment Guide

## Overview

This sign builder is designed to be deployed as a standalone app on Shopify product pages. It allows customers to design custom signs with real-time pricing and then add them to their cart.

## Quick Start

### 1. Build for Shopify

\`\`\`bash
npm run build:shopify
\`\`\`

This command will:
- Create a production build of the Next.js app
- Generate standalone CSS and JavaScript bundles
- Create the Liquid template file
- Output files to `public/shopify-assets/`

### 2. Files Generated

\`\`\`
public/shopify-assets/
├── sign-builder.css              # All component styles
├── sign-builder.js               # Main application bundle
├── sign-builder-template.liquid  # Shopify template
└── SHOPIFY_SETUP.md             # Setup instructions
\`\`\`

### 3. Upload to Shopify

#### Step A: Upload Files to Shopify Assets

1. Log in to your Shopify Admin
2. Go to **Settings** → **Files** (or **Content** → **Files** on newer stores)
3. Click **Upload files**
4. Select and upload:
   - `sign-builder.css`
   - `sign-builder.js`
5. Note the asset URLs (they'll look like: `cdn.shopify.com/s/files/...`)

#### Step B: Add to Product Template

1. Go to **Sales channels** → **Online Store**
2. Click **Products** in the left sidebar
3. Select a product to add the builder to
4. Click **Edit template** in the bottom right
5. Copy the content from `sign-builder-template.liquid` and paste it into the template
6. Adjust styling as needed
7. Save changes

#### Step C: Alternative - Use as Custom Section

If your theme supports custom sections:

1. Create a new section in your theme
2. Paste the liquid code into a new section file
3. Add it to your product template
4. Configure through the section settings

### 4. Template Code

Here's what gets added to your product template:

\`\`\`liquid
<!-- Sign Builder Designer -->
<div id="designer-root"></div>

<script>
  // Pass Shopify product data to the app
  window.SHOPIFY_VARIANT_ID = {{ product.selected_or_first_available_variant.id }};
  window.SHOPIFY_PRODUCT = {{ product | json }};
  window.SIGN_BUILDER_CSS_URL = "{{ 'sign-builder.css' | asset_url }}";
</script>

<!-- Load React libraries -->
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js" defer></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js" defer></script>

<!-- Load Sign Builder CSS -->
{{ 'sign-builder.css' | asset_url | stylesheet_tag }}

<!-- Load Sign Builder JavaScript -->
<script src="{{ 'sign-builder.js' | asset_url }}" defer></script>
\`\`\`

## Features

The sign builder includes:

- **Professional Canvas**: Drag-to-resize canvas with grid/ruler support
- **Design Elements**: Text, shapes, images, icons, QR codes, tables
- **Templates**: 26+ pre-built safety sign templates
- **Customization**: Colors, fonts, effects, borders, backgrounds
- **Real-time Pricing**: Automatic price updates based on size, quantity, sides
- **Easy Presets**: One-click size and quantity bundles
- **Shopify Integration**: Direct add-to-cart functionality

## Customization

### Pricing

Edit `/lib/sign-builder-types.ts` to adjust base pricing:

\`\`\`typescript
const BASE_PRICE = 2.5 // Price per square inch
const PREMIUM_MULTIPLIER = 1.5 // Double-sided multiplier
\`\`\`

### Colors & Branding

Edit `/app/globals.css` to customize the design system colors:

\`\`\`css
@theme {
  --primary: #2563eb;
  --secondary: #64748b;
  /* ... more tokens ... */
}
\`\`\`

### Templates

Add more templates in `/lib/sign-templates.ts`:

\`\`\`typescript
{
  id: 'custom-template',
  name: 'Custom Template',
  category: 'Safety',
  objects: [
    // Define sign elements here
  ]
}
\`\`\`

## Shopify Data Access

Inside the app, you can access:

\`\`\`javascript
// Product variant ID
window.SHOPIFY_VARIANT_ID

// Full product data
window.SHOPIFY_PRODUCT

// Cart functions
window.shopifyData.cartAdd(variantId, quantity)
\`\`\`

## Troubleshooting

### App doesn't load
- Check browser console (F12) for errors
- Verify CSS and JS files are uploaded to Shopify
- Ensure `<div id="designer-root"></div>` exists in template
- Check that CDN URLs for React are accessible

### Styling looks broken
- Ensure Tailwind CSS is loading (check for CDN script)
- Verify `sign-builder.css` file is properly uploaded
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

### Add to cart not working
- Check that `SHOPIFY_VARIANT_ID` is being passed correctly
- Verify variant ID is valid for the product
- Check browser console for fetch errors

### Buttons/features not responding
- Ensure JavaScript file is fully loaded
- Check for JavaScript errors in console
- Verify React libraries loaded from CDN

## File Size Notes

- **sign-builder.css**: ~150-200 KB (includes Tailwind and component styles)
- **sign-builder.js**: ~400-500 KB (includes React and all dependencies)

If size is a concern, consider:
- Using external CDN for dependencies (already done for React)
- Code splitting for features
- Lazy loading optional components

## Next.js Build Configuration

The build process is configured in:
- `package.json` - Build scripts
- `next.config.mjs` - Next.js settings
- `scripts/build-shopify.js` - Custom build script

To modify the build output, edit `build-shopify.js`.

## Updating the App

To deploy an updated version:

1. Make changes to the code
2. Run `npm run build:shopify`
3. Upload the new `sign-builder.css` and `sign-builder.js` files to Shopify
4. The changes will be live (after Shopify cache clears, typically within minutes)

## Support & Issues

For questions about:
- **Shopify integration**: See Shopify admin help
- **App features**: Check the README
- **Custom modifications**: Edit the relevant component files

## License & Usage

This sign builder is ready for production use on Shopify stores. Ensure you have proper licensing for all included libraries and icons.
