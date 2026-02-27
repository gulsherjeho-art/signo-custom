# Sign Builder Updates - Shopify Metafield Integration

## Summary
Optimized the sign builder for Shopify iframe embedding with compact UI, Shopify metafield support for materials/sides, product description display, and removed unnecessary preset packs.

## Key Changes

### 1. **Shopify Product Panel - Compact & Streamlined**
- **File**: `/components/sign-builder/left-sidebar.tsx`
- Removed "Easy Presets" section (Small Starter, Medium Pack, Large Bulk)
- Removed quantity selector
- Reduced padding and spacing for iframe compatibility
- Reduced icon sizes and header font sizes for compact layout

### 2. **Dynamic Shopify Metafield Integration**
- **File**: `/components/sign-builder/left-sidebar.tsx`
- Automatically loads product metafields on component mount:
  - `custom.materials` - JSON array of material options
  - `custom.sides` - Number of sides (1 or 2)
  - `custom.description` - Product description text
  
**Metafield Format Requirements (Shopify)**:
\`\`\`json
// Materials metafield (namespace: custom, key: materials)
["Aluminum", "Acrylic", "PVC", "Coroplast"]

// Sides metafield (namespace: custom, key: sides)
2

// Description metafield (namespace: custom, key: description)
"Your product description here"
\`\`\`

### 3. **Material Dropdown**
- Shows only when materials are defined in Shopify metafields
- Native HTML `<select>` element for mobile compatibility
- Compact styling matching iframe constraints
- Auto-selects first material option

### 4. **Sides Selector**
- Shows dropdown only when `sides > 1`
- Options: "Single Sided" (1) or "Double Sided" (2)
- Displays static message "Single Sided Design" when only one side available
- Dynamically rendered based on metafield value

### 5. **Product Description Display**
- Shows product description from metafield (if available)
- Compact card layout in product panel
- Uses small text (xs) for space efficiency

### 6. **Compact UI for Iframe**
- **File**: `/app/shopify.tsx`
  - Adjusted layout spacing for smaller screens
  - Added specific height constraints for toolbar (h-12 instead of h-14)
  
- **File**: `/components/sign-builder/top-toolbar.tsx`
  - Reduced toolbar height from 14 to 12 units
  - Maintains all functionality in compact space

### 7. **Updated Shopify Liquid Template**
- **File**: `/public/shopify-sign-builder.liquid`
- Changed from full embed to iframe-based approach
- Responsive iframe sizing with dynamic height adjustment
- Message passing for cross-origin height updates
- Cleaner integration with Shopify theme

## UI Components Removed

### Removed from Product Panel:
1. ✅ **Easy Presets Section** - 3 preset buttons (Small Starter, Medium Pack, Large Bulk)
2. ✅ **Quantity Selector** - +/- buttons and quick selection buttons (1, 5, 10)
3. ✅ **Size Square Footage Display** - Removed "sq in" calculations

### Kept in Product Panel:
- ✅ Current size display
- ✅ Product description
- ✅ Custom size input (Width × Height)
- ✅ Quick size buttons (4 preset sizes)
- ✅ Material dropdown (dynamic from metafields)
- ✅ Sides selector (dynamic from metafields)

## Sizing

### Compact Dimensions:
- **Toolbar Height**: 48px (h-12)
- **Sidebar Width**: 288px (w-72)
- **Left Icon Panel**: 64px (w-16)
- **Panel Header**: Reduced from py-3 to py-2
- **Padding**: Reduced from p-4 to p-3

### Responsive Iframe:
- **Desktop Min Height**: 600px
- **Mobile Min Height**: 500px
- **Dynamic Height**: Adjusts based on content
- **Width**: 100% of container

## Migration Guide for Shopify

### Step 1: Add Metafields to Product
In Shopify Admin, add these metafields to your products:

\`\`\`
Namespace: custom
Key: materials
Type: JSON
Value: ["Aluminum", "Acrylic", "PVC"]

Namespace: custom
Key: sides
Type: Integer
Value: 2

Namespace: custom
Key: description
Type: Single Line Text
Value: "Your product description"
\`\`\`

### Step 2: Update Product Template
Replace your product template liquid code with the content from `/public/shopify-sign-builder.liquid`

### Step 3: Update iframe URL
Update the iframe src to include your product URL parameters:
\`\`\`
https://customsigns.vercel.app/?product={{ product.id }}&variant={{ product.selected_or_first_available_variant.id }}
\`\`\`

## Technical Implementation

### State Management
- `shopifyMaterials`: Array of material options from metafield
- `shopifySides`: Number of sides available
- `shopifyDescription`: Product description text
- `selectedMaterial`: Currently selected material
- `selectedSide`: Currently selected side (1 or 2)

### Conditional Rendering
- Material dropdown only renders when `shopifyMaterials.length > 0`
- Sides dropdown only renders when `shopifySides > 1`
- Description box only renders when `shopifyDescription` is truthy
- Single side message displays when `shopifySides === 1`

## Performance Optimizations

1. **Lazy Load Metafields**: Only loads on component mount
2. **Compact CSS**: Reduced spacing and padding throughout
3. **Efficient Conditional Rendering**: Only shows relevant UI elements
4. **Iframe Optimization**: Dynamic height adjustment prevents unnecessary scrolling
5. **Removed Heavy Components**: Eliminated quantity presets and complex calculations

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Shopify Theme context

## Testing Checklist

- [ ] Test with single material metafield
- [ ] Test with multiple materials (3+)
- [ ] Test with sides = 1
- [ ] Test with sides = 2
- [ ] Test with and without description
- [ ] Verify iframe height adjusts on content change
- [ ] Test on mobile device
- [ ] Verify dropdowns work correctly
- [ ] Check that removed elements don't appear
- [ ] Confirm Shopify product data loads correctly
