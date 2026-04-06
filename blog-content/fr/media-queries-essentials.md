---
title: "Les media queries pour le design responsive"
description: "Maîtrisez les bases des media queries CSS pour créer des sites responsive qui marchent sur tous les appareils"
date: "2023-10-25"
author: "Alex Chen"
category: "css"
tags: ["media-queries", "design-responsive", "css", "breakpoints"]
featuredImage: "media-queries.jpg"
slug: "media-queries-essentials"
keywords: ["media queries CSS", "design responsive", "breakpoints CSS", "mobile first", "requêtes média"]
---

## Les media queries pour le design responsive

Les media queries sont la colonne vertébrale du design responsive. Elles permettent à vos sites d'adapter leur mise en page et leur style selon les caractéristiques de l'appareil. Ce guide couvre tout ce qu'il faut savoir pour les utiliser dans vos projets.

## Qu'est-ce qu'une media query ?

Les media queries sont des techniques CSS qui appliquent des styles différents selon les caractéristiques de l'appareil : taille d'écran, résolution ou orientation. On les définit avec la règle `@media` en CSS :

```css
@media screen and (max-width: 768px) {
  /* Styles appliqués quand le viewport fait 768px ou moins */
  .container {
    flex-direction: column;
  }
}
```

Ce concept simple est le moteur du comportement responsive des sites modernes. Il permet d'offrir une expérience adaptée sur chaque appareil.

## Anatomie d'une media query

Une media query se compose de :

1. **Type de média :** Le type d'appareil ciblé (`screen`, `print`, `speech`)
2. **Opérateurs logiques :** `and`, `not`, `only`, et les virgules pour combiner plusieurs requêtes
3. **Caractéristiques média :** Les conditions comme `width`, `height`, `orientation`, etc.
4. **Règles CSS :** Les styles à appliquer quand les conditions sont remplies

```css
@media screen and (min-width: 768px) and (max-width: 1024px) {
  /* Styles pour tablettes et petits portables */
}
```

## Caractéristiques média courantes

Voici les caractéristiques les plus utilisées :

| Caractéristique | Description | Exemple |
|-----------------|-------------|---------|
| `width` | Largeur du viewport | `(min-width: 768px)` |
| `height` | Hauteur du viewport | `(max-height: 1024px)` |
| `aspect-ratio` | Ratio largeur/hauteur | `(aspect-ratio: 16/9)` |
| `orientation` | Portrait ou paysage | `(orientation: landscape)` |
| `resolution` | Densité de pixels | `(min-resolution: 2dppx)` |
| `hover` | Capacité de survol | `(hover: hover)` |
| `prefers-color-scheme` | Préférence de couleur | `(prefers-color-scheme: dark)` |

## Stratégies de breakpoints

Les breakpoints sont les largeurs de viewport où votre design s'adapte. Il y a plusieurs approches pour les choisir :

### 1. Breakpoints par appareil

Basés sur les catégories d'appareils courantes :
- Téléphones : 360px - 428px
- Tablettes : 768px - 1024px
- Portables : 1024px - 1440px
- Desktops : 1440px+

```css
/* Styles mobile (par défaut) */
.container { width: 100%; }

/* Styles tablette */
@media (min-width: 768px) {
  .container { width: 750px; }
}

/* Styles portable */
@media (min-width: 1024px) {
  .container { width: 980px; }
}

/* Styles desktop */
@media (min-width: 1440px) {
  .container { width: 1200px; }
}
```

### 2. Breakpoints par contenu

Une approche plus souple qui s'adapte quand votre contenu commence à mal s'afficher :

```css
.article-grid {
  display: grid;
  grid-template-columns: 1fr;
}

/* Quand il y a assez de place pour 2 colonnes */
@media (min-width: 600px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Quand il y a assez de place pour 3 colonnes */
@media (min-width: 900px) {
  .article-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Mobile-First vs Desktop-First

Il y a deux approches principales pour écrire vos media queries :

### Approche Mobile-First

Commencez par les styles pour petits écrans et ajoutez de la complexité pour les grands avec `min-width` :

```css
/* Styles de base pour mobile */
.navigation {
  flex-direction: column;
}

/* Amélioration pour les grands écrans */
@media (min-width: 768px) {
  .navigation {
    flex-direction: row;
  }
}
```

### Approche Desktop-First

Commencez par les styles pour grands écrans et simplifiez pour les petits avec `max-width` :

```css
/* Styles de base pour desktop */
.navigation {
  flex-direction: row;
}

/* Simplification pour les petits écrans */
@media (max-width: 767px) {
  .navigation {
    flex-direction: column;
  }
}
```

Le développement moderne privilégie l'approche mobile-first pour sa philosophie d'amélioration progressive et son code généralement plus propre.

## Techniques avancées

### 1. Requêtes par plage

Ciblez une plage précise de tailles de viewport :

```css
@media (min-width: 768px) and (max-width: 1023px) {
  /* Styles uniquement pour tablettes */
}
```

### 2. Requêtes d'orientation

Appliquez des styles selon l'orientation de l'appareil :

```css
@media (orientation: landscape) {
  .gallery {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (orientation: portrait) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 3. Détection de fonctionnalités avec `@supports`

Combinez media queries et détection de fonctionnalités :

```css
@media (min-width: 768px) {
  @supports (display: grid) {
    .container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
}
```

### 4. Container Queries (nouveau !)

L'avenir du design responsive — des styles basés sur la taille du conteneur plutôt que du viewport :

```css
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

Note : Les container queries sont encore en cours de déploiement dans les navigateurs. Vérifiez la compatibilité avant de les utiliser.

## Cas d'usage courants

### Menus de navigation

```css
/* Mobile : menu hamburger */
.nav-menu {
  display: none;
}

.hamburger-icon {
  display: block;
}

/* Desktop : menu déplié */
@media (min-width: 1024px) {
  .nav-menu {
    display: flex;
  }
  
  .hamburger-icon {
    display: none;
  }
}
```

### Layouts en grille

```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Typographie

```css
body {
  font-size: 16px;
}

h1 {
  font-size: 24px;
}

@media (min-width: 768px) {
  body {
    font-size: 18px;
  }
  
  h1 {
    font-size: 32px;
  }
}

@media (min-width: 1200px) {
  h1 {
    font-size: 48px;
  }
}
```

## Tester vos media queries

Bien tester vos media queries est la clé pour s'assurer que votre design responsive fonctionne comme prévu :

1. **Outils de développement du navigateur :** Utilisez le mode responsive pour redimensionner le viewport
2. **Vrais appareils :** Testez sur de vrais téléphones, tablettes et ordinateurs
3. **Screen Size Checker :** Utilisez notre [Screen Size Checker](/fr/index.html) pour vérifier vos dimensions de viewport et tester la réactivité de votre design

## Conclusion

Les media queries sont un outil de base pour créer des sites modernes et responsive. En comprenant comment les structurer et les utiliser, vous pouvez vous assurer que votre site offre une bonne expérience sur tous les appareils et toutes les tailles d'écran.

N'oubliez pas que le design responsive ne se limite pas à faire rentrer des éléments sur différents écrans — c'est créer une expérience cohérente, peu importe comment quelqu'un accède à votre contenu.

Pour aller plus loin, consultez nos articles sur les [Bases du Viewport](/fr/blog/viewport-basics.html) et le [Device Pixel Ratio](/fr/blog/device-pixel-ratio.html).
