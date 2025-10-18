/**
 * Mega Menu JavaScript - Phase 0.2
 * Handles navigation menu interactions, mobile menu, and accessibility
 */

(function() {
    'use strict';
    
    // ========================================
    // Mobile Menu Toggle
    // ========================================
    function initMobileMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const nav = document.getElementById('main-nav');
        const overlay = document.getElementById('mobile-menu-overlay');
        
        if (!toggle || !nav || !overlay) return;
        
        // Toggle mobile menu
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when overlay is clicked
        overlay.addEventListener('click', function() {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close menu when window is resized to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                toggle.classList.remove('active');
                nav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ========================================
    // Mobile Dropdown Expansion
    // ========================================
    function initMobileDropdowns() {
        // Only apply on mobile
        if (window.innerWidth > 768) return;
        
        const navItems = document.querySelectorAll('.nav-item.has-megamenu, .nav-item.has-dropdown');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            if (!link) return;
            
            // Add click handler for mobile
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    
                    // Toggle expanded class
                    item.classList.toggle('expanded');
                    
                    // Close other expanded items
                    navItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('expanded');
                        }
                    });
                }
            });
        });
        
        // Re-initialize on resize
        window.addEventListener('resize', function() {
            initMobileDropdowns();
        });
    }
    
    // ========================================
    // Keyboard Navigation (Accessibility)
    // ========================================
    function initKeyboardNav() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            if (!link) return;
            
            // Handle keyboard navigation
            link.addEventListener('keydown', function(e) {
                // Open dropdown with Enter or Space
                if (e.key === 'Enter' || e.key === ' ') {
                    if (item.classList.contains('has-megamenu') || item.classList.contains('has-dropdown')) {
                        e.preventDefault();
                        item.classList.toggle('expanded');
                    }
                }
                
                // Close dropdown with Escape
                if (e.key === 'Escape') {
                    item.classList.remove('expanded');
                    link.focus();
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item')) {
                navItems.forEach(item => {
                    item.classList.remove('expanded');
                });
            }
        });
    }
    
    // ========================================
    // Hover Intent (Delayed hover for better UX)
    // ========================================
    function initHoverIntent() {
        const navItems = document.querySelectorAll('.nav-item.has-megamenu, .nav-item.has-dropdown');
        let hoverTimeout;
        
        navItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                // Clear any existing timeout
                clearTimeout(hoverTimeout);
                
                // Add slight delay before showing menu (prevents accidental opens)
                hoverTimeout = setTimeout(() => {
                    this.classList.add('hover');
                }, 100);
            });
            
            item.addEventListener('mouseleave', function() {
                clearTimeout(hoverTimeout);
                this.classList.remove('hover');
            });
        });
    }
    
    // ========================================
    // Scroll Behavior (Shrink header on scroll)
    // ========================================
    function initScrollBehavior() {
        const header = document.querySelector('.header-v2');
        if (!header) return;
        
        let lastScroll = 0;
        const scrollThreshold = 100;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Add scrolled class after threshold
            if (currentScroll > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide header on scroll down, show on scroll up
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                header.classList.add('hide');
            } else {
                header.classList.remove('hide');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // ========================================
    // Active Link Highlighting
    // ========================================
    function initActiveLinks() {
        // Skip if active states are already set by server
        const hasServerActive = document.querySelector('.nav-link.active');
        if (hasServerActive) {
            return; // Server-side active states take precedence
        }
        
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check if current page matches this link
            if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
                link.classList.add('active');
                
                // Also mark parent nav-item as active
                const navItem = link.closest('.nav-item');
                if (navItem) {
                    navItem.classList.add('active');
                }
            }
        });
    }
    
    // ========================================
    // Analytics Tracking (Optional)
    // ========================================
    function initAnalytics() {
        const megaMenuLinks = document.querySelectorAll('.mega-menu a, .dropdown-menu a');
        
        megaMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                const linkText = this.textContent.trim();
                const linkHref = this.getAttribute('href');
                const menuType = this.closest('.mega-menu') ? 'mega-menu' : 'dropdown';
                
                // Send event to analytics (if available)
                if (window.gtag) {
                    window.gtag('event', 'navigation_click', {
                        'menu_type': menuType,
                        'link_text': linkText,
                        'link_url': linkHref
                    });
                }
                
                // Console log for debugging
                console.log('Nav click:', { menuType, linkText, linkHref });
            });
        });
    }
    
    // ========================================
    // Initialize All Functions
    // ========================================
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // Initialize all features
        initMobileMenu();
        initMobileDropdowns();
        initKeyboardNav();
        initHoverIntent();
        initScrollBehavior();
        initActiveLinks();
        initAnalytics();
        
        console.log('✅ Mega Menu initialized');
    }
    
    // Start initialization
    init();
    
})();
