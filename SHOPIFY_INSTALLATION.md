# Shopify Installation & Quick Start

## Quick Setup (5 minutes)

### Step 1: Add to Shopify Theme

Copy the code from `/public/shopify-sign-builder.liquid` and add it to your Shopify product template:

1. Go to **Admin > Sales channels > Online Store > Themes**
2. Click **Customize** on your active theme
3. Navigate to **Product page** template
4. Click **Add section** 
5. Paste the liquid code from `shopify-sign-builder.liquid`
6. Save

### Step 2: Add Metafields to Products

For each product you want to customize:

1. Go to **Admin > Products > [Your Product]**
2. Scroll to **Custom data** section
3. Click **Add metafield** for each of these:

#### Description
- **Namespace**: custom
- **Key**: description
- **Type**: Single line text
- **Value**: "Professional sign materials for your business"

#### Materials
- **Namespace**: custom
- **Key**: materials
- **Type**: JSON
- **Value**: `["Aluminum", "Acrylic", "PVC"]`

#### Sizes
- **Namespace**: custom
- **Key**: sizes
- **Type**: JSON
- **Value**: `["12x12", "18x12", "24x18", "36x24"]`

#### Price Per Sq Ft
- **Namespace**: custom
- **Key**: price_per_sqft
- **Type**: Single line text
- **Value**: `"5.50"`

### Step 3: Test It

1. Visit your product page
2. Look for the "Sign Builder" section
3. Check browser console (F12) for `[v0]` logs
4. Design and click "Add to Cart"

## Data Structure Reference

### Metafield JSON Formats

**Materials (simple array)**:
\`\`\`json
["Aluminum", "Acrylic", "PVC", "Corrugated Plastic"]
\`\`\`

**Sizes (string format)**:
\`\`\`json
["12x12", "18x12", "24x18", "36x24", "48x36"]
\`\`\`

**Sizes (object format)**:
\`\`\`json
[
  {"width": 12, "height": 12},
  {"width": 18, "height": 12},
  {"width": 24, "height": 18}
]
\`\`\`

## Environment Variables

Set in your Vercel project settings:

\`\`\`
NEXT_PUBLIC_SHOPIFY_STORE=signografx.myshopify.com
\`\`\`

## Troubleshooting Checklist

- [ ] Metafields are added to product (not just product type)
- [ ] JSON metafields use double quotes, not single quotes
- [ ] Namespace is exactly `custom` (lowercase)
- [ ] Key names match exactly (no typos)
- [ ] Sizes use format `"12x12"` or `{width: 12, height: 12}`
- [ ] Environment variable is set in Vercel
- [ ] Browser console shows `[v0]` logs (no JavaScript errors)

## Support

Check browser console for debug logs:
- `[v0] Loading product metafields: {...}` - Data loaded successfully
- `[v0] Extracted metafields: {...}` - All metafields found
- Check `/SHOPIFY_METAFIELDS_SETUP.md` for detailed docs
