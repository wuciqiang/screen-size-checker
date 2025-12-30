/**
 * Scroll Animations - Refined Version
 * 精简版滚动动画 - 仅在必要时触发
 */

(function() {
    'use strict';

    // 配置 - 更严格的阈值
    const config = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15  // 元素 15% 可见时触发
    };

    // 创建观察器
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // 一次性动画，立即停止观察
                observer.unobserve(entry.target);
            }
        });
    }, config);

    // DOM 就绪后执行
    function init() {
        // 选择需要动画的元素 - 更通用的选择器
        const elements = document.querySelectorAll(`
            .scroll-reveal,
            .animate-on-scroll,
            .card:not(.hero-section .card),
            .blog-card,
            .tool-card,
            .device-card,
            .game-card
        `);

        // 观察所有元素
        elements.forEach((el, index) => {
            // 添加错落延迟类（最多 5 个层级）
            if (index < 5) {
                el.style.transitionDelay = `${index * 50}ms`;
            }
            observer.observe(el);
        });

        console.log(`📊 Scroll animations initialized: ${elements.length} elements`);
    }

    // 确保 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
