---
title: "Guía de Container Queries"
description: "Aprende a usar CSS Container Queries para diseños responsive más flexibles"
date: "2025-01-09"
author: "Screen Size Checker Team"
category: "css"
tags: ["css", "responsive-design", "container-queries", "web-development", "frontend"]
featured: true
readingTime: "12 min read"
---

> **注意**: 此文章的西班牙语翻译版本正在准备中。以下是英文原文，翻译工作将很快完成。

# CSS Container Queries Complete Guide: Say Goodbye to Media Query Pain Points

For years, responsive web design has relied on media queries to adapt layouts to different screen sizes. But what happens when you need a component to respond to its container's size, not the viewport? Enter CSS Container Queries—a game-changing feature that's reshaping how we think about responsive design in 2025.

## Why We Desperately Needed Container Queries

Picture this: You've built a beautiful card component that looks perfect on desktop. It has an image on the left, content on the right, and everything is nicely balanced. Now you need to use this same component in a narrow sidebar. With media queries, you're stuck—the component only knows about the viewport width, not its actual available space.

```css
/* The old way with media queries - problematic */
@media (min-width: 768px) {
  .card {
    display: flex;
  }
}
/* But what if this card is in a 300px sidebar on a 1920px screen? */
```

This fundamental limitation has plagued developers for years, leading to duplicate components, complex naming conventions, and maintenance nightmares. Container queries solve this elegantly by allowing components to respond to their container's size.

## Understanding Container Queries: The Basics

### What Exactly Are Container Queries?

Container queries allow elements to adapt their styles based on the size of their containing element rather than the viewport. This means a component can be truly self-contained and responsive regardless of where it's placed in your layout.

**Key Differences from Media Queries:**
- **Media Queries**: Respond to viewport/device characteristics
- **Container Queries**: Respond to parent container dimensions
- **Scope**: Media queries are global, container queries are scoped to specific containers

### Browser Support in 2025

Good news! As of 2025, container queries have excellent browser support:

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 105+ | ✅ Full Support |
| Firefox | 110+ | ✅ Full Support |
| Safari | 16+ | ✅ Full Support |
| Edge | 105+ | ✅ Full Support |

With over 90% of users now on supported browsers, container queries are production-ready for most projects.

### Basic Syntax and Setup

```css
/* Step 1: Define a container */
.card-wrapper {
  container-type: inline-size;
  /* or */
  container: card / inline-size; /* with a name */
}

/* Step 2: Query the container */
@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 1rem;
  }
}

/* Or query a named container */
@container card (min-width: 400px) {
  .card-title {
    font-size: 2rem;
  }
}
```

## Real-World Applications and Examples

### Example 1: Adaptive Card Component

Let's build a card component that intelligently adapts to its available space:

```css
.card-container {
  container-type: inline-size;
  width: 100%;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Narrow container: Stack vertically */
@container (width < 400px) {
  .card {
    display: flex;
    flex-direction: column;
  }
  
  .card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .card-content {
    padding: 1rem 0;
  }
  
  .card-title {
    font-size: 1.25rem;
  }
}

/* Medium container: Side-by-side with small image */
@container (400px <= width < 600px) {
  .card {
    display: flex;
    gap: 1rem;
  }
  
  .card-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    flex-shrink: 0;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
}

/* Large container: Spacious layout */
@container (width >= 600px) {
  .card {
    display: flex;
    gap: 2rem;
  }
  
  .card-image {
    width: 200px;
    height: 150px;
    object-fit: cover;
    flex-shrink: 0;
  }
  
  .card-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .card-description {
    font-size: 1.1rem;
    line-height: 1.6;
  }
}
```

### Example 2: Responsive Navigation Menu

Container queries excel at creating navigation components that adapt to their available space:

```css
.nav-container {
  container-type: inline-size;
}

.nav-menu {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

/* Mobile-style menu in narrow containers */
@container (width < 500px) {
  .nav-menu {
    flex-direction: column;
  }
  
  .nav-item {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  
  .nav-dropdown {
    position: static;
    width: 100%;
  }
}

/* Horizontal menu with dropdowns in wider containers */
@container (width >= 500px) {
  .nav-menu {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .nav-item {
    position: relative;
    padding: 0.5rem 1rem;
  }
  
  .nav-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
  }
}
```

### Example 3: Dynamic Grid Layouts

Create grids that adjust based on container width, not viewport:

```css
.grid-container {
  container-type: inline-size;
}

.product-grid {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

/* Single column for narrow containers */
@container (width < 400px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

/* Two columns for medium containers */
@container (400px <= width < 800px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Three columns for wide containers */
@container (width >= 800px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Four columns for extra wide containers */
@container (width >= 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Advanced Techniques and Container Units

### Container Query Units

Container queries introduce new CSS units that are relative to the container dimensions:

- **cqw**: 1% of the container's width
- **cqh**: 1% of the container's height
- **cqi**: 1% of the container's inline size
- **cqb**: 1% of the container's block size
- **cqmin**: The smaller value of cqi or cqb
- **cqmax**: The larger value of cqi or cqb

```css
.responsive-text {
  container-type: inline-size;
}

.responsive-text h2 {
  /* Font size scales with container width */
  font-size: clamp(1.5rem, 5cqi, 3rem);
  
  /* Padding relative to container */
  padding: 2cqi 4cqi;
}

.responsive-text p {
  /* Line height that adapts to container */
  font-size: clamp(0.875rem, 2cqi, 1.125rem);
  line-height: 1.6;
  
  /* Margin that scales with container */
  margin-bottom: 3cqb;
}
```

### Combining Container and Media Queries

For the best responsive experience, combine both approaches:

```css
.article-layout {
  container-type: inline-size;
}

/* Base mobile-first styles */
.article-content {
  padding: 1rem;
}

/* Respond to viewport for major layout shifts */
@media (min-width: 1024px) {
  .article-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
}

/* Fine-tune based on actual container size */
@container (min-width: 600px) {
  .article-content {
    padding: 2rem;
    font-size: 1.125rem;
  }
  
  .article-content h2 {
    font-size: 2rem;
    margin: 2rem 0 1rem;
  }
}

@container (min-width: 800px) {
  .article-content {
    padding: 3rem;
    max-width: 65ch;
    margin: 0 auto;
  }
}
```

### Style Queries (Experimental)

Looking ahead, style queries allow you to query custom properties:

```css
/* Future syntax - limited support in 2025 */
.theme-container {
  container-type: inline-size;
  --theme: dark;
}

@container style(--theme: dark) {
  .card {
    background: #1a1a1a;
    color: white;
  }
}
```

## Testing Container Queries with Screen Size Tools

To effectively test your container queries, you need the right tools. Our [Responsive Design Tester](https://screensizechecker.com/devices/responsive-tester) is perfect for this:

1. **Test Different Container Sizes**: Use the drag-to-resize feature to see how your components respond at various container widths
2. **Device Presets**: Check how containers behave within different device viewports
3. **Real-time Updates**: Watch your container queries trigger as you resize

For calculating optimal breakpoints based on content, our [Aspect Ratio Calculator](https://screensizechecker.com/devices/aspect-ratio-calculator) helps determine the best container dimensions for your layouts.

## Performance Considerations

### Best Practices for Performance

1. **Avoid Deep Nesting**
```css
/* Avoid */
.container1 { container-type: inline-size; }
  .container2 { container-type: inline-size; }
    .container3 { container-type: inline-size; }

/* Better */
.component-container { container-type: inline-size; }
```

2. **Use Containment Wisely**
```css
/* Only set container-type where needed */
.card-grid {
  /* No container-type needed here */
}

.card-wrapper {
  container-type: inline-size; /* Only on direct parent */
}
```

3. **Optimize Query Conditions**
```css
/* Use logical combinations efficiently */
@container (400px <= width < 800px) {
  /* Styles for medium containers */
}

/* Avoid redundant queries */
@container (min-width: 400px) and (max-width: 799px) {
  /* Same as above but more verbose */
}
```

### Performance Metrics

Container queries have minimal performance impact when used correctly:
- **Paint time**: ~2-5% increase with heavy usage
- **Layout recalculation**: Similar to media queries
- **Memory usage**: Negligible increase

## Migration Strategy: From Media Queries to Container Queries

### Step 1: Audit Your Current Styles

Identify components that would benefit from container queries:
```javascript
// Components that appear in multiple contexts
const candidateComponents = [
  'cards',
  'navigation menus',
  'sidebars',
  'data tables',
  'form layouts',
  'image galleries'
];
```

### Step 2: Progressive Enhancement Approach

```css
/* Base styles that work everywhere */
.card {
  padding: 1rem;
  background: white;
}

/* Fallback with media queries */
@media (min-width: 768px) {
  @supports not (container-type: inline-size) {
    .card {
      display: flex;
    }
  }
}

/* Modern container queries */
@supports (container-type: inline-size) {
  .card-wrapper {
    container-type: inline-size;
  }
  
  @container (min-width: 400px) {
    .card {
      display: flex;
    }
  }
}
```

### Step 3: Testing and Validation

Use feature detection to ensure compatibility:
```javascript
// JavaScript feature detection
function supportsContainerQueries() {
  try {
    document.body.style.containerType = 'inline-size';
    return document.body.style.containerType === 'inline-size';
  } catch (e) {
    return false;
  }
}

if (supportsContainerQueries()) {
  document.body.classList.add('container-queries-supported');
}
```

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Forgetting to Set Container Type
```css
/* Won't work - no container-type defined */
@container (min-width: 400px) {
  .card { display: flex; }
}

/* Fixed */
.card-wrapper {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card { display: flex; }
}
```

### Pitfall 2: Container Type on Wrong Element
```css
/* Wrong - container-type on the element being styled */
.card {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card { /* This won't work */ }
}

/* Right - container-type on parent */
.card-wrapper {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card { /* This works */ }
}
```

### Pitfall 3: Conflicting Container Names
```css
/* Be careful with naming */
.outer {
  container: layout / inline-size;
}
.inner {
  container: layout / inline-size; /* Same name - confusing */
}

/* Better - use unique names */
.outer {
  container: outer-layout / inline-size;
}
.inner {
  container: inner-layout / inline-size;
}
```

## Real Project Implementation Example

Let's implement a complete responsive dashboard that showcases container queries in action:

```css
/* Dashboard Layout */
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Sidebar container */
.sidebar {
  container-type: inline-size;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

/* Main content area */
.main-content {
  container-type: inline-size;
}

/* Widget containers */
.widget {
  container-type: inline-size;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Sidebar navigation adapts to sidebar width */
@container (width < 200px) {
  .sidebar-nav {
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-nav-item {
    padding: 0.5rem;
    text-align: center;
  }
  
  .sidebar-nav-text {
    display: none;
  }
  
  .sidebar-nav-icon {
    font-size: 1.5rem;
  }
}

@container (width >= 200px) {
  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .sidebar-nav-text {
    display: block;
  }
}

/* Widgets adapt to their container */
@container (width < 300px) {
  .widget-content {
    font-size: 0.875rem;
  }
  
  .widget-chart {
    height: 150px;
  }
  
  .widget-stats {
    grid-template-columns: 1fr;
  }
}

@container (300px <= width < 500px) {
  .widget-content {
    font-size: 1rem;
  }
  
  .widget-chart {
    height: 200px;
  }
  
  .widget-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (width >= 500px) {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .widget-chart {
    height: 300px;
  }
  
  .widget-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Responsive table within widgets */
.widget-table-container {
  container-type: inline-size;
  overflow-x: auto;
}

@container (width < 600px) {
  .widget-table {
    font-size: 0.875rem;
  }
  
  .widget-table th:nth-child(n+4),
  .widget-table td:nth-child(n+4) {
    display: none; /* Hide less important columns */
  }
}

@container (width >= 600px) {
  .widget-table {
    font-size: 1rem;
  }
  
  .widget-table th,
  .widget-table td {
    padding: 0.75rem 1rem;
  }
}
```

## The Future of Container Queries

### What's Coming Next?

1. **Style Queries**: Query any CSS property, not just size
2. **Container Query Length Units in Calculations**: More complex calculations with cq units
3. **Improved DevTools**: Better debugging and visualization tools
4. **Framework Integration**: Better support in CSS-in-JS libraries

### Container Queries + Modern CSS

Container queries work beautifully with other modern CSS features:

```css
/* With CSS Grid */
.grid-container {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

/* With Cascade Layers */
@layer components {
  @container (min-width: 400px) {
    .card { display: flex; }
  }
}

/* With Custom Properties */
.theme-aware {
  container-type: inline-size;
  --spacing: 1rem;
}

@container (min-width: 600px) {
  .theme-aware {
    --spacing: 2rem;
  }
}

/* With :has() selector */
.dynamic-container:has(.special-content) {
  container-type: inline-size;
}
```

## Practical Exercise: Try It Yourself

Here's a challenge to test your understanding:

**Challenge**: Create a responsive blog post component that:
1. Shows only the title and excerpt in containers under 300px
2. Adds a thumbnail image between 300px and 500px
3. Shows full content with a large featured image above 500px
4. Adjusts typography based on container width

**Starter Code**:
```css
.blog-post-container {
  /* Add container query setup */
}

.blog-post {
  /* Base styles */
}

/* Add your container queries here */
```

Test your solution using our [Responsive Design Tester](https://screensizechecker.com/devices/responsive-tester) to see how it performs at different container sizes!

## Conclusion: The Container Query Revolution

Container queries represent a fundamental shift in how we approach responsive design. They enable truly modular, context-aware components that adapt intelligently to their environment. While media queries still have their place for viewport-level decisions, container queries handle the component-level responsiveness we've always wanted.

### Key Takeaways:
- **Container queries** make components truly reusable and context-aware
- **Browser support** is now sufficient for production use (90%+ coverage)
- **Performance impact** is minimal when used correctly
- **Migration** can be done progressively with proper fallbacks
- **Future features** will make them even more powerful

### Next Steps:
1. Start experimenting with container queries in new components
2. Identify existing components that would benefit from migration
3. Use our [Screen Size Checker tools](https://screensizechecker.com) to test your implementations
4. Stay updated on new developments in style queries and container units

The era of truly responsive components has arrived. Container queries aren't just a new feature—they're a new way of thinking about web design. Start using them today, and your future self (and your team) will thank you.

---

*Want to test your container queries on different screen sizes? Try our [free Responsive Design Tester](https://screensizechecker.com/devices/responsive-tester) to see how your components adapt in real-time. For more articles on modern CSS and responsive design, check out our [blog](https://screensizechecker.com/blog/).*
