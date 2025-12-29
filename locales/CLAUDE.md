# 翻译模块 (locales/)

[根目录](../CLAUDE.md) > **locales**

> 最后更新: 2025-12-29 14:41:32

---

## 模块职责

翻译模块负责：
- 多语言翻译资源管理（10种语言）
- 翻译键值对存储（JSON格式）
- 支持嵌套翻译键结构
- 与i18next框架集成

---

## 入口与启动

### 翻译文件结构
```
locales/
├── en/translation.json (724个键值) ✅ 完整支持
├── zh/translation.json (723个键值) ✅ 完整支持
├── de/translation.json (709个键值) ✅ 完整支持
├── es/translation.json (709个键值) ✅ 完整支持
├── fr/translation.json (83个键值) 🚧 预备语言
├── it/translation.json (83个键值) 🚧 预备语言
├── ja/translation.json (84个键值) 🚧 预备语言
├── ko/translation.json (83个键值) 🚧 预备语言
├── pt/translation.json (83个键值) 🚧 预备语言
└── ru/translation.json (83个键值) 🚧 预备语言
```

### 加载方式
- **构建时**: `multilang-builder.js`加载并替换翻译键
- **运行时**: `i18n.js`通过i18next动态加载

---

## 对外接口

### 翻译键结构
```json
{
    "page_title": "Screen Size Checker",
    "page_description": "Check your screen size...",

    "ppiCalculator": {
        "title": "PPI Calculator",
        "intro": "Calculate pixel density...",
        "form": {
            "inputTitle": "Enter Screen Parameters",
            "widthLabel": "Horizontal Pixels",
            "heightLabel": "Vertical Pixels",
            "diagonalLabel": "Diagonal Size (inches)",
            "calculateButton": "Calculate PPI",
            "validation": {
                "invalidNumber": "Please enter a valid number",
                "positiveNumber": "Please enter a positive number"
            }
        },
        "result": {
            "title": "Calculation Result",
            "ppiLabel": "Pixel Density (PPI)",
            "categoryLabel": "Display Category"
        }
    },

    "blog": {
        "title": "Technical Blog",
        "readMore": "Read More",
        "categories": {
            "technical": "Technical",
            "css": "CSS",
            "basics": "Basics"
        }
    }
}
```

### 嵌套键访问
```javascript
// 构建时
{{t:ppiCalculator.title}}  // → "PPI Calculator"

// 运行时
i18next.t('ppiCalculator.form.validation.invalidNumber')
// → "Please enter a valid number"
```

---

## 关键依赖与配置

### 依赖关系
- **构建时**: `multilang-builder.js`读取翻译文件
- **运行时**: `i18n.js`通过i18next加载翻译
- **验证**: `translation-validator.js`检查翻译完整性

### 配置
- 默认语言: `en`
- 启用语言: `['en', 'zh', 'de', 'es']`
- 支持语言: `['en', 'zh', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'pt', 'it']`

---

## 数据模型

### 翻译文件结构
```json
{
    // 页面级翻译
    "page_title": "string",
    "page_description": "string",

    // 组件级翻译（嵌套）
    "componentName": {
        "title": "string",
        "description": "string",
        "nested": {
            "key": "string"
        }
    },

    // 通用翻译
    "common": {
        "buttons": {
            "submit": "string",
            "cancel": "string"
        },
        "messages": {
            "success": "string",
            "error": "string"
        }
    }
}
```

### 语言覆盖率
| 语言 | 代码 | 键值数 | 状态 | 覆盖率 |
|:-----|:-----|:-------|:-----|:-------|
| 英文 | en | 724 | ✅ 完整 | 100% |
| 中文 | zh | 723 | ✅ 完整 | 99.9% |
| 德语 | de | 709 | ✅ 完整 | 97.9% |
| 西班牙语 | es | 709 | ✅ 完整 | 97.9% |
| 法语 | fr | 83 | 🚧 预备 | 11.5% |
| 意大利语 | it | 83 | 🚧 预备 | 11.5% |
| 日语 | ja | 84 | 🚧 预备 | 11.6% |
| 韩语 | ko | 83 | 🚧 预备 | 11.5% |
| 葡萄牙语 | pt | 83 | 🚧 预备 | 11.5% |
| 俄语 | ru | 83 | 🚧 预备 | 11.5% |

---

## 测试与质量

### 翻译验证
- ✅ 构建时自动验证（translation-validator.js）
- ✅ 检测缺失翻译键
- ✅ 检测不一致翻译
- ✅ 生成验证报告（translation-validation-report.json）

### 质量标准
1. **完整性**: 所有启用语言必须有完整翻译
2. **一致性**: 相同键在不同语言中应有对应翻译
3. **格式**: 使用标准JSON格式，支持嵌套
4. **命名**: 使用驼峰命名法，语义清晰

### 已知问题
- 预备语言翻译不完整（仅11.5%覆盖率）
- 部分嵌套键在某些语言中缺失
- 需要定期同步新增翻译键

---

## 常见问题 (FAQ)

### Q: 如何添加新的翻译键？
A:
1. 在`en/translation.json`中添加新键（作为基准）
2. 在其他启用语言中添加对应翻译
3. 运行`npm run multilang-build`验证
4. 检查`translation-validation-report.json`

### Q: 如何启用新语言？
A:
1. 在`locales/`下创建新语言目录（如`fr/`）
2. 复制`en/translation.json`并翻译所有键值
3. 在`multilang-builder.js`中添加到`enabledLanguages`
4. 运行构建并测试

### Q: 翻译不显示怎么办？
A: 检查：
1. 翻译键是否存在于对应语言文件中
2. 翻译键拼写是否正确（区分大小写）
3. 是否使用了嵌套键（需要用点号分隔）
4. 查看浏览器控制台是否有i18next错误

### Q: 如何处理嵌套翻译键？
A:
```json
// 正确的嵌套结构
{
    "ppiCalculator": {
        "form": {
            "validation": {
                "invalidNumber": "Please enter a valid number"
            }
        }
    }
}

// 访问方式
// 构建时: {{t:ppiCalculator.form.validation.invalidNumber}}
// 运行时: i18next.t('ppiCalculator.form.validation.invalidNumber')
```

---

## 相关文件清单

### 完整支持语言（4个）
- `en/translation.json` (724个键值) - 英文（基准语言）
- `zh/translation.json` (723个键值) - 中文
- `de/translation.json` (709个键值) - 德语
- `es/translation.json` (709个键值) - 西班牙语

### 预备语言（6个）
- `fr/translation.json` (83个键值) - 法语
- `it/translation.json` (83个键值) - 意大利语
- `ja/translation.json` (84个键值) - 日语
- `ko/translation.json` (83个键值) - 韩语
- `pt/translation.json` (83个键值) - 葡萄牙语
- `ru/translation.json` (83个键值) - 俄语

### 验证报告
- `../build/translation-validation-report.json` - 翻译验证报告

---

## 变更记录

### 2025-12-29 - 初始化模块文档
- 创建翻译模块文档
- 记录10种语言的翻译文件
- 整理翻译覆盖率和质量标准
