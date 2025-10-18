// language-modal.js - Language selection modal functionality

/**
 * Language Modal Manager
 * Handles the language selection modal with smart URL mapping and preferences
 */
class LanguageModal {
    constructor() {
        this.modal = null;
        this.backdrop = null;
        this.closeButton = null;
        this.trigger = null;
        this.languageCards = null;
        this.isOpen = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the modal
     */
    init() {
        console.log('🌐 Initializing Language Modal...');
        
        // Get DOM elements
        this.modal = document.getElementById('language-modal');
        this.backdrop = document.getElementById('language-modal-backdrop');
        this.closeButton = document.getElementById('language-modal-close');
        this.trigger = document.getElementById('language-modal-trigger');
        
        if (!this.modal || !this.trigger) {
            console.warn('Language modal elements not found');
            return;
        }
        
        this.languageCards = this.modal.querySelectorAll('.language-card.active');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update disabled cards with coming soon text
        this.updateDisabledCards();
        
        console.log('✅ Language Modal initialized successfully');
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Open modal when trigger is clicked
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });
        
        // Close modal when backdrop is clicked
        this.backdrop.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when close button is clicked
        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });
        
        // Handle language selection
        this.languageCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedLang = card.getAttribute('data-lang');
                const langName = card.getAttribute('data-lang-name');
                this.selectLanguage(selectedLang, langName);
            });
            
            // Keyboard navigation
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const selectedLang = card.getAttribute('data-lang');
                    const langName = card.getAttribute('data-lang-name');
                    this.selectLanguage(selectedLang, langName);
                }
            });
        });
    }
    
    /**
     * Update disabled language cards with localized "coming soon" text
     */
    updateDisabledCards() {
        const disabledCards = this.modal.querySelectorAll('.language-card.disabled');
        disabledCards.forEach(card => {
            // Set data attribute for CSS content
            card.setAttribute('data-coming-soon', this.getComingSoonText());
        });
    }
    
    /**
     * Get "coming soon" text based on current language
     */
    getComingSoonText() {
        if (typeof i18next !== 'undefined' && i18next.language) {
            return i18next.language === 'zh' ? '即将推出' : 'Coming Soon';
        }
        return 'Coming Soon';
    }
    
    /**
     * Open the modal
     */
    openModal() {
        console.log('🌐 Opening language modal...');
        
        this.isOpen = true;
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management
        this.trapFocus();
        
        // Update coming soon text
        this.updateDisabledCards();
    }
    
    /**
     * Close the modal
     */
    closeModal() {
        console.log('🌐 Closing language modal...');
        
        this.isOpen = false;
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to trigger
        this.trigger.focus();
    }
    
    /**
     * Trap focus within the modal
     */
    trapFocus() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
    
    /**
     * Handle language selection
     */
    selectLanguage(selectedLang, langName) {
        console.log(`🌐 Language selected: ${selectedLang} (${langName})`);
        
        // Save language preference
        this.saveLanguagePreference(selectedLang);
        
        // Get target URL for the selected language
        const targetUrl = this.getTargetUrl(selectedLang);
        
        console.log(`🌐 Redirecting to: ${targetUrl}`);
        
        // Show loading state (optional)
        this.showLoadingState(langName);
        
        // Redirect to the target URL
        window.location.href = targetUrl;
    }
    
    /**
     * Save language preference to localStorage
     */
    saveLanguagePreference(language) {
        try {
            localStorage.setItem('preferred-language', language);
            localStorage.setItem('language-preference-timestamp', Date.now().toString());
            console.log(`✅ Language preference saved: ${language}`);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }
    }
    
    /**
     * Get target URL for the selected language
     * Optimized for SEO redirect structure where root = English, /en/ redirects to root
     */
    getTargetUrl(targetLang) {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentHash = window.location.hash;
        
        console.log(`🔍 Current path: ${currentPath}`);
        
        // Parse current path to extract language and page info
        const pathParts = currentPath.split('/').filter(part => part);
        
        // Determine current language and page path
        let currentLang = 'en';
        let pagePath = '';
        let isRootPath = false;
        
        if (pathParts.length === 0) {
            // Root path (/) - this is English content
            isRootPath = true;
            currentLang = 'en';
            pagePath = '';
        } else {
            // Check if first part is a language code
            const possibleLang = pathParts[0];
            const supportedLangs = ['en', 'zh', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru'];
            
            if (supportedLangs.includes(possibleLang)) {
                currentLang = possibleLang;
                pagePath = pathParts.slice(1).join('/');
                
                // Special handling for /en/ paths - treat as root equivalent
                if (possibleLang === 'en') {
                    console.log('🔄 Detected /en/ path, treating as root equivalent');
                }
            } else {
                // No language prefix - treat as root English content
                currentLang = 'en';
                pagePath = pathParts.join('/');
            }
        }
        
        // Build target URL based on SEO-optimized structure
        let targetUrl;
        
        if (targetLang === 'en') {
            // English: prefer root path without language prefix
            // Special case: blog pages are only available under /en/blog/* in current build output
            if (pagePath) {
                if (pagePath.startsWith('blog/')) {
                    targetUrl = `/en/${pagePath}`;
                } else {
                    targetUrl = `/${pagePath}`;
                }
            } else {
                targetUrl = '/';
            }
            console.log(`🏠 English target: using root path with blog special-case (${targetUrl})`);
        } else {
            // Other languages: use language prefix
            targetUrl = `/${targetLang}`;
            if (pagePath) {
                targetUrl += `/${pagePath}`;
            }
            
            // Ensure trailing slash for directory-like paths (index pages)
            // But NOT for hub pages or other specific page paths
            const isHubPage = pagePath && pagePath.includes('hub/');
            const isFilePath = pagePath && pagePath.includes('.');
            const hasTrailingSlash = pagePath && pagePath.endsWith('/');
            
            if (!pagePath || (!isFilePath && !hasTrailingSlash && !isHubPage)) {
                targetUrl += '/';
            }
            console.log(`🌍 Non-English target: using language prefix (${targetUrl})`);
        }
        
        // Add search params and hash if they exist
        if (currentSearch) {
            targetUrl += currentSearch;
        }
        if (currentHash) {
            targetUrl += currentHash;
        }
        
        console.log(`🎯 Target URL: ${targetUrl} (${currentLang} -> ${targetLang})`);
        console.log(`📊 Language switch mapping: ${currentPath} -> ${targetUrl}`);
        
        return targetUrl;
    }
    
    /**
     * Show loading state while redirecting
     */
    showLoadingState(langName) {
        const modalContent = this.modal.querySelector('.language-modal-body');
        if (modalContent) {
            modalContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px; font-size: 2rem;">🌐</div>
                    <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 10px;">
                        ${this.getLoadingText(langName)}
                    </p>
                    <div style="width: 40px; height: 40px; border: 3px solid var(--border-color); border-top: 3px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            `;
        }
    }
    
    /**
     * Get loading text based on target language
     */
    getLoadingText(langName) {
        if (typeof i18next !== 'undefined' && i18next.language === 'zh') {
            return `正在切换到 ${langName}...`;
        }
        return `Switching to ${langName}...`;
    }
    
    /**
     * Static method to get saved language preference
     */
    static getSavedLanguagePreference() {
        try {
            const savedLang = localStorage.getItem('preferred-language');
            const timestamp = localStorage.getItem('language-preference-timestamp');
            
            // Check if preference is not too old (30 days)
            if (savedLang && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
                
                if (age < maxAge) {
                    return savedLang;
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Failed to get saved language preference:', error);
            return null;
        }
    }
}

// CSS for loading spinner
const spinnerCSS = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Add spinner CSS to document if not already present
if (!document.querySelector('#spinner-css')) {
    const style = document.createElement('style');
    style.id = 'spinner-css';
    style.textContent = spinnerCSS;
    document.head.appendChild(style);
}

// Export for module usage
export { LanguageModal };

// Also create global instance for non-module usage
window.LanguageModal = LanguageModal;

// Auto-initialize
new LanguageModal(); 