---
title: "Android 17 Foldable & Multi-Window Screen Sizes to Test"
description: "Android 17 changes foldable, tablet, and multi-window testing. See viewport sizes, breakpoints, and Screen Size Checker tools for QA."
date: "2026-06-19"
author: "Screen Size Checker Team"
category: "technical"
tags: ["android-17", "foldables", "multi-window", "responsive-design", "viewport", "android"]
featuredImage: ""
---

Android screen testing used to be easy to fake. Pick a few popular phones, resize a browser to a narrow portrait viewport, and call the layout responsive.

That is no longer enough. Android apps now run across phones, tablets, foldables, ChromeOS windows, desktop-style windows, split-screen sessions, and connected displays. With Android 17, the platform direction is even clearer: layouts need to adapt to the window the app actually gets, not to the device name you guessed at design time.

For web teams and hybrid app teams, the same lesson applies. A screen is no longer one fixed rectangle. The useful question is not "What device is this?" but "How much layout space is available right now, what is the device pixel ratio, and what aspect ratio is the user seeing?"

This guide connects the Android 17 large-screen shift with a practical testing workflow using Screen Size Checker tools.

## Quick Answer

For Android 17 readiness, test by viewport size instead of device name. Include compact Android phone widths around 320-430 CSS px, medium foldable and tablet widths around 600-840 CSS px, expanded tablet landscape widths around 840-1199 CSS px, one near-square foldable case such as 720 x 720, one compact-height landscape case such as 844 x 390, and at least one freely resized desktop-style window.

Use Screen Size Checker to capture the real viewport, DPR, resolution, and aspect ratio on a device, then reproduce the risky ranges in the Responsive Tester.

## Why Android 17 Changes the Testing Baseline

Google's Android 17 documentation says that for apps targeting Android 17, API level 37 or higher, orientation, resizability, and aspect ratio restrictions no longer apply on displays whose smallest width is greater than 600dp. Android 17 also removes the temporary large-screen opt-out that existed in Android 16.

That matters because many older mobile layouts quietly depend on assumptions like these:

- The app is always portrait.
- The phone viewport is always narrow.
- A fixed max aspect ratio will protect the layout.
- A tablet layout can be treated as a larger phone layout.
- A foldable has one useful viewport.

Those assumptions are fragile. Android large-screen guidance now pushes teams toward adaptive layouts that respond to the available window size. This does not only affect native Android teams. It also affects web apps, PWAs, embedded WebViews, checkout flows, account dashboards, and support portals that Android users open inside resizable environments.

If your layout breaks when the available width jumps from phone size to tablet size, or when the height becomes compact in landscape, Android 17 makes that weakness easier for users to hit.

## The Device Trend: One Android Device Can Produce Many Layouts

A modern Android device can expose several very different layout conditions:

| Scenario | What changes | Why it matters |
|----------|--------------|----------------|
| Tall phone portrait | Narrow CSS viewport, high DPR, long vertical space | Navigation, sticky controls, and forms need compact behavior. |
| Phone landscape | Wider viewport, compact height | Two-column layouts may fit, but vertical controls can become cramped. |
| Foldable cover display | Often narrow and tall | It can be tighter than a normal phone, especially for text-heavy screens. |
| Foldable main display | Wider, sometimes close to square | Single-column phone layouts can feel sparse or stretched. |
| Tablet portrait | Medium width with more readable content space | Sidebars, detail panes, and grids may become useful. |
| Tablet landscape | Expanded width | This is where master-detail and multi-pane layouts are often expected. |
| Split screen | The app gets only part of the physical display | Device specs stop being enough; window size is the real input. |
| Desktop windowing | Arbitrary resizable windows | Users can create widths that do not match any named device preset. |

This is why Android's window size class model focuses on the display area available to the app. Compact, medium, expanded, large, and extra-large widths are more useful than "phone" or "tablet" labels, because the same physical device can move between classes as the user rotates, folds, unfolds, resizes, or splits the screen.

## What to Measure Before You Pick Breakpoints

For responsive QA, these measurements are more useful than raw device marketing specs:

| Measurement | What it means | How it helps |
|-------------|---------------|--------------|
| Screen resolution | Physical pixels on the display | Useful for hardware sharpness and image density planning. |
| Viewport size | CSS pixel area available to the page or app surface | The main input for responsive CSS and layout behavior. |
| Device pixel ratio | Physical pixels per CSS pixel | Explains why 1080px devices can expose different CSS widths. |
| Aspect ratio | Width-to-height relationship | Helps catch stretched layouts, cropped media, and awkward panels. |
| Orientation | Portrait, landscape, or window-defined shape | Reveals assumptions about height, navigation, and media. |

The trap is treating screen resolution as the breakpoint source. A 1440px-wide physical screen can still expose a viewport around 360 to 430 CSS pixels depending on DPR, browser UI, display scaling, and system settings. Foldables add another layer because the cover screen and main screen can produce different viewport families on the same device.

Start with viewport behavior, then use resolution and DPR to explain image quality and pixel density.

## Android Foldable and Multi-Window Test Matrix

Use this matrix as a practical baseline. It is not a replacement for real device testing, but it helps you avoid the common mistake of testing only one Android phone width.

| Test group | Width range to include | What to look for |
|------------|------------------------|------------------|
| Compact phone | 320-374 CSS px | Long labels, checkout forms, nav overflow, fixed-width cards. |
| Common Android phone | 375-430 CSS px | Default mobile layout, touch targets, sticky footers. |
| Tall phone landscape | 640-932 CSS px wide with compact height | Header height, modals, media, bottom sheets, keyboard overlap. |
| Foldable cover | 320-430 CSS px with tall aspect ratio | Dense forms, text wrapping, narrow cards, search bars. |
| Foldable main | 600-840 CSS px, including near-square shapes | Empty space, stretched cards, two-pane thresholds. |
| Tablet portrait | 600-839 CSS px | Medium layouts, side navigation, readable line length. |
| Tablet landscape | 840-1199 CSS px | Expanded layouts, data grids, master-detail screens. |
| Desktop-style window | 500-1600 CSS px, freely resized | Layout transitions, container queries, table overflow. |
| Split screen | Half-width and two-thirds-width windows | Whether the app still works when the physical display is large but the window is not. |

If you are choosing only a few widths, include at least 360, 390, 412, 600, 768, 840, 1024, and one freely resized mid-range width such as 540 or 720. Then test height separately for landscape and split-screen cases.

## How to Use Screen Size Checker Tools in This Workflow

Screen Size Checker already has the pieces you need for this workflow. Use them in this order.

### 1. Measure the real device first

Open [What Is My Screen Size](https://screensizechecker.com/) on the Android device or browser you are testing. Record:

- viewport size
- screen resolution
- device pixel ratio
- aspect ratio
- browser and operating system details

This gives you the actual values your layout sees, not just the device's advertised resolution.

### 2. Compare against common Android devices

Use the [Android Viewport Sizes](https://screensizechecker.com/devices/android-viewport-sizes) chart to compare your real measurements with common Pixel, Galaxy, foldable, Xiaomi, OPPO, vivo, Honor, and other Android reference devices.

For foldables, pay special attention to entries that list cover and main displays separately. The point is not to target one exact model. The point is to notice the range of widths and aspect ratios your design needs to survive.

### 3. Run the layout through a responsive tester

Use the [Responsive Tester](https://screensizechecker.com/devices/responsive-tester) to preview your page across phone, tablet, desktop, and custom viewport sizes. This is where you can quickly check:

- whether media queries trigger at the expected widths
- whether fixed-width components overflow
- whether cards, tables, nav bars, and modals reflow cleanly
- whether the design still works at intermediate widths that are not named devices

For Android 17 readiness, do not stop at phone presets. Add custom widths around the 600px and 840px layout thresholds because those are common places where adaptive layouts change structure.

### 4. Check shape changes, not only width changes

Foldables and multi-window modes can produce surprising aspect ratios. Use the [Aspect Ratio Calculator](https://screensizechecker.com/devices/aspect-ratio-calculator) when media, previews, camera surfaces, videos, charts, or dashboards need to preserve a specific shape.

This is especially important for screens that mix fixed-ratio media with flexible UI around it. A layout that looks fine at 390 x 844 can fail at 720 x 720 or 840 x 600.

### 5. Compare screen space when a decision is visual

When product, design, or QA teams disagree about whether a layout should switch to two panes, use the [Screen Size Comparison Tool](https://screensizechecker.com/devices/compare) to compare physical size and usable area.

This helps turn "it feels like a tablet" into a more concrete discussion about width, height, area, and aspect ratio.

## Practical CSS and QA Checklist

Use this checklist before shipping a layout that Android users will open on phones, foldables, tablets, or desktop-style windows.

- Test the layout at widths below 600 CSS px and above 600 CSS px.
- Test at least one expanded width around 840 CSS px or wider.
- Resize the window manually instead of relying only on named device presets.
- Test portrait and landscape separately.
- Test a compact-height layout, not only compact width.
- Avoid layout rules that assume a phone is always portrait.
- Avoid device-name logic such as "if tablet" when the available window size is what really matters.
- Use fluid grids, flexible spacing, and content-based breakpoints.
- Use container queries for reusable components that can appear in narrow and wide panels.
- Set sensible `max-width` values for long text lines on expanded layouts.
- Make tables scroll, stack, or reduce columns before they overflow.
- Check modals, drawers, sticky footers, cookie banners, and floating actions at compact heights.
- Verify that media and charts do not stretch when the aspect ratio changes.
- Preserve UI state across orientation, fold, unfold, and resize events in native or hybrid apps.

The goal is not to create a separate design for every Android device. The goal is to make each component respond to the space it actually receives.

## A Simple Android 17 Readiness Pass

Here is a lightweight pass that most teams can run in one QA session:

1. Open your page on a real Android phone and capture the viewport with [Screen Size Checker](https://screensizechecker.com/).
2. Test your core flow at 360, 390, 412, 600, 768, 840, and 1024 CSS px in the [Responsive Tester](https://screensizechecker.com/devices/responsive-tester).
3. Add one near-square test, such as 720 x 720, to simulate foldable-style proportions.
4. Add one compact-height landscape test, such as 844 x 390.
5. Check each step of the flow: navigation, search, form entry, checkout or submit, error states, and confirmation.
6. Compare any questionable foldable or tablet decision against the [Android Viewport Sizes](https://screensizechecker.com/devices/android-viewport-sizes) chart.
7. Log failures by actual viewport size, DPR, and aspect ratio, not only by device name.

That last step matters. "Broken on Galaxy Fold" is less useful than "checkout summary overlaps at 692 x 717 CSS px with DPR 3." The second report gives designers and developers a reproducible layout condition.

## Sources and Further Reading

- [Android 17: Restrictions on orientation and resizability are ignored](https://developer.android.com/about/versions/17/changes/ff-restrictions-ignored)
- [Android Developers: Use window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- [Android Developers: Support different display sizes](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes)
- [Screen Size Checker: Android Viewport Sizes](https://screensizechecker.com/devices/android-viewport-sizes)
- [Screen Size Checker: Responsive Tester](https://screensizechecker.com/devices/responsive-tester)

## FAQ

### Is Android 17 only relevant to native Android apps?

No. The platform behavior directly affects native apps, but the same device trend affects web apps, PWAs, embedded WebViews, and responsive sites opened on Android tablets, foldables, and desktop-style windows. If your UI depends on a fixed phone-shaped viewport, Android 17 is a signal to retest it.

### What viewport sizes should I test for Android foldables?

Test both the cover-display range and the unfolded main-display range. In practice, include narrow phone widths around 320-430 CSS px, medium widths around 600-840 CSS px, at least one landscape case, and at least one near-square case. Then compare against the current [Android Viewport Sizes](https://screensizechecker.com/devices/android-viewport-sizes) chart.

### Is screen resolution or viewport size more important for responsive design?

Viewport size is usually more important for layout because CSS media queries and most web layout decisions operate in CSS pixels. Screen resolution and DPR still matter for image sharpness, canvas rendering, and density-aware assets.

### How do I test Android multi-window layouts without every device?

Use a responsive tester with custom viewport sizes, then validate critical flows on at least one real Android device or emulator. Multi-window testing is about resizing the available window, so custom widths and heights are more useful than relying only on named device presets.

### Should I build separate layouts for every foldable model?

Usually no. Build adaptive components that respond to available width, height, and aspect ratio. Use device charts to understand the range of real values, then create content-based breakpoints instead of model-specific branches.
