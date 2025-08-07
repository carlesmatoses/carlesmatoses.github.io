/**
 * Anchor Link Highlighting Script
 * Highlights target elements when internal anchor links are clicked
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Function to highlight an element
    function highlightElement(element) {
        // Remove any existing highlight classes
        element.classList.remove('target-highlight', 'target-glow');
        
        // Force a reflow to ensure the class is removed
        element.offsetHeight;
        
        // Add highlight class (you can switch between 'target-highlight' and 'target-glow')
        element.classList.add('target-highlight');
        
        // Remove the highlight class after animation completes
        setTimeout(() => {
            element.classList.remove('target-highlight');
        }, 3000);
    }
    
    // Handle anchor links when clicked
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Check if it's an internal anchor link (starts with #)
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Small delay to ensure scrolling happens first
                setTimeout(() => {
                    highlightElement(targetElement);
                }, 100);
            }
        }
    });
    
    // Also handle direct navigation to anchors (e.g., from URL hash)
    function highlightFromHash() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                setTimeout(() => {
                    highlightElement(targetElement);
                }, 500); // Longer delay for direct navigation
            }
        }
    }
    
    // Highlight on page load if there's a hash
    highlightFromHash();
    
    // Highlight when hash changes (e.g., browser back/forward)
    window.addEventListener('hashchange', highlightFromHash);
});
