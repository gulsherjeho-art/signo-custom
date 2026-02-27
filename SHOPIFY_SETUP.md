# Shopify Setup - Installation Steps for signografx.com

## Your Product URL
- **Store**: signografx.com (Shopify store: signografx.myshopify.com)
- **Product**: https://signografx.com/products/custom
- **App URL**: https://customsigns.vercel.app

## What You Need to Do

Your app code is 100% ready and deployed. Now you need to add ONE snippet to your Shopify theme to send product data to the iframe.

### Step 1: Go to Shopify Admin

1. Open your Shopify Admin: https://admin.shopify.com/store/signografx
2. Go to **Sales channels** → **Online Store** → **Themes**
3. Find your current theme and click **Edit Code**

### Step 2: Create a New Snippet

1. In the code editor, find the **Snippets** folder on the left
2. Click the **+** button next to "Snippets"
3. Name it: `sign-builder-iframe`
4. Click **Create snippet**

### Step 3: Add the Code

Copy this entire code and paste it into the new snippet:

\`\`\`liquid
<!-- Sign Builder Iframe Snippet -->
<div id="sign-builder-container" style="margin: 2rem 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  <iframe
    id="designer-iframe"
    src="https://customsigns.vercel.app/?product={{ product.id }}&variant={{ product.selected_or_first_available_variant.id }}"
    style="width: 100%; min-height: 600px; border: none; display: block;"
  ></iframe>
</div>

<script>
  console.log('[Shopify] Sign builder snippet loaded');
  
  function sendProductDataToIframe() {
    const iframe = document.getElementById('designer-iframe');
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
    
    console.log('[Shopify] Sending product data:', productData);
    
    try {
      iframe.contentWindow.postMessage({
        type: 'SHOPIFY_PRODUCT_DATA',
        product: productData
      }, '*');
      console.log('[Shopify] Data sent successfully');
    } catch (e) {
      console.error('[Shopify] Error:', e);
    }
  }
  
  // Send data with retries
  function trySendData() {
    sendProductDataToIframe();
    setTimeout(() => sendProductDataToIframe(), 100);
    setTimeout(() => sendProductDataToIframe(), 500);
    setTimeout(() => sendProductDataToIframe(), 1000);
  }
  
  // Wait for iframe to load
  const iframe = document.getElementById('designer-iframe');
  iframe.addEventListener('load', trySendData);
  window.addEventListener('load', trySendData);
  
  // Try immediately
  setTimeout(trySendData, 100);
</script>
\`\`\`

### Step 4: Add to Product Template

1. Go to **Templates** folder on the left
2. Open `product.json`
3. Find where the product description or reviews are shown
4. Add this line where you want the sign builder to appear:

\`\`\`liquid
{% render 'sign-builder-iframe' %}
\`\`\`

**Example placement** (add after reviews section):
\`\`\`liquid
{% render 'reviews' %}

{% render 'sign-builder-iframe' %}
\`\`\`

### Step 5: Save and Test

1. Click **Save** button (top right)
2. Go to your product page: https://signografx.com/products/custom
3. Open browser console (F12) and look for these logs:
   - `[Shopify] Sign builder snippet loaded` ✓
   - `[Shopify] Sending product data...` ✓
   - `[Shopify] Data sent successfully` ✓

4. In the Sign Builder left panel, look for **"Here Metafields Are"** section
   - Should show: Description, Price per Sq Ft, Sizes, Materials

### Step 6: Verify Your Metafields Are Set Up

Make sure your product has metafields at:
- Admin → Products → Custom → [Your Product]
- Look for custom metafield entries:
  - `description` (Single line text)
  - `price_per_sqft` (Single line text with price)
  - `sizes` (JSON array like: `["12x12", "18x12"]`)
  - `materials` (JSON array like: `["Aluminum", "Acrylic"]`)

## Troubleshooting

**"Here Metafields Are" section not showing?**
1. Check browser console for errors (F12)
2. Verify metafields exist on the product
3. Hard refresh page (Ctrl+Shift+R)
4. Check that snippet was saved properly

**iframe shows but no content?**
1. Check that customsigns.vercel.app is accessible
2. Verify product ID is being passed correctly
3. Look at console logs for postMessage events

**Still having issues?**
1. Delete the snippet and create again
2. Make sure you're editing the LIVE theme (not a draft)
3. Check that product.json template exists in your theme
