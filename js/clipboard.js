// clipboard.js - Clipboard functionality module

/**
 * Handle copy button click
 * @param {Event} event - Click event
 */
export async function handleCopyClick(event) {
    if (!event.target.classList.contains('copy-btn')) {
        return; // Ignore clicks not on a copy button
    }

    const button = event.target;
    const targetId = button.dataset.clipboardTarget;
    if (!targetId) {
        console.warn("Copy button missing data-clipboard-target attribute.");
        return;
    }

    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
        console.warn(`Target element with ID "${targetId}" not found for copying.`);
        return;
    }

    // Get the label text if available
    let labelText = '';
    const labelElement = targetElement.closest('.info-item')?.querySelector('.label');
    if (labelElement) {
        labelText = labelElement.textContent.trim();
    }

    let valueText = '';
    // Check if target is textarea or other element
    if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
        valueText = targetElement.value;
    } else {
        valueText = targetElement.textContent;
    }

    // Combine label and value if both exist
    let textToCopy = '';
    if (labelText && valueText) {
        textToCopy = `${labelText} ${valueText}`;
    } else {
        textToCopy = valueText;
    }

    if (!textToCopy || textToCopy === i18next.t('detecting') || textToCopy === i18next.t('not_available')) {
        console.info("Attempted to copy placeholder or unavailable text.");
        // Optional: Provide visual feedback that nothing was copied
        const originalText = button.textContent;
        button.textContent = i18next.t('copy_nothing_feedback') || "Nothing to copy";
        button.disabled = true;
        setTimeout(() => {
            button.textContent = originalText; // Restore original text
            button.disabled = false;
        }, 1500);
        return;
    }

    try {
        // Try using the modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                textArea.remove();
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                textArea.remove();
                throw new Error('Fallback: Oops, unable to copy');
            }
        }

        // Visual feedback
        const originalText = i18next.t('copy_btn'); // Get translated "Copy" text
        button.textContent = i18next.t('copied_btn'); // Get translated "Copied!" text
        button.classList.add('copied');
        button.disabled = true; // Briefly disable button

        // Reset button after a delay
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
            button.disabled = false;
        }, 1500); // 1.5 seconds

    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Optional: Provide user feedback about the error
        const originalText = button.textContent;
        button.textContent = i18next.t('copy_failed_feedback') || "Copy failed";
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }
}

/**
 * Copy all detected information
 */
export async function copyAllInfo() {
    const infoItems = document.querySelectorAll('.info-item');
    let allInfo = '';
    
    infoItems.forEach(item => {
        const label = item.querySelector('.label')?.textContent.trim();
        const value = item.querySelector('.value')?.textContent.trim();
        
        if (label && value && value !== i18next.t('detecting') && value !== i18next.t('not_available')) {
            allInfo += `${label} ${value}\n`;
        }
    });

    if (!allInfo) {
        console.info("No information available to copy.");
        return false;
    }

    try {
        // Try using the modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(allInfo);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = allInfo;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                textArea.remove();
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                textArea.remove();
                throw new Error('Fallback: Oops, unable to copy');
            }
        }
        return true;
    } catch (err) {
        console.error('Failed to copy all information: ', err);
        return false;
    }
} 