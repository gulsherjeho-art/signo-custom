# CRITICAL: Shopify Integration Setup Required

## The Issue
The v0 app code is complete and working, but **the Shopify integration is NOT installed in your store**. This is why `SHOPIFY_PRODUCT` is still `undefined` in the debug logs.

## What Needs to Happen
You must copy the iframe template code into your Shopify store's product page template.

---

## Step-by-Step Installation

### 1. Access Your Shopify Theme Files
1. Go to Shopify Admin → Themes
2. Click on your active theme
3. Click "Edit code" (top right)
4. You should see folders: `Sections`, `Snippets`, `Templates`, etc.

### 2. Create the Snippet
1. Click "Add a new snippet" (left sidebar)
2. Name it: `sign-builder-iframe`
3. Click "Create snippet"

### 3. Copy This Code Into the Snippet

\`\`\`liquid
<!-- Sign Builder Iframe -->
<div class="sign-builder-container" style="margin: 2rem 0;">
  <iframe
    id="designer-iframe"
    src="https://customsigns.vercel.app/?product={{ product.id }}&variant={{ product.selected_or_first_available_variant.id }}"
    style="width: 100%; border: none; display: block; min-height: 100vh;"
  ></iframe>
</div>

<script>
  const iframe = document.getElementById('designer-iframe');
  
  function resizeIframe() {
    const extra = 100;
    iframe.style.height = (window.innerHeight + extra) + 'px';
  }
  
  // Send product data with metafields
  function sendProductDataToIframe() {
    if (!iframe || !iframe.contentWindow) {
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
    
    console.log('[Shopify] Sending product data with', productData.metafields ? productData.metafields.length : 0, 'metafields');
    
    try {
      iframe.contentWindow.postMessage({
        type: 'SHOPIFY_PRODUCT_DATA',
        product: productData
      }, '*');
    } catch (e) {
      console.error('[Shopify] Error:', e);
    }
  }
  
  function onIframeReady() {
    sendProductDataToIframe();
    setTimeout(() => sendProductDataToIframe(), 100);
    setTimeout(() => sendProductDataToIframe(), 500);
    setTimeout(() => sendProductDataToIframe(), 1000);
  }
  
  if (iframe.contentWindow) {
    iframe.addEventListener('load', onIframeReady);
    onIframeReady();
  } else {
    iframe.addEventListener('load', onIframeReady);
  }
  
  window.addEventListener('load', () => {
    resizeIframe();
    setTimeout(() => sendProductDataToIframe(), 100);
  });
  
  window.addEventListener('resize', resizeIframe);
</script>
\`\`\`

### 4. Add Snippet to Product Template
1. Go to **Templates** folder
2. Click on `product.json` or `product-template.json`
3. Find where you want the sign builder (usually after product images, before price)
4. Add this line in the right place:
   \`\`\`liquid
   {% include 'sign-builder-iframe' %}
   \`\`\`
5. Click **Save** (top right)

### 5. Verify Installation
1. Go to your Shopify store
2. Visit a product page
3. Open Browser Console (F12)
4. Look for `[Shopify]` logs showing product data being sent
5. Then look for `[v0]` logs showing data received

---

## What Should Happen After Installation

✅ Metafields display in Product Panel section "Here Metafields Are"
✅ All sizes, materials, description, and pricing appear
✅ Add to Cart and Buy Now buttons work
✅ Design data sends to Shopify cart

---

## Troubleshooting

**Still seeing `SHOPIFY_PRODUCT undefined`?**
- Make sure the snippet is added to your product template
- Check the snippet code is exactly as shown above
- Verify `{% include 'sign-builder-iframe' %}` is in product.json
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

**Metafields still not showing?**
- Confirm you added metafields to your product in Shopify Admin
- Check custom namespace is `custom` (case-sensitive)
- Verify metafield keys: `description`, `price_per_sqft`, `sizes`, `materials`
- Wait 2-3 minutes for Shopify to sync metafields

**No console logs appearing?**
- The snippet file may not be installed properly
- Check template section in Shopify has the `{% include %}` line
- Try clearing Shopify theme cache

---

## Need Help?

1. Share browser console logs (F12) from Shopify product page
2. Confirm the snippet is in your theme
3. Show the product.json template - verify `{% include 'sign-builder-iframe' %}` is there
