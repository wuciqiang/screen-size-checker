# Design Document

## Overview

The Aspect Ratio Calculator is a standalone web tool that allows users to calculate new dimensions while maintaining a specific aspect ratio. The tool will be integrated into the existing Screen Size Checker website using the established component-based architecture, following the same patterns as the PPI Calculator.

The calculator will provide an intuitive interface for designers, video editors, and content creators to quickly determine proportional dimensions for their projects. It will include real-time visual feedback and comprehensive educational content about aspect ratios.

## Architecture

### Component Structure
The aspect ratio calculator follows the established architecture pattern:

```
components/
├── aspect-ratio-calculator-content.html  # Main calculator component
js/
├── aspect-ratio-calculator.js            # Calculator logic module
locales/
├── en/translation.json                   # English translations
├── zh/translation.json                   # Chinese translations
build/
├── pages-config.json                     # Page configuration
```

### Integration Points
- **Template System**: Uses the existing `device-page.html` template
- **Localization**: Integrates with i18next for multi-language support
- **Styling**: Leverages existing CSS variables and component styles
- **Navigation**: Appears in the tools grid alongside other calculators

## Components and Interfaces

### 1. HTML Component (`aspect-ratio-calculator-content.html`)

**Structure:**
- Hero section with title and introduction
- Calculator tool section with input/output areas
- Visual aspect ratio preview
- Educational content section
- Related resources section

**Key Elements:**
- Input fields for original ratio (Width 1, Height 1)
- Input fields for new dimensions (Width 2, Height 2)
- Real-time visual representation
- Result display area
- Error handling and validation messages

### 2. JavaScript Module (`aspect-ratio-calculator.js`)

**Class Structure:**
```javascript
export class AspectRatioCalculator {
    constructor()
    init()
    bindElements()
    setupEventListeners()
    calculate()
    validateInput()
    updateVisualizer()
    updateResults()
}
```

**Core Functionality:**
- Real-time calculation as user types
- Input validation and error handling
- Visual aspect ratio representation
- Debounced input processing for performance
- Localization support

### 3. Calculation Logic

**Primary Formulas:**
- When Width 2 changes: `Height 2 = (Height 1 / Width 1) * Width 2`
- When Height 2 changes: `Width 2 = (Width 1 / Height 1) * Height 2`
- Aspect ratio: `Width 1 : Height 1`

**Validation Rules:**
- All inputs must be positive numbers
- Minimum value: 0.1
- Maximum value: 10000
- Handle division by zero gracefully

## Data Models

### Input Data Structure
```javascript
{
    originalWidth: number,    // Width 1
    originalHeight: number,   // Height 1
    newWidth: number,        // Width 2 (calculated or input)
    newHeight: number,       // Height 2 (calculated or input)
    aspectRatio: string,     // Formatted ratio (e.g., "16:9")
    isValid: boolean         // Overall validation state
}
```

### Validation State
```javascript
{
    originalWidth: { valid: boolean, error: string },
    originalHeight: { valid: boolean, error: string },
    newWidth: { valid: boolean, error: string },
    newHeight: { valid: boolean, error: string }
}
```

## Visual Representation

### Aspect Ratio Visualizer
- **Container**: Fixed-size container (e.g., 200px × 150px)
- **Representation**: Scaled rectangle showing the aspect ratio
- **Styling**: Uses CSS `aspect-ratio` property when supported
- **Fallback**: Manual width/height calculation for older browsers
- **Updates**: Real-time updates as user types

### Visual Design Elements
- Color-coded input states (normal, error, success)
- Smooth transitions for visual feedback
- Responsive layout that works on mobile devices
- Consistent styling with existing calculator tools

## Error Handling

### Input Validation
1. **Empty Values**: Allow empty inputs without showing errors
2. **Invalid Numbers**: Show "Please enter a valid number" message
3. **Negative Values**: Show "Value must be greater than 0" message
4. **Out of Range**: Show "Value must be between X and Y" message
5. **Division by Zero**: Handle gracefully without crashing

### Error Display Strategy
- Inline error messages below each input field
- Smooth CSS animations for error state transitions
- Clear error states when input becomes valid
- Non-blocking errors (calculator continues to work with valid inputs)

### Error Recovery
- Automatic error clearing when valid input is entered
- Graceful degradation if JavaScript fails
- Fallback behavior for unsupported browsers

## Testing Strategy

### Unit Testing Areas
1. **Calculation Logic**
   - Test aspect ratio calculations with various inputs
   - Test edge cases (very small/large numbers)
   - Test division by zero handling

2. **Input Validation**
   - Test all validation rules
   - Test error message generation
   - Test validation state management

3. **Visual Updates**
   - Test visualizer updates with different ratios
   - Test responsive behavior
   - Test CSS aspect-ratio fallbacks

### Integration Testing
1. **Localization Integration**
   - Test translation loading
   - Test language switching
   - Test fallback behavior

2. **Component Integration**
   - Test with existing page template
   - Test CSS integration
   - Test responsive behavior across devices

### User Experience Testing
1. **Usability Testing**
   - Test with common aspect ratios (16:9, 4:3, 1:1)
   - Test real-world use cases
   - Test mobile device interaction

2. **Performance Testing**
   - Test with rapid input changes
   - Test debouncing effectiveness
   - Test memory usage over time

## Educational Content Structure

### Content Sections
1. **What is Aspect Ratio?**
   - Simple definition and explanation
   - Visual examples with common ratios

2. **Common Aspect Ratios**
   - 16:9 (widescreen, YouTube, modern TVs)
   - 4:3 (traditional TV, older monitors)
   - 1:1 (Instagram posts, square formats)
   - 21:9 (ultrawide monitors)
   - 3:2 (photography, some tablets)

3. **Why Aspect Ratio Matters**
   - Responsive web design considerations
   - Video production requirements
   - Photography and image editing
   - Social media content creation

4. **Practical Applications**
   - Resizing images proportionally
   - Video format conversion
   - Layout design planning
   - Print media preparation

### SEO Optimization
- Structured content with proper heading hierarchy
- Internal linking to related tools
- Rich snippets markup for better search visibility
- Mobile-optimized content layout

## Localization Strategy

### Translation Keys Structure
```json
{
  "aspectRatioCalculator": {
    "title": "Aspect Ratio Calculator",
    "intro": "Calculate new dimensions while maintaining aspect ratio",
    "originalRatio": "Original Ratio",
    "newDimensions": "New Dimensions",
    "width1": "Width 1",
    "height1": "Height 1",
    "width2": "Width 2",
    "height2": "Height 2",
    "visualizer": "Aspect Ratio Preview",
    "errors": {
      "invalidNumber": "Please enter a valid number",
      "negativeValue": "Value must be greater than 0",
      "outOfRange": "Value must be between {min} and {max}"
    }
  }
}
```

### Multi-language Support
- English (primary)
- Chinese (secondary)
- Extensible structure for additional languages
- Consistent terminology across all calculator tools

## Performance Considerations

### Optimization Strategies
1. **Debounced Calculations**: 300ms delay to prevent excessive calculations
2. **Efficient DOM Updates**: Batch DOM changes where possible
3. **CSS Transitions**: Use CSS for smooth visual transitions
4. **Lazy Loading**: Load calculator only when page is accessed
5. **Memory Management**: Clean up event listeners and timers

### Browser Compatibility
- Modern ES6+ features with appropriate fallbacks
- CSS Grid and Flexbox with fallbacks
- CSS aspect-ratio with manual calculation fallback
- Progressive enhancement approach

## Security Considerations

### Input Sanitization
- Validate all numeric inputs
- Prevent XSS through proper input handling
- Limit input ranges to prevent abuse
- No server-side processing required (client-side only)

### Privacy
- No data collection or storage
- No external API calls
- All calculations performed locally
- No user tracking beyond standard analytics