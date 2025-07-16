/**
 * 博客系统的JavaScript功能
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化代码高亮
    initializeCodeHighlighting();
    
    // 初始化目录生成
    generateTableOfContents();
    
    // 初始化阅读进度
    initializeReadingProgress();
    
    // 初始化分享功能
    initializeShareButtons();
    
    // 添加代码复制按钮
    addCodeCopyButtons();
});

/**
 * 初始化代码高亮
 */
function initializeCodeHighlighting() {
    // 如果hljs存在，则应用高亮
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        
        console.log('✅ Code highlighting applied');
    } else {
        console.warn('⚠️ highlight.js not loaded');
    }
}

/**
 * 生成文章目录
 */
function generateTableOfContents() {
    const tocContainer = document.querySelector('#toc .toc-container');
    const article = document.querySelector('.blog-post-content');
    
    // 如果不存在文章内容或目录容器，则返回
    if (!tocContainer || !article) return;
    
    // 获取文章中的所有标题元素
    const headings = article.querySelectorAll('h2, h3, h4');
    
    // 如果没有标题，则隐藏目录
    if (headings.length === 0) {
        document.querySelector('#toc').style.display = 'none';
        return;
    }
    
    // 创建目录列表
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    
    // 为每个标题生成目录项
    headings.forEach((heading, index) => {
        // 为标题添加ID（如果没有）
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // 创建目录项
        const listItem = document.createElement('li');
        listItem.className = `toc-item toc-level-${heading.tagName.toLowerCase()}`;
        
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 滚动到标题位置
            const targetHeading = document.getElementById(heading.id);
            const headerOffset = 80; // 考虑到固定导航栏的高度
            const elementPosition = targetHeading.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // 更新URL哈希，但不触发滚动
            history.pushState(null, null, `#${heading.id}`);
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    // 将目录添加到容器
    tocContainer.appendChild(tocList);
    
    // 添加滚动监听，更新活动目录项
    window.addEventListener('scroll', updateActiveTableOfContents);
    
    console.log('✅ Table of contents generated');
}

/**
 * 更新目录中的活动项
 */
function updateActiveTableOfContents() {
    const tocLinks = document.querySelectorAll('#toc a');
    if (!tocLinks.length) return;
    
    const headings = document.querySelectorAll('.blog-post-content h2, .blog-post-content h3, .blog-post-content h4');
    
    // 找到当前视口中可见的第一个标题
    let activeHeadingId = null;
    
    headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) { // 100px是判断标题是否可见的阈值
            activeHeadingId = heading.id;
        }
    });
    
    // 移除所有活动状态
    tocLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 为当前活动标题添加活动状态
    if (activeHeadingId) {
        const activeLink = document.querySelector(`#toc a[href="#${activeHeadingId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

/**
 * 初始化阅读进度条
 */
function initializeReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        // 获取文章内容元素
        const article = document.querySelector('.blog-post-content');
        if (!article) return;
        
        // 计算阅读进度
        const windowHeight = window.innerHeight;
        const articleHeight = article.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const articleTop = article.offsetTop;
        const articleBottom = articleTop + articleHeight;
        
        // 计算完成百分比
        let progress = ((scrollTop - articleTop + windowHeight) / (articleHeight + windowHeight)) * 100;
        
        // 限制在0-100范围内
        progress = Math.max(0, Math.min(100, progress));
        
        // 更新进度条
        progressBar.style.width = `${progress}%`;
    });
    
    console.log('✅ Reading progress initialized');
}

/**
 * 初始化分享按钮
 */
function initializeShareButtons() {
    // 获取所有分享按钮
    const shareButtons = document.querySelectorAll('.share-btn');
    if (!shareButtons.length) return;
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取要分享的URL和标题
            const url = this.getAttribute('data-url') || window.location.href;
            const title = this.getAttribute('data-title') || document.title;
            
            // 根据按钮类型执行不同的分享操作
            if (this.classList.contains('share-twitter')) {
                shareToTwitter(url, title);
            } else if (this.classList.contains('share-facebook')) {
                shareToFacebook(url);
            } else if (this.classList.contains('share-linkedin')) {
                shareToLinkedIn(url, title);
            } else if (this.classList.contains('share-copy')) {
                copyShareLink(url);
            }
        });
    });
    
    console.log('✅ Share buttons initialized');
}

/**
 * 分享到Twitter
 */
function shareToTwitter(url, title) {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank');
}

/**
 * 分享到Facebook
 */
function shareToFacebook(url) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
}

/**
 * 分享到LinkedIn
 */
function shareToLinkedIn(url, title) {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank');
}

/**
 * 复制分享链接
 */
function copyShareLink(url) {
    // 尝试使用现代API复制
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url)
            .then(() => showCopySuccess())
            .catch(() => fallbackCopyMethod(url));
    } else {
        // 回退到传统方法
        fallbackCopyMethod(url);
    }
}

/**
 * 回退的复制方法
 */
function fallbackCopyMethod(text) {
    try {
        // 创建临时textarea
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // 避免影响页面布局
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        
        // 尝试复制
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showCopySuccess();
        } else {
            showCopyError();
        }
    } catch (err) {
        console.error('❌ Failed to copy: ', err);
        showCopyError();
    }
}

/**
 * 显示复制成功通知
 */
function showCopySuccess() {
    // 找到复制按钮并添加成功类
    const copyButton = document.querySelector('.share-copy');
    if (copyButton) {
        const originalText = copyButton.textContent;
        copyButton.textContent = document.documentElement.lang === 'zh' ? '已复制!' : 'Copied!';
        copyButton.classList.add('copied');
        
        // 2秒后恢复原样
        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('copied');
        }, 2000);
    }
    
    // 显示toast通知
    if (typeof showToast === 'function') {
        const message = document.documentElement.lang === 'zh' ? '链接已复制到剪贴板' : 'Link copied to clipboard';
        showToast(message);
    }
}

/**
 * 显示复制错误通知
 */
function showCopyError() {
    if (typeof showToast === 'function') {
        const message = document.documentElement.lang === 'zh' ? '复制失败，请手动复制' : 'Copy failed, please copy manually';
        showToast(message, 'error');
    }
}

/**
 * 为代码块添加复制按钮
 */
function addCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('.blog-post-content pre');
    
    codeBlocks.forEach((codeBlock, index) => {
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.textContent = document.documentElement.lang === 'zh' ? '复制' : 'Copy';
        copyButton.setAttribute('aria-label', document.documentElement.lang === 'zh' ? '复制代码' : 'Copy code');
        copyButton.setAttribute('data-index', index);
        
        // 将按钮添加到代码块
        codeBlock.appendChild(copyButton);
        
        // 添加点击事件
        copyButton.addEventListener('click', function() {
            // 获取代码内容
            const code = codeBlock.querySelector('code').textContent;
            
            // 复制代码
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(code)
                    .then(() => showCodeCopySuccess(copyButton))
                    .catch(() => fallbackCodeCopyMethod(code, copyButton));
            } else {
                fallbackCodeCopyMethod(code, copyButton);
            }
        });
    });
    
    console.log('✅ Code copy buttons added');
}

/**
 * 代码复制成功
 */
function showCodeCopySuccess(button) {
    const originalText = button.textContent;
    button.textContent = document.documentElement.lang === 'zh' ? '已复制!' : 'Copied!';
    button.classList.add('copied');
    
    // 2秒后恢复原样
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
}

/**
 * 回退的代码复制方法
 */
function fallbackCodeCopyMethod(text, button) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showCodeCopySuccess(button);
        }
    } catch (err) {
        console.error('❌ Failed to copy code: ', err);
    }
} 