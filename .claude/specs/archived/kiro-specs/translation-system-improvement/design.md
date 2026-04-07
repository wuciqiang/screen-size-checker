# Design Document

## Overview

The translation system improvement will standardize and enhance the multilingual support for the Screen Size Checker website. The current system uses a hybrid approach with both build-time (`{{t 'key'}}`) and runtime (`data-i18n`) translation methods. This design will unify the approach, fix missing translations, and improve the overall translation workflow.

## Architecture

### Current State Analysis

The current translation system has several components:
- **Build-time translations**: Handled by `multilang-builder.js` using `{{t 'key'}}` syntax
- **Runtime translations**: Handled by `i18n.js` using `data-i18n` attributes and i18next library
- **Translation files**: JSON files in `locales/{lang}/translation.json` with hierarchical structure
- **Mixed usage**: Some components use build-time, others use runtime translations

### Target Architecture

The improved system will:
1. **Standardize on runtime translations** for interactive components
2. **Keep build-time translations** for static content and SEO elements
3. **Enhance validation** to catch missing translations during build
4. **Improve error handling** for missing translations
5. **Optimize performance** for translation loading and switching

## Components and Interfaces

### 1. Translation Validation System

**Purpose**: Validate translation completeness during build process

**Interface**:
```javascript
class TranslationValidator {
    validateTranslations(languages, components)
    findMissingKeys(referenceLanguage, targetLanguage)
    generateValidationReport()
}
```

**Responsibilities**:
- Scan all components for translation keys
- Compare translation files for completeness
- Generate reports of missing translations
- Fail build if critical translations are missing

### 2. Enhanced Runtime Translation Handler

**Purpose**: Improve the existing i18n.js system

**Interface**:
```javascript
class EnhancedI18nHandler {
    initializeWithValidation()
    updateUIElementsWithFallback()
    handleMissingTranslations(key, fallback)
    validateTranslationKeys()
}
```

**Responsibilities**:
- Initialize i18next with better error handling
- Provide fallback mechanisms for missing translations
- Log missing translation keys for debugging
- Handle dynamic content updates

### 3. Component Translation Standardizer

**Purpose**: Ensure consistent translation usage across components

**Interface**:
```javascript
class ComponentTranslationStandardizer {
    scanComponentForTranslations(componentPath)
    validateTranslationKeyFormat(key)
    suggestKeyNormalization(existingKey)
}
```

**Responsibilities**:
- Scan components for translation usage patterns
- Validate translation key naming conventions
- Suggest improvements for inconsistent keys

### 4. Build-time Translation Processor

**Purpose**: Enhance the existing multilang-builder.js

**Interface**:
```javascript
class BuildTimeTranslationProcessor {
    processStaticTranslations(content, language)
    handleNestedTranslationKeys(key)
    validateBuildTimeTranslations()
}
```

**Responsibilities**:
- Process `{{t 'key'}}` syntax during build
- Handle nested translation keys properly
- Validate that all build-time keys exist

## Data Models

### Translation Key Structure

```javascript
{
  "ppiCalculator": {
    "title": "PPI Calculator",
    "intro": "Calculate pixel density...",
    "form": {
      "inputTitle": "Enter Screen Parameters",
      "horizontalPixels": "Horizontal Pixels",
      "validation": {
        "invalidNumber": "Please enter a valid number",
        "outOfRange": "Value must be between {{min}} and {{max}}"
      }
    },
    "results": {
      "title": "Calculation Result",
      "ppiUnit": "PPI",
      "density": {
        "low": "Low Density",
        "medium": "Medium Density",
        "high": "High Density",
        "veryHigh": "Very High Density"
      }
    }
  }
}
```

### Translation Validation Report

```javascript
{
  "validationDate": "2025-01-26T10:30:00Z",
  "languages": ["en", "zh"],
  "summary": {
    "totalKeys": 476,
    "missingTranslations": 12,
    "inconsistentKeys": 3
  },
  "missingKeys": {
    "zh": [
      "ppiCalculator.form.validation.outOfRange",
      "ppiCalculator.results.density.veryHigh"
    ]
  },
  "inconsistentKeys": [
    {
      "component": "ppi-calculator-content.html",
      "issue": "Uses data-i18n but key not found in translation files",
      "key": "ppiCalculator.inputTitle"
    }
  ]
}
```

## Error Handling

### Missing Translation Keys

1. **Build-time**: Log warning but continue build with fallback
2. **Runtime**: Display fallback text and log error to console
3. **Validation**: Generate report of all missing keys

### Translation File Errors

1. **Invalid JSON**: Fail build with clear error message
2. **Missing language files**: Create empty structure with warnings
3. **Encoding issues**: Detect and report character encoding problems

### Runtime Errors

1. **i18next initialization failure**: Fall back to default language
2. **Network errors loading translations**: Use cached versions
3. **Key interpolation errors**: Display raw key with error logging

## Testing Strategy

### Unit Tests

1. **Translation key validation**: Test key format validation
2. **Missing key detection**: Test missing key identification
3. **Fallback mechanisms**: Test fallback behavior
4. **Key interpolation**: Test variable substitution

### Integration Tests

1. **Build process**: Test complete build with translation validation
2. **Language switching**: Test runtime language switching
3. **Component rendering**: Test translated component rendering
4. **Error scenarios**: Test behavior with missing translations

### End-to-End Tests

1. **Full page translation**: Test complete page translation
2. **Interactive components**: Test PPI calculator in multiple languages
3. **Language persistence**: Test language preference saving
4. **Performance**: Test translation loading performance

## Performance Considerations

### Translation Loading

1. **Lazy loading**: Load only required language initially
2. **Caching**: Cache translation files in browser
3. **Compression**: Compress translation files
4. **CDN**: Serve translation files from CDN if needed

### Runtime Performance

1. **Debounced updates**: Debounce UI updates during language switching
2. **Efficient DOM queries**: Cache DOM elements for translation updates
3. **Minimal re-rendering**: Update only changed elements
4. **Memory management**: Clean up unused translation data

## Migration Strategy

### Phase 1: Validation and Standardization

1. Implement translation validation system
2. Identify and document all missing translations
3. Standardize translation key naming conventions
4. Fix critical missing translations

### Phase 2: Component Updates

1. Update PPI calculator component translations
2. Ensure all interactive components use consistent translation methods
3. Add proper error handling for missing translations
4. Test all components in supported languages

### Phase 3: Build Process Enhancement

1. Integrate validation into build process
2. Add automated translation completeness checks
3. Improve error reporting for translation issues
4. Optimize translation file loading

### Phase 4: Performance and Polish

1. Optimize translation loading performance
2. Add comprehensive error handling
3. Implement advanced features like pluralization
4. Add developer tools for translation management