---
title: "Android 17 sur pliables : viewport et multifenêtre"
description: "Testez Android 17 sur pliables et en multifenêtre avec des viewports 600/840 CSS px, sans confondre pixels CSS et dp Android."
date: "2026-06-19"
author: "Équipe Screen Size Checker"
category: "technical"
tags: ["android-17", "foldables", "multi-window", "responsive-design", "viewport", "android"]
featuredImage: ""
---

Pendant longtemps, tester les écrans Android semblait facile à simuler : choisir quelques smartphones populaires, réduire le navigateur à un viewport étroit en mode portrait, puis considérer le layout responsive comme validé.

Ce n'est plus suffisant. Les apps Android et les sites mobiles s'ouvrent aujourd'hui sur téléphones, tablettes, appareils pliables (foldables), fenêtres ChromeOS, fenêtres redimensionnables de style desktop, sessions en écran partagé et écrans externes. Avec Android 17, la direction de la plateforme devient encore plus claire : les layouts doivent s'adapter à l'espace réel que reçoit l'app ou la page, pas au nom d'appareil imaginé pendant la phase de design.

Pour les équipes web, PWA et hybrides, la conséquence est la même. Un écran n'est plus un rectangle fixe. La bonne question n'est pas "quel est cet appareil ?", mais "combien d'espace de layout est disponible maintenant, quel est le Device Pixel Ratio (DPR) et quel rapport d'aspect l'utilisateur voit-il ?".

Ce guide relie la tendance Android 17 vers les grands écrans et les fenêtres redimensionnables à un workflow de test concret pour les pliables, le mode multifenêtre (multi-window) et les outils de Screen Size Checker.

## Réponse rapide

Pour préparer votre UI à Android 17, testez par taille de viewport, pas seulement par nom d'appareil. Couvrez au minimum ces plages :

- 320-430 pixels CSS (CSS px) pour les smartphones Android compacts.
- 600-840 CSS px pour les écrans principaux de pliables et les tablettes en portrait.
- 840-1199 CSS px pour les tablettes en paysage et les layouts plus larges.
- Un cas pliable presque carré, par exemple 720 x 720.
- Un cas paysage avec peu de hauteur, par exemple 844 x 390.
- Au moins une fenêtre de style desktop librement redimensionnée.

Mesurez d'abord un appareil réel avec le [vérificateur de taille d'écran et de viewport Screen Size Checker](https://screensizechecker.com/fr/) : taille du viewport, DPR, taille d'écran signalée par le navigateur et rapport d'aspect. Reproduisez ensuite les dimensions critiques dans le [testeur responsive pour viewports personnalisés](https://screensizechecker.com/fr/devices/responsive-tester).

## Pourquoi Android 17 change la base de test

La documentation Android 17 de Google indique que, pour les apps ciblant Android 17 (niveau d'API 37) ou supérieur, les restrictions d'orientation, de redimensionnement et de rapport d'aspect ne s'appliquent plus sur les grands écrans, lorsque la plus petite largeur disponible dépasse 600 dp (sw600dp et plus), selon les exceptions officielles. Android 17 supprime aussi l'option temporaire de retrait qui existait dans Android 16.

Le périmètre exact et les exceptions, notamment les écrans inférieurs à sw600dp, les jeux et certains paramètres de rapport d'aspect choisis par l'utilisateur, doivent toujours être vérifiés dans la documentation officielle. La règle concerne directement les apps Android natives et le comportement lié au target SDK/API. Pour les web apps, PWA et WebViews, c'est surtout un signal fort : les utilisateurs vont plus souvent utiliser de grandes fenêtres Android, des fenêtres divisées et des fenêtres redimensionnables.

Beaucoup d'anciens layouts mobiles reposent encore sur des hypothèses silencieuses :

- L'app est toujours en portrait.
- Le viewport de téléphone est toujours étroit.
- Un rapport d'aspect maximal fixe protégera le layout.
- Une tablette n'est qu'un téléphone plus grand.
- Un pliable n'a qu'un seul viewport utile.

Ces hypothèses sont fragiles dans les grandes fenêtres et les fenêtres partagées. Les recommandations Android pour grands écrans poussent les équipes vers des layouts adaptatifs qui répondent à la taille de fenêtre disponible. Cela ne touche pas seulement les équipes Android natives, mais aussi les web apps, PWA, WebViews, tunnels de checkout, tableaux de bord de compte, portails de support et sites responsive ouverts dans des environnements Android redimensionnables.

Si votre layout casse quand la largeur disponible passe d'une taille téléphone à une taille tablette, ou si les contrôles deviennent serrés quand la hauteur est faible en paysage, Android 17 rend ces faiblesses plus faciles à rencontrer pour les utilisateurs.

## Pourquoi tester les pliables et le multifenêtre par taille de viewport

Un appareil Android moderne peut produire des conditions de layout très différentes :

| Scénario | Ce qui change | Pourquoi c'est important |
|----------|---------------|--------------------------|
| Smartphone en portrait | Viewport CSS étroit, DPR élevé, beaucoup d'espace vertical | Navigation, contrôles fixes et formulaires doivent rester compacts. |
| Smartphone en paysage | Plus de largeur, mais beaucoup moins de hauteur | Deux colonnes peuvent tenir, mais les modales, médias et panneaux bas peuvent devenir serrés. |
| Écran externe du pliable | Souvent étroit et haut | Les écrans riches en texte, champs de recherche et cartes peuvent être plus contraints que sur un smartphone classique. |
| Écran principal du pliable | Plus large, parfois presque carré | Les layouts mobiles à une colonne peuvent sembler vides, étirés ou pauvres en information. |
| Tablette en portrait | Largeur moyenne avec plus d'espace de lecture | Barres latérales, panneaux de détail et grilles peuvent commencer à être utiles. |
| Tablette en paysage | Largeur étendue | Les modèles master-detail, layouts multipanneaux et tableaux de données deviennent attendus. |
| Écran partagé | L'app ne reçoit qu'une partie de l'écran physique | Les spécifications de l'appareil ne suffisent plus ; la taille de fenêtre est l'entrée réelle. |
| Fenêtre de style desktop | Largeur et hauteur librement redimensionnables | Les utilisateurs créent des largeurs intermédiaires qui n'existent dans aucun preset d'appareil. |

C'est pour cela que les classes de taille de fenêtre Android (Window Size Classes) se concentrent sur la zone d'écran disponible pour l'app. Les termes compact, medium, expanded, large et extra-large sont plus utiles pour les décisions de layout que les étiquettes "phone" ou "tablet", car le même appareil physique peut changer de classe quand l'utilisateur tourne, plie, déplie, divise ou redimensionne l'écran.

## Avant de choisir les breakpoints : mesurez viewport, DPR et rapport d'aspect

Pour la QA responsive, ces valeurs sont plus utiles que les spécifications marketing de l'appareil :

| Mesure | Signification | Utilité |
|--------|---------------|---------|
| Taille d'écran signalée par le navigateur | Dimensions de `screen.width` et `screen.height`, généralement en pixels CSS | Aide à contextualiser l'environnement, sans remplacer la résolution physique de la dalle. |
| Taille du viewport | Zone disponible en pixels CSS pour la page ou la surface de l'app | Base principale pour les media queries, breakpoints et reflows. |
| Device Pixel Ratio (DPR) | Pixels physiques par pixel CSS | Explique pourquoi des appareils aux résolutions proches peuvent exposer des largeurs CSS différentes. |
| Rapport d'aspect | Relation entre largeur et hauteur | Aide à repérer layouts étirés, médias rognés et panneaux inconfortables. |
| Orientation et forme de fenêtre | Portrait, paysage ou fenêtre libre | Révèle les hypothèses sur hauteur, navigation, clavier et zones média. |

L'erreur la plus courante consiste à utiliser la résolution d'écran comme source de breakpoints. Un écran physique de 1440 px de large peut encore offrir seulement environ 360-430 CSS px de viewport, selon le DPR, l'interface du navigateur, le scaling d'affichage et les paramètres système. Les pliables ajoutent une couche supplémentaire : l'écran externe et l'écran principal du même appareil peuvent générer des familles de viewport complètement différentes.

Commencez par le comportement du viewport. Utilisez ensuite la taille d'écran signalée, la résolution physique et le DPR pour expliquer la qualité d'image, le rendu canvas et la densité de pixels.

Important : la valeur 600 dp de la documentation Android appartient au contexte des layouts Android natifs et des règles de plateforme. Les plages 600 et 840 px de cet article sont des largeurs de test web en pixels CSS. Les deux aident à prendre au sérieux la zone disponible, mais ce ne sont pas des conversions directes d'unités.

## Matrice de test pour pliables Android et multifenêtre

Utilisez cette matrice comme base pratique de préparation à Android 17. Elle ne remplace pas les tests sur appareils réels, mais évite l'erreur classique qui consiste à tester une seule largeur de smartphone Android.

| Groupe de test | Plage de largeur | À surveiller |
|----------------|------------------|--------------|
| Smartphone compact | 320-374 CSS px | Libellés longs, formulaires de checkout, overflow de navigation, cartes à largeur fixe. |
| Smartphone Android courant | 375-430 CSS px | Layout mobile par défaut, cibles tactiles, footer sticky. |
| Smartphone en paysage | 640-932 CSS px de largeur avec peu de hauteur | Hauteur du header, modales, médias, panneaux bas, chevauchement clavier. |
| Pliable fermé | 320-430 CSS px avec rapport d'aspect haut | Formulaires denses, retours à la ligne, cartes étroites, barres de recherche. |
| Pliable ouvert | 600-840 CSS px, y compris formes presque carrées | Espace vide, cartes étirées, seuils de layout en deux colonnes. |
| Tablette en portrait | 600-839 CSS px | Layouts moyens, navigation latérale, longueurs de ligne lisibles. |
| Tablette en paysage | 840-1199 CSS px | Layouts étendus, tableaux de données, écrans master-detail. |
| Fenêtre de style desktop | 500-1600 CSS px, librement redimensionnable | Transitions de layout, container queries, overflow de tableaux. |
| Écran partagé | Largeurs de demi-écran et deux tiers | Vérifier si le flux fonctionne quand l'écran physique est grand, mais la fenêtre petite. |

Si vous ne choisissez que quelques largeurs, testez au moins 360, 390, 412, 600, 768, 840 et 1024. Ajoutez une largeur intermédiaire librement redimensionnée, comme 540 ou 720. La hauteur doit être testée séparément, surtout pour le paysage et l'écran partagé.

## Reproduire les tailles Android 17 critiques avec Screen Size Checker

Les outils de Screen Size Checker couvrent les principales étapes de ce workflow. Utilisez-les dans cet ordre.

### 1. Mesurez d'abord l'appareil réel

Ouvrez [Screen Size Checker](https://screensizechecker.com/fr/) sur l'appareil Android ou le navigateur que vous voulez tester. Notez :

- taille du viewport
- taille d'écran signalée par le navigateur
- Device Pixel Ratio (DPR)
- rapport d'aspect
- détails du navigateur et du système d'exploitation

Vous obtenez ainsi les valeurs réellement vues par votre layout, pas seulement la résolution annoncée par l'appareil.

### 2. Comparez avec les appareils Android courants

Utilisez le tableau des [tailles de viewport Android pour pliables](https://screensizechecker.com/fr/devices/android-viewport-sizes) pour comparer vos mesures avec des appareils de référence Google Pixel, Samsung Galaxy, pliables, Xiaomi, OPPO, vivo, Honor et autres Android.

Pour les pliables, regardez surtout les entrées qui distinguent l'écran externe et l'écran principal. Le but n'est pas de cibler un modèle exact. Le but est de comprendre les plages de largeur, les valeurs de DPR et les rapports d'aspect que votre design doit supporter solidement.

### 3. Reproduisez le layout dans le testeur responsive

Utilisez le [testeur responsive](https://screensizechecker.com/fr/devices/responsive-tester) pour tester votre page sur des tailles de viewport smartphone, tablette, desktop et personnalisées. Surveillez surtout :

- si les media queries se déclenchent aux largeurs prévues
- si les composants fixes provoquent de l'overflow
- si cartes, tableaux, navigation, menus latéraux et modales se réorganisent proprement
- si le design fonctionne aussi sur des largeurs intermédiaires sans nom d'appareil

Pour Android 17, ne vous arrêtez pas aux presets smartphone. Ajoutez des largeurs personnalisées autour de 600 px et 840 px, car beaucoup de layouts adaptatifs changent de structure à ces seuils.

### 4. Testez les formes, pas seulement les largeurs

Les pliables et les modes multifenêtre peuvent produire des rapports d'aspect inhabituels. Si votre page contient vidéos, graphiques, dashboards, images produit, previews caméra ou cartes avec ratio fixe, utilisez le [calculateur de rapport d'aspect](https://screensizechecker.com/fr/devices/aspect-ratio-calculator).

Un layout qui semble correct en 390 x 844 peut commencer à rogner des médias, étirer des cartes ou rendre des barres latérales trop étroites en 720 x 720 ou 840 x 600.

### 5. Justifiez les décisions visuelles par l'espace disponible

Quand produit, design et QA débattent du passage d'un écran à deux colonnes, utilisez l'[outil de comparaison de tailles d'écran](https://screensizechecker.com/fr/devices/compare) pour comparer taille physique et surface utile.

Ainsi, "on dirait une tablette" devient une discussion concrète sur largeur, hauteur, surface et rapport d'aspect.

## Checklist CSS et QA pour Android 17

Utilisez cette checklist avant de publier un layout que des utilisateurs Android ouvriront sur smartphones, pliables, tablettes ou fenêtres de style desktop :

- Testez sous et au-dessus de 600 CSS px.
- Testez au moins une largeur étendue à partir d'environ 840 CSS px.
- Redimensionnez la fenêtre manuellement au lieu d'utiliser seulement des presets d'appareil.
- Testez portrait et paysage séparément.
- Testez le manque de hauteur, pas seulement le manque de largeur.
- Évitez les règles qui supposent qu'un téléphone est toujours en portrait.
- Évitez la logique par nom d'appareil, comme "si tablette", quand la taille de fenêtre disponible est la vraie base du layout.
- Utilisez des grilles fluides, un espacement flexible et des breakpoints basés sur le contenu.
- Utilisez des container queries pour les composants réutilisables qui peuvent apparaître dans des panneaux étroits ou larges.
- Définissez des `max-width` raisonnables pour les longues lignes de texte dans les layouts étendus.
- Faites défiler, empiler ou réduire les colonnes des tableaux avant qu'ils débordent.
- Vérifiez modales, menus latéraux, footers sticky, bannières cookies et boutons d'action flottants avec peu de hauteur.
- Évitez que médias et graphiques soient étirés ou rognés quand le rapport d'aspect change.
- En apps natives ou hybrides : vérifiez que l'état de l'UI est conservé à la rotation, au pliage, au dépliage et au redimensionnement.

L'objectif n'est pas de créer un layout différent pour chaque appareil Android. L'objectif est que chaque composant réponde à l'espace qu'il reçoit réellement.

## Passage QA rapide pour Android 17

La plupart des équipes peuvent exécuter ce passage en une session de QA :

1. Ouvrez la page sur un vrai smartphone Android et capturez le viewport avec [Screen Size Checker](https://screensizechecker.com/fr/).
2. Testez le flux principal dans le [testeur responsive pour viewports personnalisés](https://screensizechecker.com/fr/devices/responsive-tester) en 360, 390, 412, 600, 768, 840 et 1024 CSS px.
3. Ajoutez un scénario presque carré comme 720 x 720.
4. Ajoutez un scénario paysage avec peu de hauteur comme 844 x 390.
5. Vérifiez chaque étape du flux : navigation, recherche, saisie de formulaire, checkout ou envoi, états d'erreur et confirmation.
6. Comparez toute décision douteuse sur pliable ou tablette avec le tableau des [tailles de viewport Android](https://screensizechecker.com/fr/devices/android-viewport-sizes).
7. Documentez les problèmes avec taille de viewport, DPR et rapport d'aspect, pas seulement avec le nom d'appareil.

Le dernier point est essentiel. "Cassé sur Galaxy Fold" est moins utile que "le récapitulatif de checkout se chevauche en 692 x 717 CSS px avec DPR 3". Le second rapport donne aux équipes design et développement une condition de layout reproductible.

Pour démarrer vite, créez dans le [testeur responsive](https://screensizechecker.com/fr/devices/responsive-tester) un petit jeu de tests de régression avec 360, 390, 412, 600, 768, 840, 1024, 720 x 720 et 844 x 390.

## Sources et lectures recommandées

- [Android 17 : les restrictions d'orientation et de redimensionnement sont ignorées](https://developer.android.com/about/versions/17/changes/ff-restrictions-ignored)
- [Android Developers : utiliser les Window Size Classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- [Android Developers : prendre en charge différentes tailles d'écran](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes)
- [Screen Size Checker : tableau des tailles de viewport Android](https://screensizechecker.com/fr/devices/android-viewport-sizes)
- [Screen Size Checker : reproduire les layouts dans le testeur responsive](https://screensizechecker.com/fr/devices/responsive-tester)
- [Comprendre les bases du viewport](https://screensizechecker.com/fr/blog/viewport-basics)
- [Le Device Pixel Ratio (DPR) expliqué simplement](https://screensizechecker.com/fr/blog/device-pixel-ratio)
- [Les media queries pour le design responsive](https://screensizechecker.com/fr/blog/media-queries-essentials)
- [Guide des CSS Container Queries](https://screensizechecker.com/fr/blog/container-queries-guide)
- [Checklist de débugage responsive](https://screensizechecker.com/fr/blog/responsive-debugging-checklist)

## FAQ

### Android 17 concerne-t-il seulement les apps Android natives ?

Non. Le changement de plateforme touche directement les apps natives. Mais la même tendance d'appareils concerne aussi les web apps, PWA, WebViews et sites responsive ouverts sur tablettes Android, pliables et fenêtres de style desktop. Si votre UI dépend d'un viewport fixe en forme de téléphone, il faut la retester.

### Quelles tailles de viewport tester pour les pliables Android ?

Testez l'écran externe et l'écran principal déplié. En pratique, cela signifie 320-430 CSS px pour les largeurs étroites de smartphone, 600-840 CSS px pour les largeurs moyennes, au moins un scénario paysage avec peu de hauteur et au moins un scénario presque carré. Comparez ensuite avec le tableau actuel des [tailles de viewport Android](https://screensizechecker.com/fr/devices/android-viewport-sizes).

### Résolution d'écran ou taille du viewport : qu'est-ce qui compte le plus pour le design responsive ?

Pour les layouts, la taille du viewport est généralement plus importante, car les media queries CSS et la plupart des décisions de layout web travaillent en pixels CSS. La taille d'écran signalée par le navigateur, la résolution physique de la dalle et le DPR restent utiles pour la netteté des images, le rendu canvas et les ressources dépendantes de la densité.

### 600 CSS px est-il équivalent à 600 dp sur Android ?

Non. Le dp Android appartient au système de layouts natifs et aux règles de plateforme. Le pixel CSS est l'unité qu'une page web voit dans le viewport. Dans cet article, 600 et 840 CSS px sont des largeurs de test web, pas des conversions directes depuis les dp Android.

### Comment tester les layouts Android multifenêtre sans posséder tous les appareils ?

Utilisez d'abord un testeur responsive avec des tailles de viewport personnalisées, puis validez les flux critiques sur au moins un appareil Android réel ou un émulateur. Tester le multifenêtre signifie modifier la fenêtre disponible ; les presets nommés par appareil ne suffisent pas.

### Quelles tailles sont particulièrement importantes pour Android 17 en multifenêtre ?

Testez au moins 360, 390, 412, 600, 768, 840 et 1024 CSS px. Ajoutez 720 x 720 pour un scénario pliable presque carré et 844 x 390 pour un paysage avec peu de hauteur. Vous couvrez ainsi la plupart des transitions critiques entre smartphone, pliable, tablette, écran partagé et fenêtre desktop.

### Faut-il créer un layout séparé pour chaque modèle pliable ?

En général, non. Créez des composants adaptatifs qui répondent à la largeur disponible, à la hauteur et au rapport d'aspect. Les tableaux d'appareils aident à comprendre les plages réelles ; les breakpoints doivent venir du contenu et du flux utilisateur, pas des noms de modèles.
