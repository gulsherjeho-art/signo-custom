# Updated Shopify Iframe Template

## Complete Liquid Template for Shopify Product Page

Copy this entire code and add it to your **product.liquid** template or create a new Shopify snippet called **sign-builder** and include it in your product page.

\`\`\`liquid
<!-- Sign Builder Designer Iframe -->
<div class="sign-builder-section" style="margin: 2rem 0;">
  <h2 class="text-2xl font-bold mb-4">Design Your Sign</h2>
  <div id="sign-builder-container">
    <iframe
      id="designer-iframe"
      src="https://customsigns.vercel.app/?product={{ product.id }}&variant={{ product.selected_or_first_available_variant.id }}"
      style="width: 100%; min-height: 600px; border: 1px solid #ddd; border-radius: 8px; display: block;"
    ></iframe>
  </div>
</div>

<script>
  const iframe = document.getElementById('designer-iframe');
  
  function resizeIframe() {
    const extra = 100;
    iframe.style.height = (window.innerHeight + extra) + 'px';
  }
  
  // Send product data with detailed logging
  function sendProductDataToIframe() {
    if (!iframe || !iframe.contentWindow) {
      console.log('[Shopify] Iframe not ready yet');
      return;
    }
    
    const productData = {
      id: {{ product.id | json }},
      title: {{ product.title | json }},
      handle: {{ product.handle | json }},
      selected_or_first_available_variant: {
        id: {{ product.selected_or_first_available_variant.id | json }},
        price: {{ product.selected_or_first_available_variant.price | json }},
      },
      metafields: {{ product.metafields | json }},
      images: {{ product.images | map: 'src' | json }}
    };
    
    console.log('[Shopify] Sending product data to iframe');
    console.log('[Shopify] Product ID:', productData.id);
    console.log('[Shopify] Variant ID:', productData.selected_or_first_available_variant.id);
    console.log('[Shopify] Metafields count:', productData.metafields ? productData.metafields.length : 0);
    console.log('[Shopify] Full product data:', productData);
    
    try {
      iframe.contentWindow.postMessage({
        type: 'SHOPIFY_PRODUCT_DATA',
        product: productData
      }, '*');
      console.log('[Shopify] postMessage sent successfully');
    } catch (e) {
      console.error('[Shopify] Error sending product data:', e);
    }
  }
  
  // Wait for iframe to load
  function onIframeReady() {
    console.log('[Shopify] Iframe loaded, sending data...');
    sendProductDataToIframe();
    setTimeout(() => sendProductDataToIframe(), 100);
    setTimeout(() => sendProductDataToIframe(), 500);
    setTimeout(() => sendProductDataToIframe(), 1000);
  }
  
  // Check iframe readiness
  if (iframe.contentWindow) {
    console.log('[Shopify] Iframe already has contentWindow');
    iframe.addEventListener('load', onIframeReady);
    onIframeReady();
  } else {
    console.log('[Shopify] Waiting for iframe to load...');
    iframe.addEventListener('load', onIframeReady);
  }
  
  // Also try when window loads
  window.addEventListener('load', () => {
    console.log('[Shopify] Window load event');
    resizeIframe();
    setTimeout(() => sendProductDataToIframe(), 100);
  });
  
  window.addEventListener('resize', resizeIframe);
</script>

<style>
  #sign-builder-container {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
  }
</style>
\`\`\`

## What This Template Does

1. **Creates an iframe** pointing to your custom sign builder app
2. **Passes product data** via Liquid template: product ID, variant ID, metafields
3. **Uses postMessage()** to send data to iframe with multiple retries
4. **Logs all activity** to browser console for debugging
5. **Passes these metafields automatically**:
   - `description` - Product description text
   - `price_per_sqft` - Price per square foot
   - `sizes` - Array of available sizes (JSON)
   - `materials` - Array of available materials (JSON)

## Installation Steps

1. Go to **Shopify Admin > Themes > Customize**
2. Find **product.liquid** or product template
3. Paste the code above where you want the sign builder to appear
4. Make sure your product has metafields set up (see below)

## Required Metafields Setup

In **Shopify Admin > Settings > Custom Data > Product metafields**, create these 4 metafields:

| Namespace | Key | Type | Value | Example |
|-----------|-----|------|-------|---------|
| `custom` | `description` | Single line text | Product description | "High-quality aluminum sign" |
| `custom` | `price_per_sqft` | Single line text | Price per square foot | "5.50" |
| `custom` | `sizes` | JSON | Array of sizes | `["12x12", "18x12", "24x18", "36x24"]` |
| `custom` | `materials` | JSON | Array of materials | `["Aluminum", "Acrylic", "PVC", "Metal"]` |

## What You'll See in the App

### Product Panel (Left Sidebar) shows:
- Product description (blue card)
- Price per sq ft (green card)
- Current canvas size with area calculation
- **Available Sizes** section (clickable buttons from metafields)
- **Quick Sizes** fallback (if no metafields: 12"×12", 18"×12", 24"×18", 36"×24")
- Material dropdown selector
- **NEW: Fetched Metafields Data** section showing all scraped data in boxes

## Debugging

Open browser console (F12) and look for logs starting with `[Shopify]` to see:
- When iframe loads
- When product data is sent
- Metafield count and content
- Any errors

Check `/v0_app_debug_logs` for `[v0]` logs showing if data was received on the app side.
