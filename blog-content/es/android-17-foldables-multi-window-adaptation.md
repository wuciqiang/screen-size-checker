---
title: "Android 17 en plegables: viewport y multiventana responsive"
description: "Prepara layouts para Android 17 en plegables y multiventana: prueba viewport en Responsive Tester y distingue 600/840 CSS px de Android dp."
date: "2026-06-19"
author: "Screen Size Checker Team"
category: "technical"
tags: ["android-17", "foldables", "multi-window", "responsive-design", "viewport", "android"]
featuredImage: ""
---

Durante mucho tiempo, probar pantallas Android era fácil de simular: elegir algunos smartphones populares, ajustar el navegador a un viewport estrecho en vertical y dar por válido el layout responsive.

Eso ya no alcanza. Las apps Android y los sitios móviles se abren hoy en teléfonos, tablets, dispositivos plegables, ventanas de ChromeOS, ventanas redimensionables de estilo escritorio, vistas de pantalla dividida y pantallas externas. Con Android 17, la dirección es aún más clara: los layouts deben adaptarse al espacio real que recibe la app o la página, no al nombre del dispositivo que se imaginó durante el diseño.

Para equipos web, PWA e híbridos, la consecuencia es la misma. Una pantalla ya no es un rectángulo fijo. La pregunta útil no es "¿qué dispositivo es?", sino "¿cuánto espacio de layout hay ahora mismo, qué relación de píxeles del dispositivo (DPR) existe y qué relación de aspecto está viendo el usuario?".

Esta guía conecta la tendencia de Android 17 hacia pantallas grandes y ventanas redimensionables con un flujo de pruebas práctico para plegables, modo multiventana y las herramientas de Screen Size Checker.

## Respuesta rápida

Para preparar tu UI para Android 17, prueba por tamaño de viewport, no solo por nombre de dispositivo. Cubre al menos estos rangos:

- 320-430 píxeles CSS (CSS px) para smartphones Android compactos.
- 600-840 CSS px para pantallas principales de plegables y tablets en vertical.
- 840-1199 CSS px para tablets en horizontal y layouts más amplios.
- Un escenario plegable casi cuadrado, por ejemplo 720 x 720.
- Un escenario horizontal con poca altura, por ejemplo 844 x 390.
- Al menos una ventana de estilo escritorio redimensionada libremente.

Primero mide en un dispositivo real con el [medidor de tamaño de pantalla y viewport de Screen Size Checker](https://screensizechecker.com/es/) el tamaño del viewport, DPR, tamaño de pantalla reportado por el navegador y relación de aspecto. Después reproduce los tamaños críticos en el [Responsive Tester para tamaños de viewport personalizados](https://screensizechecker.com/es/devices/responsive-tester).

## Por qué Android 17 cambia la base de pruebas

La documentación de Android 17 de Google indica que, para apps orientadas a Android 17 (nivel de API 37) o superior, las restricciones de orientación, redimensionabilidad y relación de aspecto dejan de aplicarse en pantallas grandes de la clase sw600dp, según las excepciones oficiales. Android 17 también elimina el opt-out temporal para desarrolladores que existía en Android 16.

La aplicación exacta y sus excepciones deben comprobarse siempre en la documentación oficial. La regla afecta directamente a apps Android nativas y a su comportamiento de target SDK/API. Para web apps, PWAs y WebViews, sobre todo es una señal fuerte: los usuarios usarán más ventanas Android grandes, divididas y redimensionables.

Muchos layouts móviles antiguos dependen en silencio de supuestos como estos:

- La app siempre está en vertical.
- El viewport de teléfono siempre es estrecho.
- Una relación de aspecto máxima fija protegerá el layout.
- Una tablet es solo un teléfono más grande.
- Un plegable tiene un solo viewport relevante.

Esos supuestos son frágiles en ventanas grandes y divididas. La guía de Android para pantallas grandes orienta a los equipos hacia layouts adaptativos que responden al tamaño de ventana disponible. Esto no afecta solo a equipos Android nativos, sino también a web apps, PWAs, WebViews, checkouts, dashboards de cuenta, portales de soporte y sitios responsive que los usuarios abren en entornos Android redimensionables.

Si tu layout se rompe cuando el ancho disponible salta de tamaño teléfono a tamaño tablet, o si los controles quedan apretados cuando hay poca altura en horizontal, Android 17 hará que esas debilidades sean más fáciles de encontrar para los usuarios.

## Por qué los plegables y multiventana deben probarse por tamaño de viewport

Un dispositivo Android moderno puede generar condiciones de layout muy diferentes:

| Escenario | Qué cambia | Por qué importa |
|----------|------------|-----------------|
| Smartphone en vertical | Viewport CSS estrecho, DPR alto, mucho espacio vertical | La navegación, controles fijos y formularios necesitan comportamiento compacto. |
| Smartphone en horizontal | Más ancho, pero mucha menos altura | Puede que quepan dos columnas, pero los modales, los medios y los paneles inferiores pueden quedar apretados. |
| Pantalla externa del plegable | A menudo estrecha y alta | Las pantallas con mucho texto, campos de búsqueda y tarjetas pueden quedar más justas que en smartphones normales. |
| Pantalla principal del plegable | Más ancha, a veces casi cuadrada | Los layouts móviles de una columna pueden verse vacíos, estirados o pobres en información. |
| Tablet en vertical | Ancho medio con más espacio de lectura | Sidebars, paneles de detalle y grids pueden empezar a tener sentido. |
| Tablet en horizontal | Ancho ampliado | Se esperan patrones master-detail, layouts multipanel y tablas de datos. |
| Split-screen | La app recibe solo una parte de la pantalla física | Las especificaciones del dispositivo no bastan; el tamaño de ventana es la entrada real. |
| Ventana de estilo escritorio | Ancho y alto se pueden redimensionar libremente | Los usuarios crean anchos intermedios que no aparecen en ningún preset de dispositivo. |

Por eso las Window Size Classes de Android se centran en el área de pantalla disponible para la app. Términos como compact, medium, expanded, large y extra-large son más útiles para decisiones de layout que etiquetas como "phone" o "tablet", porque el mismo dispositivo puede cambiar de clase al rotar, plegar, desplegar, dividir o redimensionar la pantalla.

## Antes de elegir breakpoints: mide viewport, DPR y relación de aspecto

Para QA responsive, estos valores son más útiles que las especificaciones de marketing del dispositivo:

| Medición | Significado | Utilidad |
|----------|-------------|----------|
| Tamaño de pantalla reportado por el navegador | Dimensiones de `screen.width` y `screen.height`, normalmente en píxeles CSS | Ayuda a contextualizar el entorno, pero no sustituye a la resolución física del panel. |
| Tamaño de viewport | Área disponible en píxeles CSS para la página o superficie de app | Base principal para media queries, breakpoints y reflow. |
| Relación de píxeles del dispositivo (DPR) | Píxeles físicos por píxel CSS | Explica por qué dispositivos con resoluciones parecidas pueden exponer anchos CSS diferentes. |
| Relación de aspecto | Relación entre ancho y alto | Ayuda a detectar layouts estirados, medios recortados y paneles incómodos. |
| Orientación y forma de ventana | Vertical, horizontal o forma de ventana libre | Revela supuestos sobre altura, navegación, teclado y áreas multimedia. |

El error más frecuente es usar la resolución de pantalla como fuente de breakpoints. Una pantalla física de 1440 px de ancho puede ofrecer solo unos 360-430 CSS px de viewport según DPR, UI del navegador, escala de display y ajustes del sistema. En plegables, además, la pantalla externa y la principal del mismo dispositivo pueden producir familias de viewport completamente distintas.

Empieza por el comportamiento del viewport. Usa resolución y DPR después para explicar calidad de imagen, renderizado de canvas y densidad de píxeles.

Importante: el valor de 600 dp de la documentación Android pertenece al contexto de layouts nativos Android y reglas de plataforma. Los rangos de 600 y 840 px en este artículo son anchos de prueba para layouts web en píxeles CSS. Ambos ayudan a tomarse en serio el área disponible, pero no son una conversión directa de unidades.

## Matriz de prueba para plegables Android y multiventana

Usa esta matriz como base práctica para la preparación de Android 17. No sustituye las pruebas en dispositivos reales, pero evita el error común de probar solo un ancho de smartphone Android.

| Grupo de prueba | Rango de ancho | Qué revisar |
|-----------------|----------------|-------------|
| Smartphone compacto | 320-374 CSS px | Etiquetas largas, formularios de checkout, overflow de navegación, tarjetas de ancho fijo. |
| Smartphone Android común | 375-430 CSS px | Layout móvil por defecto, objetivos táctiles, footer fijo. |
| Smartphone en horizontal | 640-932 CSS px de ancho con poca altura | Altura del header, modales, medios, paneles inferiores, superposición del teclado. |
| Plegable cerrado | 320-430 CSS px con relación de aspecto alta | Formularios densos, saltos de texto, tarjetas estrechas, barras de búsqueda. |
| Plegable abierto | 600-840 CSS px, incluidas formas casi cuadradas | Espacio vacío, tarjetas estiradas, umbrales de layout en dos columnas. |
| Tablet en vertical | 600-839 CSS px | Layouts medios, navegación lateral, longitudes de línea legibles. |
| Tablet en horizontal | 840-1199 CSS px | Layouts ampliados, tablas de datos, pantallas master-detail. |
| Ventana de estilo escritorio | 500-1600 CSS px, redimensionable libremente | Transiciones de layout, container queries, overflow de tablas. |
| Split-screen | Anchos de media pantalla y dos tercios | Si el flujo sigue funcionando aunque la pantalla física sea grande y la ventana pequeña. |

Si solo puedes elegir pocos anchos, prueba al menos 360, 390, 412, 600, 768, 840 y 1024. Añade un ancho intermedio redimensionado libremente, como 540 o 720. La altura debe probarse por separado, sobre todo para horizontal y split-screen.

## Reproducir tamaños críticos de Android 17 con Screen Size Checker

Las herramientas de Screen Size Checker cubren las partes clave de este flujo de trabajo. Úsalas en este orden.

### 1. Mide primero el dispositivo real

Abre [Screen Size Checker](https://screensizechecker.com/es/) en el dispositivo Android o en el navegador que quieras probar. Anota:

- tamaño de viewport
- tamaño de pantalla reportado por el navegador
- relación de píxeles del dispositivo (DPR)
- relación de aspecto
- datos de navegador y sistema operativo

Así obtienes los valores que tu layout ve realmente, no solo la resolución anunciada del dispositivo.

### 2. Compara con dispositivos Android comunes

Usa la tabla de [tamaños de viewport Android para plegables](https://screensizechecker.com/es/devices/android-viewport-sizes) para comparar tus mediciones con dispositivos de referencia Google Pixel, Samsung Galaxy, plegables, Xiaomi, OPPO, vivo, Honor y otros Android.

En plegables, presta atención a entradas que separan pantalla externa y pantalla principal. El objetivo no es apuntar a un modelo exacto. El objetivo es entender los rangos de ancho, DPR y relación de aspecto que tu diseño debe soportar con robustez.

### 3. Reproduce el layout en Responsive Tester

Usa el [Responsive Tester](https://screensizechecker.com/es/devices/responsive-tester) para probar tu página en tamaños de viewport de smartphone, tablet, escritorio y personalizados. Revisa especialmente:

- si las media queries se activan en los anchos esperados
- si los componentes fijos hacen overflow
- si tarjetas, tablas, navegación, drawers y modales se reajustan bien
- si el diseño también funciona en anchos intermedios que no tienen nombre de dispositivo

Para Android 17 no te detengas en presets de smartphone. Añade anchos personalizados alrededor de 600 px y 840 px, porque ahí muchos layouts adaptativos cambian de estructura.

### 4. Prueba formas, no solo anchos

Los plegables y modos multiventana pueden crear relaciones de aspecto poco habituales. Si tu página contiene vídeos, gráficos, dashboards, imágenes de producto, previews de cámara o mapas con relación de aspecto fija, usa la [calculadora de relación de aspecto](https://screensizechecker.com/es/devices/aspect-ratio-calculator).

Un layout que se ve bien en 390 x 844 puede empezar a recortar medios, estirar tarjetas o dejar sidebars demasiado estrechas en 720 x 720 o 840 x 600.

### 5. Justifica decisiones visuales con área disponible

Cuando los equipos de producto, diseño y QA discutan si una vista debe cambiar a dos columnas, usa la [herramienta de comparación de tamaños de pantalla](https://screensizechecker.com/es/devices/compare) para comparar tamaño físico y área útil.

Así, "se siente como una tablet" se convierte en una discusión concreta sobre ancho, alto, área y relación de aspecto.

## Checklist CSS y QA para Android 17

Usa esta checklist antes de publicar un layout que los usuarios Android abrirán en smartphones, plegables, tablets o ventanas de estilo escritorio:

- Prueba por debajo y por encima de 600 CSS px.
- Prueba al menos un ancho ampliado desde unos 840 CSS px.
- Redimensiona la ventana manualmente en vez de usar solo presets de dispositivo.
- Prueba vertical y horizontal por separado.
- Prueba poca altura, no solo poco ancho.
- Evita reglas que asuman que un teléfono siempre está en vertical.
- Evita lógica por nombre de dispositivo como "si es tablet" cuando el tamaño de ventana disponible es la base real del layout.
- Usa grids fluidos, espaciado flexible y breakpoints basados en contenido.
- Usa container queries para componentes reutilizables que pueden aparecer en paneles estrechos y anchos.
- Define `max-width` razonables para líneas de texto largas en layouts ampliados.
- Haz que las tablas puedan hacer scroll, apilarse o reducir columnas antes de desbordar.
- Revisa modales, drawers, footers fijos, banners de cookies y botones de acción flotantes (FAB) con poca altura.
- Evita que medios y gráficos se estiren o se recorten cuando cambia la relación de aspecto.
- En apps nativas o híbridas: comprueba que el estado de UI se conserva al rotar, plegar, desplegar y redimensionar.

El objetivo no es crear un layout distinto para cada dispositivo Android. El objetivo es que cada componente responda al espacio que recibe realmente.

## Pase rápido de QA para Android 17

La mayoría de equipos puede ejecutar esta revisión en una sesión de QA:

1. Abre la página en un smartphone Android real y captura el viewport con [Screen Size Checker](https://screensizechecker.com/es/).
2. Prueba el flujo principal en el [Responsive Tester para tamaños de viewport personalizados](https://screensizechecker.com/es/devices/responsive-tester) a 360, 390, 412, 600, 768, 840 y 1024 CSS px.
3. Añade un escenario casi cuadrado como 720 x 720.
4. Añade un escenario horizontal con poca altura como 844 x 390.
5. Revisa cada paso del flujo: navegación, búsqueda, entrada de formulario, checkout o envío, estados de error y confirmación.
6. Compara cualquier decisión dudosa de plegable o tablet con la tabla de [tamaños de viewport Android](https://screensizechecker.com/es/devices/android-viewport-sizes).
7. Documenta fallos con tamaño de viewport, DPR y relación de aspecto, no solo con nombre de dispositivo.

El último punto es clave. "Roto en Galaxy Fold" es menos útil que "el resumen de checkout se superpone a 692 x 717 CSS px con DPR 3". El segundo reporte ofrece a diseño y desarrollo una condición de layout reproducible.

Si quieres empezar rápido, crea en el [Responsive Tester](https://screensizechecker.com/es/devices/responsive-tester) un pequeño conjunto de regresión con 360, 390, 412, 600, 768, 840, 1024, 720 x 720 y 844 x 390.

## Fuentes y lecturas recomendadas

- [Android 17: se ignoran restricciones de orientación y redimensionabilidad](https://developer.android.com/about/versions/17/changes/ff-restrictions-ignored)
- [Android Developers: usar Window Size Classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- [Android Developers: soportar diferentes tamaños de pantalla](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes)
- [Screen Size Checker: tabla Android de tamaños de viewport](https://screensizechecker.com/es/devices/android-viewport-sizes)
- [Screen Size Checker: reproducir layouts en Responsive Tester](https://screensizechecker.com/es/devices/responsive-tester)
- [Entender los fundamentos del viewport](https://screensizechecker.com/es/blog/viewport-basics)
- [Relación de píxeles del dispositivo (DPR) explicada](https://screensizechecker.com/es/blog/device-pixel-ratio)
- [Fundamentos de CSS Media Queries](https://screensizechecker.com/es/blog/media-queries-essentials)
- [Guía de Container Queries](https://screensizechecker.com/es/blog/container-queries-guide)
- [Checklist de depuración responsive](https://screensizechecker.com/es/blog/responsive-debugging-checklist)

## FAQ

### ¿Android 17 afecta solo a apps Android nativas?

No. El cambio de plataforma afecta directamente a apps nativas. Pero la misma tendencia de dispositivos también afecta a web apps, PWAs, WebViews y sitios responsive que se abren en tablets Android, plegables y ventanas de estilo escritorio. Si tu UI depende de un viewport fijo con forma de teléfono, conviene volver a probarla.

### ¿Qué tamaños de viewport debo probar para plegables Android?

Prueba la pantalla externa y la pantalla principal desplegada. En la práctica, eso significa 320-430 CSS px para anchos estrechos de smartphone, 600-840 CSS px para anchos medios, al menos un horizontal con poca altura y al menos un escenario casi cuadrado. Después compara con la tabla actual de [tamaños de viewport Android](https://screensizechecker.com/es/devices/android-viewport-sizes).

### ¿Es más importante la resolución de pantalla o el tamaño de viewport para responsive design?

Para layouts, normalmente importa más el tamaño de viewport, porque CSS media queries y la mayoría de decisiones de layout trabajan en píxeles CSS. El tamaño de pantalla reportado por el navegador, la resolución física del panel y el DPR siguen siendo útiles para nitidez de imagen, renderizado de canvas y assets dependientes de densidad.

### ¿600 CSS px es lo mismo que 600 dp en Android?

No. Android dp pertenece al sistema de layouts nativos y reglas de plataforma. CSS px es la unidad que ve una página web en el viewport. En este artículo, 600 y 840 CSS px son anchos de prueba web, no conversiones directas desde Android dp.

### ¿Cómo pruebo layouts Android multiventana sin tener todos los dispositivos?

Usa primero un responsive tester con tamaños de viewport personalizados y después valida los flujos críticos en al menos un dispositivo Android real o emulador. Probar multiventana significa cambiar la ventana disponible; los presets con nombre de dispositivo no bastan para eso.

### ¿Qué tamaños son especialmente importantes para Android 17 multiventana?

Prueba al menos 360, 390, 412, 600, 768, 840 y 1024 CSS px. Añade 720 x 720 para un escenario plegable casi cuadrado y 844 x 390 para horizontal con poca altura. Así cubres la mayoría de transiciones críticas entre smartphone, plegable, tablet, split-screen y ventana de escritorio.

### ¿Debo construir un layout separado para cada modelo plegable?

Normalmente no. Construye componentes adaptativos que respondan al ancho disponible, la altura y la relación de aspecto. Las tablas de dispositivos ayudan a entender rangos reales; los breakpoints deberían salir del contenido y del flujo de usuario, no de nombres de modelo individuales.
