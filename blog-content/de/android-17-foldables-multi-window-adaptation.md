---
title: "Android 17 Foldables & Multi-Window: Viewport-Größen testen"
description: "Teste Android 17 für Foldables und Mehrfenster: Viewport-Größen, 600- und 840-CSS-px-Breakpoints sowie Layout-Risiken im Responsive Tester."
date: "2026-06-19"
author: "Screen Size Checker Team"
category: "technical"
tags: ["android-17", "foldables", "multi-window", "responsive-design", "viewport", "android"]
featuredImage: ""
---

Android-Screen-Testing ließ sich lange leicht abkürzen: ein paar beliebte Smartphones auswählen, das Browserfenster auf eine schmale Hochformatbreite stellen und das Layout als responsiv abhaken.

Das reicht nicht mehr. Android-Apps und mobile Websites laufen heute auf Smartphones, Tablets, faltbaren Geräten (Foldables), ChromeOS-Fenstern, Desktop-ähnlichen frei skalierbaren Fenstern, Split-Screen-Ansichten und externen Displays. Mit Android 17 wird die Richtung noch klarer: Layouts müssen auf den Platz reagieren, den die App oder Seite tatsächlich bekommt, nicht auf den Gerätenamen, den man in der Designphase vermutet hat.

Für Web-Teams, PWA-Teams und Hybrid-App-Teams ist die Konsequenz dieselbe. Ein Bildschirm ist kein festes Rechteck mehr. Die bessere Frage lautet nicht: „Welches Gerät ist das?“, sondern: „Wie groß ist der aktuelle Viewport, welches Gerätepixelverhältnis (DPR) liegt vor, und welches Seitenverhältnis sieht der Nutzer gerade?“

Dieser Leitfaden verbindet den Android-17-Trend zu großen und frei skalierbaren Displays mit einem praktischen Testablauf für Foldables, den Multi-Window-Modus bzw. Mehrfenstermodus und die Screen-Size-Checker-Tools.

## Kurzantwort

Für Android-17-Readiness solltest du nach Viewport-Größen testen, nicht nur nach Gerätenamen. Decke mindestens diese Bereiche ab:

- 320-430 CSS-Pixel (CSS px) für kompakte Android-Smartphones.
- 600-840 CSS px für Foldable-Hauptdisplays und Tablet-Hochformat.
- 840-1199 CSS px für Tablet-Querformat und breitere Layouts.
- Ein fast quadratisches Foldable-Szenario, zum Beispiel 720 x 720.
- Ein Querformat mit knapper Höhe, zum Beispiel 844 x 390.
- Mindestens ein frei skalierbares Desktop-ähnliches Fenster.

Miss zuerst auf einem echten Gerät mit dem [Screen Size Checker](https://screensizechecker.com/de/) Viewport-Größe, DPR, Bildschirmauflösung und Seitenverhältnis. Reproduziere danach die kritischen Größen im [Responsive Tester](https://screensizechecker.com/de/devices/responsive-tester).

## Warum Android 17 die Testbasis verändert

Die Android-17-Dokumentation von Google beschreibt: Für Apps, die auf Android 17 (API-Level 37) oder höher ausgerichtet sind, gelten Einschränkungen für Ausrichtung, Größenänderbarkeit und Seitenverhältnis auf großen Displays der sw600dp-Klasse nicht mehr. Android 17 entfernt außerdem die temporäre Large-Screen-Ausnahme, die es in Android 16 gab.

Die genaue Anwendung und Ausnahmen sollten immer anhand der offiziellen Dokumentation geprüft werden. Die Regel betrifft direkt native Android-Apps und ihr Target-SDK-/API-Verhalten. Für Web-Apps, PWAs und WebViews ist sie vor allem ein starkes Signal: Nutzer werden häufiger in großen, geteilten und frei skalierbaren Android-Fenstern unterwegs sein.

Viele ältere Mobile-Layouts hängen stillschweigend an Annahmen wie diesen:

- Die App ist immer im Hochformat.
- Der Smartphone-Viewport ist immer schmal.
- Ein festes maximales Seitenverhältnis schützt das Layout.
- Ein Tablet ist nur ein größeres Smartphone.
- Ein Foldable hat nur einen relevanten Viewport.

Diese Annahmen sind in großen und geteilten Fenstern fragil. Die Large-Screen-Guidance von Android führt Teams stärker zu adaptiven Layouts, die auf die verfügbare Fenstergröße reagieren. Das betrifft nicht nur native Android-Teams, sondern auch Web-Apps, PWAs, WebViews, Checkout-Flows, Konto-Dashboards, Support-Portale und responsive Websites, die Nutzer in skalierbaren Android-Umgebungen öffnen.

Wenn dein Layout bricht, sobald die verfügbare Breite von Smartphone-Größe auf Tablet-Größe springt, oder wenn Bedienelemente bei wenig Höhe im Querformat gedrängt wirken, werden diese Schwachstellen mit Android 17 für Nutzer schneller sichtbar.

## Warum Foldables und Multi-Window nach Viewport-Größen getestet werden müssen

Ein modernes Android-Gerät kann sehr unterschiedliche Layoutbedingungen erzeugen:

| Szenario | Was sich ändert | Warum es wichtig ist |
|----------|-----------------|----------------------|
| Smartphone im Hochformat | Schmaler CSS-Viewport, hoher DPR, viel vertikaler Platz | Navigation, fixierte Bedienelemente und Formulare brauchen ein kompaktes Verhalten. |
| Smartphone im Querformat | Mehr Breite, aber deutlich weniger Höhe | Zwei Spalten können passen, während Modale, Medienbereiche und untere Panels eng werden. |
| Foldable-Cover-Display | Oft schmal und hoch | Textlastige Screens, Suchfelder und Karten können enger werden als auf normalen Smartphones. |
| Foldable-Hauptdisplay | Breiter, teils fast quadratisch | Einspaltige Mobile-Layouts können leer, gestreckt oder informationsarm wirken. |
| Tablet im Hochformat | Mittlere Breite mit mehr Leseraum | Sidebars, Detailbereiche und Grids können sinnvoll werden. |
| Tablet im Querformat | Erweiterte Breite | Master-Detail, Multi-Pane-Layouts und Datentabellen werden erwartet. |
| Split-Screen | Die App bekommt nur einen Teil des physischen Displays | Gerätespezifikationen reichen nicht; die Fenstergröße ist die eigentliche Grundlage. |
| Desktop-ähnliches Fenster | Breite und Höhe sind frei skalierbar | Nutzer erzeugen Zwischenbreiten, die in keinem Geräte-Preset stehen. |

Darum konzentrieren sich Android Window Size Classes auf die Displayfläche, die der App zur Verfügung steht. Begriffe wie compact, medium, expanded, large und extra-large sind für Layoutentscheidungen nützlicher als „Phone“ oder „Tablet“, weil dasselbe Gerät beim Drehen, Falten, Entfalten, Teilen oder Skalieren zwischen Klassen wechseln kann.

## Vor den Breakpoints: Viewport, DPR und Seitenverhältnis messen

Für Responsive QA sind diese Werte wichtiger als Marketing-Spezifikationen eines Geräts:

| Messwert | Bedeutung | Nutzen |
|----------|-----------|--------|
| Bildschirmauflösung | Physische Pixel des Displays | Hilft bei Bildschärfe, Asset-Dichte und Rendering-Qualität. |
| Viewport-Größe | In CSS-Pixeln verfügbare Fläche der Seite oder App-Oberfläche | Wichtigste Grundlage für Media Queries, Layout-Breakpoints und Reflow. |
| Gerätepixelverhältnis (DPR) | Physische Pixel pro CSS-Pixel | Erklärt, warum Geräte mit ähnlicher Auflösung unterschiedliche CSS-Viewport-Breiten haben können. |
| Seitenverhältnis | Verhältnis von Breite zu Höhe | Hilft, gestreckte Layouts, abgeschnittene Medien und ungünstige Panels zu erkennen. |
| Orientierung und Fensterform | Hochformat, Querformat oder frei definierte Fensterform | Deckt Annahmen über Höhe, Navigation, Tastatur und Medienbereiche auf. |

Der häufigste Fehler ist, die Bildschirmauflösung als Breakpoint-Quelle zu verwenden. Ein physisch 1440 px breites Display kann je nach DPR, Browser-UI, Display-Skalierung und Systemeinstellungen trotzdem nur etwa 360-430 CSS px Viewport-Breite liefern. Bei Foldables kommt hinzu, dass Cover-Display und Hauptdisplay auf demselben Gerät komplett unterschiedliche Viewport-Familien erzeugen können.

Starte mit dem Viewport-Verhalten. Nutze Auflösung und DPR danach, um Bildqualität, Canvas-Rendering und Pixeldichte zu erklären.

Wichtig: Der 600-dp-Wert aus der Android-Dokumentation gehört in den Kontext nativer Android-Layouts und Plattformregeln. Die 600- und 840-px-Bereiche in diesem Artikel sind Testbreiten für Web-Layouts in CSS-Pixeln. Beide helfen, verfügbare Fläche ernst zu nehmen, sind aber keine direkte Einheitenumrechnung.

## Testmatrix für Android-Foldables und Multi-Window

Diese Matrix ist eine praktische Basis für Android-17-Readiness. Sie ersetzt keine echten Geräte, verhindert aber den typischen Fehler, nur eine einzige Android-Smartphone-Breite zu testen.

| Testgruppe | Breitenbereich | Worauf du achten solltest |
|------------|----------------|---------------------------|
| Kompaktes Smartphone | 320-374 CSS px | Lange Labels, Checkout-Formulare, Navigations-Overflow, feste Kartenbreiten. |
| Typisches Android-Smartphone | 375-430 CSS px | Standard-Mobile-Layout, Touch-Targets, fixierte Fußzeile. |
| Smartphone im Querformat | 640-932 CSS px Breite mit knapper Höhe | Header-Höhe, Modale, Medien, untere Panels, Tastaturüberlagerung. |
| Foldable-Cover | 320-430 CSS px mit hohem Seitenverhältnis | Dichte Formulare, Textumbruch, schmale Karten, Suchleisten. |
| Foldable-Hauptdisplay | 600-840 CSS px, inklusive fast quadratischer Formen | Leere Flächen, gestreckte Karten, Schwellen für Zwei-Spalten-Layouts. |
| Tablet im Hochformat | 600-839 CSS px | Mittlere Layouts, Seitennavigation, lesbare Zeilenlängen. |
| Tablet im Querformat | 840-1199 CSS px | Erweiterte Layouts, Datentabellen, Master-Detail-Screens. |
| Desktop-ähnliches Fenster | 500-1600 CSS px, frei skalierbar | Layoutübergänge, Container Queries, Tabellen-Overflow. |
| Split-Screen | Halbe Breiten und Zwei-Drittel-Breiten | Ob der Flow funktioniert, obwohl das physische Display groß ist, das Fenster aber klein. |

Wenn du nur wenige Breiten auswählen kannst, teste mindestens 360, 390, 412, 600, 768, 840 und 1024. Ergänze eine frei skalierte Zwischenbreite wie 540 oder 720. Höhe muss separat getestet werden, vor allem für Querformat und Split-Screen-Modus.

## Mit Screen Size Checker kritische Android-17-Größen reproduzieren

Die Screen-Size-Checker-Tools decken die wichtigsten Schritte dieses Workflows ab. Nutze sie in dieser Reihenfolge.

### 1. Zuerst das echte Gerät messen

Öffne den [Screen Size Checker](https://screensizechecker.com/de/) auf dem Android-Gerät oder in dem Browser, den du testen möchtest. Notiere:

- Viewport-Größe
- Bildschirmauflösung
- Gerätepixelverhältnis (DPR)
- Seitenverhältnis
- Browser- und Betriebssysteminformationen

So bekommst du die Werte, die dein Layout tatsächlich sieht, nicht nur die beworbene Auflösung des Geräts.

### 2. Mit gängigen Android-Geräten vergleichen

Nutze die Tabelle [Android Viewport-Größen](https://screensizechecker.com/de/devices/android-viewport-sizes), um deine Messwerte mit Google-Pixel-, Samsung-Galaxy-, Foldable-, Xiaomi-, OPPO-, vivo-, Honor- und anderen Android-Referenzgeräten zu vergleichen.

Bei Foldables sind Einträge wichtig, die Cover-Display und Hauptdisplay getrennt aufführen. Ziel ist nicht, ein einzelnes Modell exakt anzusteuern. Ziel ist, die Breiten, DPR-Werte und Seitenverhältnisse zu verstehen, die dein Design robust unterstützen muss.

### 3. Im Responsive Tester nachstellen

Nutze den [Responsive Tester](https://screensizechecker.com/de/devices/responsive-tester), um deine Seite in Smartphone-, Tablet-, Desktop- und Custom-Viewport-Größen zu prüfen. Achte besonders darauf:

- ob Media Queries an den erwarteten Breiten greifen
- ob feste Komponenten überlaufen
- ob Karten, Tabellen, Navigation, Drawer und Modale sauber umbrechen
- ob das Design auch bei Zwischenbreiten funktioniert, die keinen Gerätenamen haben

Für Android 17 solltest du nicht bei Smartphone-Presets stoppen. Ergänze Custom-Breiten rund um 600 px und 840 px, weil dort viele adaptive Layouts ihre Struktur wechseln.

### 4. Formen testen, nicht nur Breiten

Foldables und Multi-Window-Modi können ungewohnte Seitenverhältnisse erzeugen. Wenn deine Seite Videos, Charts, Dashboards, Produktbilder, Kamera-Previews oder Karten mit festem Seitenverhältnis enthält, hilft der [Seitenverhältnis-Rechner](https://screensizechecker.com/de/devices/aspect-ratio-calculator).

Ein Layout, das bei 390 x 844 gut aussieht, kann bei 720 x 720 oder 840 x 600 plötzlich Medien abschneiden, Karten strecken oder Sidebars zu knapp machen.

### 5. Visuelle Entscheidungen mit Fläche begründen

Wenn Produkt, Design und QA diskutieren, ob eine Ansicht auf zwei Spalten wechseln sollte, nutze den [Bildschirmgrößen-Vergleich](https://screensizechecker.com/de/devices/compare), um physische Größe und nutzbare Fläche zu vergleichen.

So wird aus „fühlt sich wie ein Tablet an“ eine konkrete Diskussion über Breite, Höhe, Fläche und Seitenverhältnis.

## CSS- und QA-Checkliste für Android 17

Nutze diese Checkliste, bevor du ein Layout auslieferst, das Android-Nutzer auf Smartphones, Foldables, Tablets oder Desktop-ähnlichen Fenstern öffnen:

- Teste unterhalb und oberhalb von 600 CSS px.
- Teste mindestens eine erweiterte Breite ab etwa 840 CSS px.
- Skaliere Fenster manuell, statt nur Geräte-Presets zu verwenden.
- Prüfe Hochformat und Querformat getrennt.
- Teste knappe Höhe, nicht nur knappe Breite.
- Vermeide Regeln, die annehmen, dass ein Smartphone immer Hochformat ist.
- Vermeide Geräte-Logik wie „wenn Tablet“, wenn die verfügbare Fenstergröße die eigentliche Layoutgrundlage ist.
- Nutze flexible Grids, flexible Abstände und inhaltsbasierte Breakpoints.
- Nutze Container Queries für wiederverwendbare Komponenten, die in schmalen und breiten Panels erscheinen können.
- Setze sinnvolle `max-width`-Werte für lange Textzeilen in erweiterten Layouts.
- Lass Tabellen scrollen, stapeln oder Spalten reduzieren, bevor sie überlaufen.
- Prüfe Modale, Drawer, fixierte Fußzeilen, Cookie-Banner und Floating-Action-Buttons bei knapper Höhe.
- Verhindere, dass Medien und Charts bei wechselndem Seitenverhältnis gestreckt oder abgeschnitten werden.
- In nativen oder hybriden Apps: Prüfe, ob UI-Zustand bei Drehen, Falten, Entfalten und Größenänderung erhalten bleibt.

Das Ziel ist nicht, für jedes Android-Gerät ein eigenes Layout zu bauen. Das Ziel ist, dass jede Komponente auf den Platz reagiert, den sie tatsächlich bekommt.

## Schneller QA-Durchlauf für Android 17

Die meisten Teams können diese Prüfung in einer QA-Session durchführen:

1. Öffne die Seite auf einem echten Android-Smartphone und erfasse den Viewport mit dem [Screen Size Checker](https://screensizechecker.com/de/).
2. Teste den Kernflow im [Responsive Tester](https://screensizechecker.com/de/devices/responsive-tester) bei 360, 390, 412, 600, 768, 840 und 1024 CSS px.
3. Ergänze ein fast quadratisches Szenario wie 720 x 720.
4. Ergänze ein Querformat mit knapper Höhe wie 844 x 390.
5. Prüfe jeden Schritt des Flows: Navigation, Suche, Formulareingabe, Checkout oder Submit, Fehlerzustände und Bestätigung.
6. Vergleiche strittige Foldable- oder Tablet-Entscheidungen mit der Tabelle [Android Viewport-Größen](https://screensizechecker.com/de/devices/android-viewport-sizes).
7. Dokumentiere Fehler mit Viewport-Größe, DPR und Seitenverhältnis, nicht nur mit dem Gerätenamen.

Der letzte Punkt ist entscheidend. „Auf Galaxy Fold kaputt“ ist weniger hilfreich als „Checkout-Zusammenfassung überlappt bei 692 x 717 CSS px und DPR 3“. Die zweite Meldung gibt Design und Entwicklung eine reproduzierbare Layoutbedingung.

Wenn du schnell starten möchtest, lege im [Responsive Tester](https://screensizechecker.com/de/devices/responsive-tester) ein kleines Regressionstest-Set mit 360, 390, 412, 600, 768, 840, 1024, 720 x 720 und 844 x 390 an.

## Quellen und weiterführende Links

- [Android 17: Einschränkungen für Ausrichtung und Größenänderbarkeit werden ignoriert](https://developer.android.com/about/versions/17/changes/ff-restrictions-ignored)
- [Android Developers: Window Size Classes verwenden](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- [Android Developers: Unterschiedliche Displaygrößen unterstützen](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes)
- [Screen Size Checker: deutsche Android-Viewport-Tabelle](https://screensizechecker.com/de/devices/android-viewport-sizes)
- [Screen Size Checker: Layout im Responsive Tester nachstellen](https://screensizechecker.com/de/devices/responsive-tester)
- [Viewport-Grundlagen verstehen](https://screensizechecker.com/de/blog/viewport-basics)
- [Gerätepixelverhältnis (DPR) erklärt](https://screensizechecker.com/de/blog/device-pixel-ratio)
- [CSS Media Queries Grundlagen](https://screensizechecker.com/de/blog/media-queries-essentials)
- [Container Queries Leitfaden](https://screensizechecker.com/de/blog/container-queries-guide)
- [Responsive Design Debugging Checkliste](https://screensizechecker.com/de/blog/responsive-debugging-checklist)

## FAQ

### Betrifft Android 17 nur native Android-Apps?

Nein. Die Plattformänderung betrifft direkt native Apps. Der gleiche Gerätetrend betrifft aber auch Web-Apps, PWAs, WebViews und responsive Websites, die auf Android-Tablets, Foldables und Desktop-ähnlichen Fenstern geöffnet werden. Wenn dein UI von einem festen Smartphone-Viewport ausgeht, solltest du es neu testen.

### Welche Viewport-Größen sollte ich für Android-Foldables testen?

Teste Cover-Display und aufgeklapptes Hauptdisplay. Praktisch heißt das: 320-430 CSS px für schmale Smartphone-Breiten, 600-840 CSS px für mittlere Breiten, mindestens ein Querformat mit knapper Höhe und mindestens ein fast quadratisches Szenario. Vergleiche danach mit der aktuellen Tabelle [Android Viewport-Größen](https://screensizechecker.com/de/devices/android-viewport-sizes).

### Ist Bildschirmauflösung oder Viewport-Größe wichtiger für Responsive Design?

Für Layouts ist meistens die Viewport-Größe wichtiger, weil CSS Media Queries und Layoutentscheidungen in CSS-Pixeln arbeiten. Bildschirmauflösung und DPR bleiben wichtig für Bildschärfe, Canvas-Rendering und dichteabhängige Assets.

### Wie teste ich Android Multi-Window ohne jedes Gerät?

Nutze zuerst einen Responsive Tester mit Custom-Viewport-Größen und prüfe danach kritische Flows auf mindestens einem echten Android-Gerät oder Emulator. Multi-Window-Testing bedeutet, das verfügbare Fenster im Mehrfenstermodus zu verändern; benannte Geräte-Presets reichen dafür nicht aus.

### Welche Größen sind für Android-17-Multi-Window besonders wichtig?

Teste mindestens 360, 390, 412, 600, 768, 840 und 1024 CSS px. Ergänze 720 x 720 für ein fast quadratisches Foldable-Szenario und 844 x 390 für Querformat mit knapper Höhe. Damit deckst du die meisten kritischen Übergänge zwischen Smartphone, Foldable, Tablet, Split-Screen und Desktop-Fenster ab.

### Muss ich für jedes Foldable-Modell ein eigenes Layout bauen?

In der Regel nein. Baue adaptive Komponenten, die auf verfügbare Breite, Höhe und Seitenverhältnis reagieren. Gerätetabellen helfen, reale Wertebereiche zu verstehen; die eigentlichen Breakpoints sollten aus Inhalt und Nutzerflow entstehen, nicht aus einzelnen Modellnamen.
