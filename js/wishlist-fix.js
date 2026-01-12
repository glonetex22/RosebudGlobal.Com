/**
 * Wishlist Button Visibility Fix
 * Ensures wishlist button is always visible on product pages
 */

(function() {
    'use strict';
    
    function forceWishlistVisible() {
        const wishlistBtn = document.getElementById('wishlistBtn');
        const actionRow = document.getElementById('actionRow');
        
        if (wishlistBtn) {
            wishlistBtn.style.setProperty('display', 'flex', 'important');
            wishlistBtn.style.setProperty('visibility', 'visible', 'important');
            wishlistBtn.style.setProperty('opacity', '1', 'important');
            wishlistBtn.style.setProperty('border', '1px solid #D63585', 'important');
            wishlistBtn.style.setProperty('position', 'relative', 'important');
            wishlistBtn.style.setProperty('z-index', '1', 'important');
            wishlistBtn.style.setProperty('flex', '1', 'important');
            wishlistBtn.style.setProperty('min-width', '150px', 'important');
            
            // Get computed styles to check if it's visible
            const computedStyle = window.getComputedStyle(wishlistBtn);
            const rect = wishlistBtn.getBoundingClientRect();
            console.log('✅ Wishlist button forced visible', {
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity,
                position: computedStyle.position,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                visible: rect.width > 0 && rect.height > 0 && rect.top >= 0
            });
        } else {
            console.warn('⚠️ Wishlist button not found');
        }
        
        if (actionRow) {
            actionRow.style.setProperty('display', 'flex', 'important');
            actionRow.style.setProperty('flex-direction', 'row', 'important');
            actionRow.style.setProperty('visibility', 'visible', 'important');
            actionRow.style.setProperty('opacity', '1', 'important');
            actionRow.style.setProperty('position', 'relative', 'important');
            actionRow.style.setProperty('width', '100%', 'important');
            actionRow.style.setProperty('align-items', 'center', 'important');
        }
    }
    
    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceWishlistVisible);
    } else {
        forceWishlistVisible();
    }
    
    // Also run after a short delay to catch any late-loading scripts
    setTimeout(forceWishlistVisible, 100);
    setTimeout(forceWishlistVisible, 500);
    setTimeout(forceWishlistVisible, 1000);
})();
