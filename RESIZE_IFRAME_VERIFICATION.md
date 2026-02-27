# ResizeIframe Component - Verification & Corrections

## Issues Found in Original File

1. **Incomplete PostMessage Handling**
   - Was only expecting `RESIZE_IFRAME` messages
   - Missing handler for `SHOPIFY_PRODUCT_DATA` messages
   - No global state management for product data

2. **Missing Features**
   - ResizeObserver not implemented for dynamic sizing
   - No proper iframe source URL
   - Missing accessibility attributes (title)
   - No cleanup/return function for event listeners

3. **Architecture Issues**
   - Component standalone, no connection to parent layout
   - Shopify data reception should happen in layout.tsx, not here
   - This component should only handle UI/sizing

## Corrections Made

✅ **Created `/components/sign-builder/resize-iframe.tsx`**

- Added ResizeObserver for better size tracking
- Proper event listener cleanup
- Added iframe title for accessibility
- Removed product data handling (belongs in layout.tsx)
- Cleaner message type handling
- Better TypeScript types

## How It Works Now

1. **Shopify snippet** sends data via `postMessage` → caught in `app/layout.tsx` ✓
2. **ResizeIframe component** handles UI and iframe sizing only ✓
3. **Data flows**: Shopify → layout (global state) → left-sidebar (displays) ✓
4. **Resizing**: Window resize + ResizeObserver keeps iframe fitting properly ✓

## Next Steps

- Use this component in your page/layout where you want to display the builder
- Shopify data flows through the existing postMessage listener in layout.tsx
- The product data displays in the "Here Metafields Are" section of left-sidebar

This separation of concerns keeps the component focused on UI while data management stays in layout.tsx.
