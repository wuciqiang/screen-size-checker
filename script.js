// --- i18next 初始化 ---
async function initializeI18next() {
    // 等待 i18next 初始化完成
    await i18next
        .use(i18nextHttpBackend) // 使用 http backend 加载 locales/xx/translation.json
        .use(i18nextBrowserLanguageDetector) // 使用语言检测器
        .init({
            // debug: true, // 开发时可以开启，查看详细日志
            lng: 'en',          // <--- 这里是关键！设置默认加载的语言为英语
            fallbackLng: 'en',  // 如果检测的语言或请求的语言不可用，回退到英语
            supportedLngs: ['en', 'zh', 'fr', 'de', 'ko', 'ja'], // 明确支持的语言列表
            backend: {
                loadPath: 'locales/{{lng}}/{{ns}}.json' // 指定翻译文件的路径格式
            },
            detection: {
                // 检测顺序：先检查 localStorage，然后是浏览器的 navigator.language
                order: ['localStorage', 'navigator'],
                // 将用户的语言选择缓存到 localStorage 中
                caches: ['localStorage'],
                // 在 localStorage 中使用的键名
                lookupLocalStorage: 'i18nextLng'
            }
        });

    // --- 初始化 UI 翻译 ---
    updateUIElements(); // 使用当前语言（首次是 'en'）翻译所有标记的元素

    // --- 设置语言选择下拉框 ---
    const langSelector = document.getElementById('language-select');
    if (langSelector) {
        // 将下拉框的当前值设置为 i18next 检测到的或默认的语言
        // 使用 split('-')[0] 来获取基础语言代码 (例如从 'en-US' 获取 'en')
        langSelector.value = i18next.language.split('-')[0];

        // 添加事件监听器，当用户改变下拉框选项时
        langSelector.addEventListener('change', (event) => {
            const chosenLng = event.target.value;
            // 调用 i18next 切换语言
            i18next.changeLanguage(chosenLng, (err, t) => {
                if (err) return console.error('切换语言时出错:', err);
                // 语言切换成功后，i18next 会触发 'languageChanged' 事件，
                // 我们会在下面的事件监听器中处理 UI 更新
            });
        });
    }

    // --- 监听语言切换事件 ---
    i18next.on('languageChanged', () => {
        updateUIElements(); // 语言改变后，重新翻译所有 UI 元素
        // 重新运行 updateDisplay，以确保 "检测中..." 等文本也被正确翻译
        updateDisplay();
    });

    // --- 首次加载时显示屏幕信息 ---
    updateDisplay(); // 调用你原有的函数来获取并显示屏幕数据
}

// --- 更新 UI 元素文本的函数 ---
function updateUIElements() {
    // 查找所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        let attribute = 'textContent'; // 默认更新元素的文本内容

        // 检查是否是更新属性的语法，例如 [placeholder]key
        if (key.startsWith('[')) {
            const parts = key.match(/\[(.*?)\](.*)/); // 正则匹配 [属性名]键名
            if (parts && parts.length === 3) {
                attribute = parts[1]; // 获取属性名
                const actualKey = parts[2]; // 获取真正的翻译键

                // 特殊处理 title 和 meta description
                if (el.tagName === 'TITLE') {
                    document.title = i18next.t(actualKey);
                } else if (el.tagName === 'META' && attribute === 'content') {
                    el.setAttribute('content', i18next.t(actualKey));
                } else if (el.hasAttribute(attribute)) { // 更新其他 HTML 属性
                    el.setAttribute(attribute, i18next.t(actualKey));
                }
                // 注意：上面已经处理了，不再执行下面的默认 textContent 更新
                return;
            }
        }

        // 更新元素的文本内容 (默认情况)
        // 对 title 做特殊处理，因为它不在 document.body 内
        if (el.tagName === 'TITLE') {
             document.title = i18next.t(key);
         } else {
             el.textContent = i18next.t(key); // 使用 i18next.t() 获取当前语言的翻译
         }
    });
}


// --- 你原有的函数 (需要修改以支持翻译) ---

// 更新显示信息的函数
function updateDisplay() {
    const t = i18next.t; // 获取翻译函数，方便使用

    // 1. 屏幕分辨率
    const screenW = window.screen.width;
    const screenH = window.screen.height;
    const screenResEl = document.getElementById('screen-resolution');
    if (screenResEl) {
        screenResEl.textContent = screenW && screenH ? `${screenW} x ${screenH}` : t('not_available'); // 使用翻译
    }

    // 2. 视窗大小
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const viewportValueSpan = document.getElementById('viewport-size')?.querySelector('span:not(.note)');
    const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');
    if (viewportValueSpan) {
        viewportValueSpan.textContent = viewportW && viewportH ? `${viewportW} x ${viewportH}` : t('not_available'); // 使用翻译
    }
     if (viewportNoteSpan) {
        viewportNoteSpan.textContent = t('viewport_dynamic_note'); // 更新提示文本翻译
    }

    // 3. 设备像素比
    const dpr = window.devicePixelRatio;
    const dprEl = document.getElementById('dpr');
     if (dprEl) {
        dprEl.textContent = dpr ? dpr : t('not_available'); // 使用翻译
    }

    // 4. 颜色深度
    const colorDepth = window.screen.colorDepth;
    const colorDepthEl = document.getElementById('color-depth');
    if (colorDepthEl) {
        colorDepthEl.textContent = colorDepth ? `${colorDepth}-bit` : t('not_available'); // 使用翻译
    }

    // 5. User Agent
    const userAgent = navigator.userAgent;
    const userAgentTextarea = document.getElementById('user-agent');
    if (userAgentTextarea) {
         userAgentTextarea.value = userAgent ? userAgent : t('not_available'); // 使用翻译 (value)
         // 如果需要更新 placeholder 的翻译
         const placeholderKey = userAgentTextarea.getAttribute('data-i18n');
         if (placeholderKey && placeholderKey.startsWith('[placeholder]')) {
             userAgentTextarea.setAttribute('placeholder', t(placeholderKey.substring('[placeholder]'.length)))
         } else {
             // 如果没有用 data-i18n 指定 placeholder，但希望它也能翻译
             // userAgentTextarea.setAttribute('placeholder', t('detecting'));
         }
    }
}

// 更新模拟器预览尺寸的函数 (修改以确保标签翻译)
function setPreviewSize(width, height) {
    const t = i18next.t; // 获取翻译函数
    const frame = document.getElementById('simulator-frame');
    const sizeDisplay = document.getElementById('simulator-size-display');

    // ... (计算 effectiveWidth, effectiveHeight 的代码保持不变) ...
    const maxWidth = document.querySelector('.container').offsetWidth - 44;
    const maxHeight = window.innerHeight * 0.5;
    const effectiveWidth = Math.min(width, maxWidth);
    const effectiveHeight = Math.min(height, maxHeight);

    frame.style.width = `${effectiveWidth}px`;
    frame.style.height = `${effectiveHeight}px`;

    // 更新尺寸显示文本，确保标签部分是翻译过的
    if (sizeDisplay) {
        sizeDisplay.textContent = `${t('simulator_current_size')} ${width} x ${height}`;
    }
}

// --- 事件监听器 ---

// DOM 加载完成后，初始化 i18next 并进行首次 UI 更新
document.addEventListener('DOMContentLoaded', initializeI18next);

// 浏览器窗口大小改变时，动态更新视窗大小显示
window.addEventListener('resize', () => {
    const t = i18next.t; // 获取翻译函数
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const viewportValueSpan = document.getElementById('viewport-size')?.querySelector('span:not(.note)');
    const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');
    if (viewportValueSpan) {
        viewportValueSpan.textContent = viewportW && viewportH ? `${viewportW} x ${viewportH}` : t('not_available');
    }
     if (viewportNoteSpan) {
        viewportNoteSpan.textContent = t('viewport_dynamic_note'); // 确保提示也更新
    }
});