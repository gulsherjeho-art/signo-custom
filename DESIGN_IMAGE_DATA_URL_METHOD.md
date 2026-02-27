## Design Image Storage - Data URL Method

### How It Works

Instead of uploading to external services or needing API tokens, the design image is now:

1. **Captured as PNG** - Canvas rendered to image
2. **Converted to Base64** - PNG encoded as data URL
3. **Stored in Cart Properties** - Saved as a custom metafield
4. **Displayed in Cart** - Shows alongside other product details

### Benefits

✅ **No API Tokens Required** - Works without Shopify access tokens
✅ **No External Services** - Everything stays within your Shopify store
✅ **Instant Upload** - Base64 encoding is immediate
✅ **Cart Display** - Design thumbnail visible in cart

### Cart Properties

When adding a custom design to cart, these properties are sent:

\`\`\`
Size: "18" × 24""
Sides: "1 Side"
Quantity: "1"
Price Per Unit: "9.00"
Total Price: "9.00"
_Custom Design Image: "data:image/png;base64,iVBORw0KGgo..."
_thumbnail: "data:image/png;base64,iVBORw0KGgo..."
\`\`\`

The `_Custom Design Image` property stores the full base64 encoded image.
The `_thumbnail` property allows Shopify to display it as a thumbnail.

### Shopify Cart Display

Your Shopify cart will automatically:
- Show the custom design thumbnail
- Display all the product properties
- Show correct pricing (from "Price Per Unit" × quantity)
- Allow customer to modify quantity or remove item

### Example

When a customer creates an 18"×24" custom sign and adds it to cart:

**What they see in Shopify cart:**
- Custom design thumbnail (generated from canvas)
- Product name: "Custom by [customer name]"
- Size: 18" × 24"
- Sides: 1 Side
- Quantity: 1
- Price: $9.00

No external uploads, no API calls, just clean Shopify native functionality.
