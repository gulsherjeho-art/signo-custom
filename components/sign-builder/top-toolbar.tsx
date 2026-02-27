"use client"

import { useState, useCallback, useMemo } from 'react'
import { useSignBuilder } from '@/lib/sign-builder-context'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  Download,
  Save,
  FolderOpen,
  Grid3X3,
  Ruler,
  Trash2,
  ChevronDown,
  FileImage,
  FileType,
  FileText,
  ShoppingCart,
  Check,
  X,
  Loader,
} from 'lucide-react'
import { uploadDesignImage } from '@/lib/shopify-utils'

export function TopToolbar() {
  const {
    zoom,
    setZoom,
    showGrid,
    showRulers,
    toggleGrid,
    toggleRulers,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    objects,
    canvasWidth,
    canvasHeight,
    getDesignData,
    quantity,
    sides,
    material,
  } = useSignBuilder()

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3]

  // Get variant ID from URL params
  const getVariantIdFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('variant')
  }, [])

  // Get price per sq ft from metafields
  const getPricePerSqft = useCallback(() => {
    if (typeof window !== 'undefined') {
      const product = (window as any).SHOPIFY_PRODUCT
      if (product?.metafields?.price_per_sqft) {
        return parseFloat(product.metafields.price_per_sqft) || 0
      }
    }
    return 0
  }, [])

  // Memoized price calculation
  const designPrice = useMemo(() => {
    const pricePerSqft = getPricePerSqft()
    if (pricePerSqft <= 0) return 0
    
    const sqFt = (canvasWidth * canvasHeight) / 144
    const basePrice = sqFt * pricePerSqft
    const sidesMultiplier = sides === 2 ? 1.5 : 1
    const finalPrice = basePrice * sidesMultiplier * quantity
    
    return finalPrice
  }, [canvasWidth, canvasHeight, sides, quantity, getPricePerSqft])

  // Add to cart handler - sends message to parent Shopify window
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true)
    try {
      const variantId = getVariantIdFromUrl()
      
      if (!variantId) {
        alert('Unable to add to cart: Variant ID not found. Make sure you accessed this from a Shopify product page.')
        setIsAddingToCart(false)
        return
      }

      if (objects.length === 0) {
        alert('Please add elements to your design before adding to cart.')
        setIsAddingToCart(false)
        return
      }

      // Calculate unit price (NOT including quantity multiplier)
      const pricePerSqft = getPricePerSqft()
      const sqFt = (canvasWidth * canvasHeight) / 144
      const basePrice = sqFt * pricePerSqft
      const sidesMultiplier = sides === 2 ? 1.5 : 1
      const unitPrice = basePrice * sidesMultiplier
      const totalPrice = unitPrice * quantity
      
      // Upload design image to Cloudinary
      let designImageUrl = ''
      try {
        if (objects.length > 0) {
          designImageUrl = await uploadDesignImage(objects, canvasWidth, canvasHeight)
        }
      } catch (err) {
        console.warn('[v0] Could not upload design image:', err)
      }

      // Build cart properties - only the essentials
      const materialLabel = material.charAt(0).toUpperCase() + material.slice(1)
      const shopifyProduct = (window as any).SHOPIFY_PRODUCT
      const productName = shopifyProduct?.title || 'Custom Sign'

      const properties: Record<string, string> = {
        'Product': productName,
        'Material': materialLabel,
        'Size': `${canvasWidth}" x ${canvasHeight}"`,
        'Sides': sides === 2 ? '2 Sides' : '1 Side',
        'Price': '$' + totalPrice.toFixed(2),
      }

      // Add design image
      if (designImageUrl) {
        properties['Design Image'] = designImageUrl
      }

      // Send message to parent Shopify window to add to cart
      if (window.top && window.top !== window) {
        window.top.postMessage({
          type: 'ADD_TO_CART',
          variantId: variantId,
          quantity: quantity,
          properties: properties,
          customImage: designImageUrl,
          checkout: false
        }, '*')

        alert(`Successfully added ${quantity} item(s) to cart!`)
      } else {
        // Standalone mode - call Shopify cart API directly
        const cartUrl = `https://signografx.myshopify.com/cart/add.js`
        const res = await fetch(cartUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity, properties }),
        })
        if (!res.ok) throw new Error(`Cart API error: ${res.statusText}`)
        alert(`Successfully added ${quantity} item(s) to cart!`)
      }
    } catch (error) {
      console.error('[v0] Error adding to cart:', error)
      alert(`Failed to add to cart: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAddingToCart(false)
    }
  }, [objects, canvasWidth, canvasHeight, sides, quantity, material, getVariantIdFromUrl, getPricePerSqft])

  // Buy now handler
  const handleBuyNow = useCallback(async () => {
    setIsCheckingOut(true)
    try {
      const variantId = getVariantIdFromUrl()
      
      if (!variantId) {
        alert('Unable to checkout: Variant ID not found.')
        setIsCheckingOut(false)
        return
      }

      if (objects.length === 0) {
        alert('Please add elements to your design before checking out.')
        setIsCheckingOut(false)
        return
      }

      // Calculate unit price (NOT including quantity multiplier)
      const pricePerSqft = getPricePerSqft()
      const sqFt = (canvasWidth * canvasHeight) / 144
      const basePrice = sqFt * pricePerSqft
      const sidesMultiplier = sides === 2 ? 1.5 : 1
      const unitPrice = basePrice * sidesMultiplier
      const totalPrice = unitPrice * quantity

      // Upload design image to Cloudinary
      let designImageUrl = ''
      try {
        if (objects.length > 0) {
          designImageUrl = await uploadDesignImage(objects, canvasWidth, canvasHeight)
        }
      } catch (err) {
        console.warn('[v0] Could not upload design image:', err)
      }

      const materialLabel = material.charAt(0).toUpperCase() + material.slice(1)
      const shopifyProduct = (window as any).SHOPIFY_PRODUCT
      const productName = shopifyProduct?.title || 'Custom Sign'

      const properties: Record<string, string> = {
        'Product': productName,
        'Material': materialLabel,
        'Size': `${canvasWidth}" x ${canvasHeight}"`,
        'Sides': sides === 2 ? '2 Sides' : '1 Side',
        'Price': '$' + totalPrice.toFixed(2),
      }

      // Add design image
      if (designImageUrl) {
        properties['Design Image'] = designImageUrl
      }
      
      // Send message to parent Shopify window for checkout
      if (window.top && window.top !== window) {
        window.top.postMessage({
          type: 'ADD_TO_CART',
          variantId: variantId,
          quantity: quantity,
          properties: properties,
          customImage: designImageUrl,
          checkout: true
        }, '*')
      } else {
        // Standalone mode - call Shopify cart API directly then redirect
        const cartUrl = `https://signografx.myshopify.com/cart/add.js`
        const res = await fetch(cartUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity, properties }),
        })
        if (!res.ok) throw new Error(`Cart API error: ${res.statusText}`)
        window.location.href = 'https://signografx.myshopify.com/checkout'
      }
    } catch (error) {
      console.error('[v0] Error during checkout:', error)
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCheckingOut(false)
    }
  }, [objects, canvasWidth, canvasHeight, sides, quantity, material, getVariantIdFromUrl, getPricePerSqft])

  const saveProject = () => {
    const data = getDesignData()
    const json = JSON.stringify({
      ...data,
      version: '1.0',
      savedAt: new Date().toISOString(),
    })
    localStorage.setItem('sign-builder-project', json)
    alert('Project saved!')
  }

  const loadProject = () => {
    const saved = localStorage.getItem('sign-builder-project')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Would need to implement applyTemplate for full restore
        alert('Project loaded! (Basic restore)')
      } catch {
        alert('Failed to load project')
      }
    } else {
      alert('No saved project found')
    }
  }

  const downloadCanvas = async (format: 'png' | 'jpg' | 'pdf') => {
    // Create a temporary canvas for export
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpi = 300
    const scale = dpi / 96 // 96 is standard screen DPI
    canvas.width = canvasWidth * dpi / 2.54 * 2.54 // Convert inches to pixels at 300 DPI
    canvas.height = canvasHeight * dpi / 2.54 * 2.54

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw objects (simplified - in production would need full rendering)
    for (const obj of objects) {
      ctx.save()
      const pixelX = (obj.x / canvasWidth) * canvas.width
      const pixelY = (obj.y / canvasHeight) * canvas.height
      const pixelW = (obj.width / canvasWidth) * canvas.width
      const pixelH = (obj.height / canvasHeight) * canvas.height

      ctx.translate(pixelX, pixelY)
      ctx.rotate((obj.rotation * Math.PI) / 180)
      ctx.globalAlpha = obj.opacity

      if (obj.type === 'shape') {
        ctx.fillStyle = obj.fill || '#3b82f6'
        if (obj.shapeType === 'rectangle') {
          ctx.fillRect(-pixelW / 2, -pixelH / 2, pixelW, pixelH)
        } else if (obj.shapeType === 'circle') {
          ctx.beginPath()
          ctx.ellipse(0, 0, pixelW / 2, pixelH / 2, 0, 0, Math.PI * 2)
          ctx.fill()
        }
        if (obj.strokeWidth && obj.stroke) {
          ctx.strokeStyle = obj.stroke
          ctx.lineWidth = obj.strokeWidth * scale
          if (obj.shapeType === 'rectangle') {
            ctx.strokeRect(-pixelW / 2, -pixelH / 2, pixelW, pixelH)
          } else if (obj.shapeType === 'circle') {
            ctx.beginPath()
            ctx.ellipse(0, 0, pixelW / 2, pixelH / 2, 0, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      } else if (obj.type === 'text') {
        ctx.font = `${obj.fontWeight || 'normal'} ${obj.fontStyle || 'normal'} ${(obj.fontSize || 32) * scale}px ${obj.fontFamily || 'sans-serif'}`
        ctx.fillStyle = obj.textColor || '#000000'
        ctx.textAlign = obj.textAlign || 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(obj.text || '', 0, 0)
      }

      ctx.restore()
    }

    // Download
    const link = document.createElement('a')
    if (format === 'pdf') {
      // For PDF, we'd use jsPDF in a real implementation
      alert('PDF export requires jsPDF library. Downloading as PNG instead.')
      link.download = `sign-design.png`
      link.href = canvas.toDataURL('image/png')
    } else {
      link.download = `sign-design.${format}`
      link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', format === 'jpg' ? 0.9 : undefined)
    }
    link.click()
  }

  if (isPreviewMode) {
    return (
      <div className="h-14 bg-black text-white flex items-center justify-between px-4">
        <span className="text-sm">Preview Mode</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPreviewMode(false)}
          className="bg-transparent border-white text-white hover:bg-white/10"
        >
          Exit Preview
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-12 bg-card border-b flex items-center justify-between px-2">
        {/* Left section - History & View */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={undo} disabled={!canUndo}>
                <Undo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={redo} disabled={!canRedo}>
                <Redo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setZoom(zoom - 0.25)}>
                <ZoomOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-20 text-xs bg-transparent">
                {Math.round(zoom * 100)}%
                <ChevronDown className="size-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {zoomLevels.map(level => (
                <DropdownMenuItem key={level} onClick={() => setZoom(level)}>
                  {Math.round(level * 100)}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setZoom(zoom + 0.25)}>
                <ZoomIn className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setZoom(1)}>
                <Maximize className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom (100%)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGrid ? 'default' : 'ghost'} 
                size="icon-sm" 
                onClick={toggleGrid}
              >
                <Grid3X3 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showRulers ? 'default' : 'ghost'} 
                size="icon-sm" 
                onClick={toggleRulers}
              >
                <Ruler className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Rulers</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setIsPreviewMode(true)}>
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview Mode</TooltipContent>
          </Tooltip>
        </div>

        {/* Center section - Price Display */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-xs text-gray-500 font-medium">Total Price</p>
              <p className="text-sm font-bold text-blue-600">${(designPrice * quantity).toFixed(2)}</p>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-xs text-gray-600">
              <p className="font-medium">{canvasWidth}" × {canvasHeight}" • {sides === 2 ? '2 Sides' : '1 Side'} • Qty: {quantity}</p>
              <p className="text-gray-500">Area: {((canvasWidth * canvasHeight) / 144).toFixed(2)} sq ft</p>
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={saveProject}>
                <Save className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Project</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={loadProject}>
                <FolderOpen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load Project</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Download
                <ChevronDown className="size-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadCanvas('png')}>
                <FileImage className="size-4 mr-2" />
                Download PNG (High Quality)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadCanvas('jpg')}>
                <FileType className="size-4 mr-2" />
                Download JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadCanvas('pdf')}>
                <FileText className="size-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={clearCanvas}>
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddToCart}
                disabled={isAddingToCart || objects.length === 0}
              >
                {isAddingToCart ? (
                  <>
                    <Loader className="size-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add to Shopping Cart</TooltipContent>
          </Tooltip>

          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={handleBuyNow}
            disabled={isCheckingOut || objects.length === 0}
          >
            {isCheckingOut ? (
              <>
                <Loader className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="size-4 mr-2" />
                Buy Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Design Preview</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Canvas */}
            <div className="flex justify-center bg-gray-100 rounded-lg p-8">
              <div
                className="relative bg-white shadow-xl rounded"
                style={{
                  width: `${canvasWidth * 10}px`,
                  maxWidth: '100%',
                  aspectRatio: `${canvasWidth} / ${canvasHeight}`,
                  backgroundImage: `linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)`,
                  backgroundSize: `40px 40px`,
                }}
              >
                {objects.map(obj => (
                  <div
                    key={obj.id}
                    className="absolute"
                    style={{
                      left: `${(obj.x / canvasWidth) * 100}%`,
                      top: `${(obj.y / canvasHeight) * 100}%`,
                      width: `${(obj.width / canvasWidth) * 100}%`,
                      height: `${(obj.height / canvasHeight) * 100}%`,
                      opacity: obj.opacity,
                      transform: `rotate(${obj.rotation}deg)`,
                    }}
                  >
                    {obj.type === 'text' && (
                      <div
                        style={{
                          fontFamily: obj.fontFamily,
                          fontSize: `${Math.max(8, (obj.fontSize || 16) * 0.4)}px`,
                          fontWeight: obj.fontWeight,
                          color: obj.textColor,
                          backgroundColor: obj.backgroundColor,
                          textAlign: obj.textAlign as any,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          wordWrap: 'break-word',
                          overflow: 'hidden',
                        }}
                      >
                        {obj.text}
                      </div>
                    )}
                    {obj.type === 'image' && obj.src && (
                      <img
                        src={obj.src || "/placeholder.svg"}
                        alt="Design element"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                    {obj.type === 'icon' && obj.src && (
                      <img
                        src={obj.src || "/placeholder.svg"}
                        alt="Icon"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                    {obj.type === 'shape' && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                        {obj.shapeType === 'rectangle' && (
                          <rect
                            x="0"
                            y="0"
                            width="100"
                            height="100"
                            fill={obj.fill}
                            stroke={obj.stroke}
                            strokeWidth={obj.strokeWidth}
                          />
                        )}
                        {obj.shapeType === 'circle' && (
                          <circle
                            cx="50"
                            cy="50"
                            r="50"
                            fill={obj.fill}
                            stroke={obj.stroke}
                            strokeWidth={obj.strokeWidth}
                          />
                        )}
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <p className="text-gray-600">Canvas Size</p>
                <p className="font-bold">{canvasWidth}" × {canvasHeight}"</p>
              </div>
              <div>
                <p className="text-gray-600">Total Elements</p>
                <p className="font-bold">{objects.length} items</p>
              </div>
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-bold">{quantity} units</p>
              </div>
              <div>
                <p className="text-gray-600">Total Price</p>
                <p className="font-bold text-blue-600">${designPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                Back to Edit
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  alert(`Purchase ${quantity} sign(s) for $${designPrice.toFixed(2)}. Redirecting to checkout...`)
                  setIsPreviewMode(false)
                }}
              >
                <Check className="size-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
