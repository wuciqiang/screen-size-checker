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

    let textToCopy = '';
    // Check if target is textarea or other element
    if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
        textToCopy = targetElement.value;
    } else {
        textToCopy = targetElement.textContent;
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
        await navigator.clipboard.writeText(textToCopy);
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