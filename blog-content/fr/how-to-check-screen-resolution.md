---
title: "Comment vérifier la résolution de son écran : guide complet (2025)"
description: "Apprenez à vérifier la résolution de votre écran sur Windows, Mac, Linux et mobile. Méthodes simples, explications des résolutions et conseils pour des réglages optimaux."
slug: "comment-verifier-resolution-ecran"
date: "2025-01-19"
author: "Sarah Mitchell"
category: "guides"
tags: ["résolution-écran", "paramètres-affichage", "tutoriel", "bases"]
featuredImage: "how-to-check-screen-resolution.jpg"
keywords: "vérifier résolution écran, trouver résolution écran, résolution affichage, paramètres résolution, résolution moniteur, propriétés affichage"
---

# Comment vérifier la résolution de son écran : guide complet (2025)

Connaître la résolution de votre écran est utile pour régler votre affichage, choisir un fond d'écran adapté, configurer un double écran ou vérifier qu'un logiciel s'affiche correctement. Que vous soyez sur Windows, Mac, Linux ou mobile, il existe plusieurs façons de vérifier votre résolution rapidement.

**Réponse rapide** : Faites un **clic droit sur le bureau** et sélectionnez **Paramètres d'affichage** (Windows) ou **Préférences Système** → **Écrans** (Mac). Votre résolution s'affiche en largeur × hauteur en pixels (ex. : 1920×1080, 2560×1440). Vous pouvez aussi utiliser notre [outil Screen Size Checker](/fr/) pour une détection instantanée.

Ce guide couvre **plusieurs méthodes** pour vérifier la résolution sur toutes les plateformes, explique ce que les chiffres signifient et vous aide à régler votre affichage au mieux.

---

## Pourquoi la résolution d'écran compte

Comprendre votre résolution est utile pour plusieurs raisons :

**Pour l'affichage** :
- Régler la bonne résolution native pour un texte et des images nets
- Ajuster la mise à l'échelle et la taille des polices
- Tirer le meilleur parti de l'espace d'écran

**Pour les logiciels et les jeux** :
- Faire tourner les jeux à la résolution et aux performances idéales
- Configurer le streaming et l'enregistrement à la bonne résolution
- Mettre en place un setup multi-écrans

**Pour la création de contenu** :
- Concevoir des visuels et sites web pour des tailles d'écran précises
- Choisir les bonnes résolutions d'image et de vidéo
- Comprendre la densité de pixels et les distances de visionnage

**Pour les décisions matérielles** :
- Comparer les caractéristiques des moniteurs avant achat
- Comprendre les besoins en performances selon la résolution
- Planifier une mise à niveau de carte graphique

---

## Comprendre la résolution d'écran

### Ce que les chiffres veulent dire

**Format de résolution** : Largeur × Hauteur en pixels
- **1920×1080** : 1 920 pixels de large, 1 080 pixels de haut
- **2560×1440** : 2 560 pixels de large, 1 440 pixels de haut
- **3840×2160** : 3 840 pixels de large, 2 160 pixels de haut (4K)

### Noms courants des résolutions

**HD (Haute Définition)** :
- **720p** : 1280×720 — HD de base, anciens moniteurs
- **1080p (Full HD)** : 1920×1080 — la plus courante, bon équilibre
- **1080p Ultrawide** : 2560×1080 — format ultra-large

**QHD (Quad HD)** :
- **1440p** : 2560×1440 — gaming haut de gamme et productivité
- **1440p Ultrawide** : 3440×1440 — ultra-large premium

**UHD (Ultra HD)** :
- **4K** : 3840×2160 — moniteurs et TV premium
- **5K** : 5120×2880 — Apple Studio Display, haut de gamme
- **8K** : 7680×4320 — écrans de pointe

### Ratios d'aspect

**16:9 (écran large)** — le plus courant :
- 1920×1080, 2560×1440, 3840×2160
- Idéal pour : jeux, vidéo, usage général

**21:9 (ultra-large)** :
- 2560×1080, 3440×1440
- Idéal pour : productivité, jeux immersifs, montage vidéo

**16:10 (un peu plus haut)** :
- 1920×1200, 2560×1600
- Idéal pour : travail professionnel, programmation, documents

**3:2 (plus haut)** :
- 2160×1440, 2880×1920
- Idéal pour : documents, navigation web (portables Surface)

**4:3 (traditionnel)** :
- 1024×768, 1600×1200
- Présent sur : anciens moniteurs, certains écrans professionnels

---

## Méthode 1 : vérifier la résolution sous Windows

### Windows 11

**Via les paramètres (recommandé)** :
1. **Clic droit** sur le bureau
2. Sélectionnez **Paramètres d'affichage**
3. Votre résolution s'affiche sous **Résolution d'affichage**
4. Note : affiche la résolution actuelle, pas la maximale

**Via les paramètres avancés** :
1. **Clic droit** sur le bureau → **Paramètres d'affichage**
2. Descendez et cliquez sur **Affichage avancé**
3. Consultez la **résolution actuelle** et la **résolution maximale**
4. Voyez le taux de rafraîchissement et les infos couleur

### Windows 10

**Via les paramètres** :
1. **Clic droit** sur le bureau
2. Sélectionnez **Paramètres d'affichage**
3. La résolution s'affiche sous **Résolution d'affichage**
4. Cliquez sur le menu déroulant pour voir toutes les résolutions disponibles

**Via les informations système** :
1. Appuyez sur **Windows + R**
2. Tapez `msinfo32` et appuyez sur Entrée
3. Allez dans **Composants** → **Affichage**
4. Consultez la **résolution actuelle** dans le panneau de droite

### Ligne de commande Windows

**Avec PowerShell** :
```powershell
# Obtenir la résolution d'affichage
Get-WmiObject -Class Win32_VideoController | Select-Object CurrentHorizontalResolution, CurrentVerticalResolution

# Méthode alternative
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Screen]::PrimaryScreen.Bounds
```

**Avec l'invite de commandes** :
```cmd
wmic desktopmonitor get screenheight, screenwidth
```

---

## Méthode 2 : vérifier la résolution sur Mac

### macOS (toutes versions)

**Via les Préférences Système** :
1. Cliquez sur le **menu Apple**
2. Sélectionnez **Préférences Système** (ancien) ou **Réglages Système** (récent)
3. Cliquez sur **Écrans**
4. La résolution s'affiche à côté de **Résolution**

**Via À propos de ce Mac** :
1. **Menu Apple** → **À propos de ce Mac**
2. Cliquez sur **Écrans** (si disponible)
3. Consultez les informations de résolution

**Via le Terminal** :
```bash
# Résolution actuelle
system_profiler SPDisplaysDataType | grep Resolution

# Infos détaillées
system_profiler SPDisplaysDataType
```

---

## Méthode 3 : vérifier la résolution sous Linux

### Via l'interface graphique (Ubuntu/GNOME)

1. Ouvrez **Paramètres**
2. Allez dans **Écrans** ou **Affichage**
3. Consultez le réglage **Résolution**
4. Voyez tous les moniteurs connectés

**KDE Plasma** :
1. Ouvrez **Configuration du système**
2. Allez dans **Affichage et moniteur**
3. Consultez la **résolution** de chaque écran

### Ligne de commande (Linux)

**Avec xrandr (le plus courant)** :
```bash
# Voir tous les écrans et résolutions
xrandr

# Résolution actuelle uniquement
xrandr | grep '*'

# Infos détaillées
xrandr --query
```

**Avec xdpyinfo** :
```bash
# Dimensions de l'écran
xdpyinfo | grep dimensions
```

---

## Méthode 4 : vérifier la résolution sur mobile

### Android

**Via les paramètres** :
1. Ouvrez **Paramètres**
2. Allez dans **Affichage** ou **Écran**
3. Cherchez **Résolution d'écran** ou **Taille d'affichage**
4. Peut s'afficher sous forme de préréglages (HD+, FHD+, QHD+)

**Via À propos du téléphone** :
1. **Paramètres** → **À propos du téléphone**
2. Cherchez les informations **Affichage**

### iPhone/iPad (iOS)

**Via les réglages** :
1. **Réglages** → **Luminosité et affichage**
2. La résolution n'est pas affichée directement
3. Vérifiez le **Zoom de l'écran** pour les options de mise à l'échelle

**Résolutions iOS courantes** :
- **iPhone 14 Pro Max** : 2796×1290
- **iPhone 14/14 Pro** : 2556×1179, 2796×1290
- **iPhone SE** : 1334×750
- **iPad Pro 12,9"** : 2732×2048
- **iPad Air** : 2360×1640

---

## Méthode 5 : utiliser notre outil en ligne

### Outil Screen Size Checker

Notre [Screen Size Checker](/fr/) détecte votre résolution instantanément avec des informations complémentaires.

**Ce que vous verrez** :
- **Résolution actuelle** : largeur × hauteur exactes
- **Taille du viewport** : zone d'affichage du navigateur
- **Device pixel ratio** : multiplicateur de densité d'écran
- **Diagonale d'écran** : estimation de la taille physique
- **Ratio d'aspect** : rapport largeur/hauteur

**Fonctions supplémentaires** :
- **Test responsive** : voyez comment votre écran gère différentes tailles
- **Calcul PPI** : pixels par pouce de votre écran
- **Outil de comparaison** : comparaison visuelle avec d'autres résolutions

**Comment ça marche** :
1. Visitez [screensizechecker.com](/fr/)
2. Les informations s'affichent automatiquement
3. Aucun téléchargement ni installation
4. Fonctionne sur tout appareil avec un navigateur

---

## Résolutions d'écran courantes expliquées

### Résolutions bureau/moniteur

| Résolution | Nom | Ratio | Usages |
|------------|-----|-------|--------|
| 1366×768 | HD | 16:9 | Portables entrée de gamme, anciens moniteurs |
| 1920×1080 | Full HD/1080p | 16:9 | La plus courante, jeux, usage général |
| 1920×1200 | WUXGA | 16:10 | Moniteurs professionnels |
| 2560×1080 | UW-FHD | 21:9 | Ultra-large gaming, productivité |
| 2560×1440 | QHD/1440p | 16:9 | Gaming haut de gamme, professionnel |
| 3440×1440 | UW-QHD | 21:9 | Ultra-large premium |
| 3840×2160 | 4K UHD | 16:9 | Moniteurs haut de gamme, création |
| 5120×2880 | 5K | 16:9 | Apple Studio Display, pro |

### Résolutions portable

**Portables 13"-14"** :
- **1366×768** : modèles entrée de gamme
- **1920×1080** : standard, bon équilibre
- **2560×1600** : ultrabooks premium (16:10)

**Portables 15"-17"** :
- **1920×1080** : la plus courante, bonne pour le gaming
- **2560×1440** : portables gaming haut de gamme
- **3840×2160** : portables 4K, création de contenu

### Résolutions mobile

**Smartphones courants** :
- **iPhone** : 1170×2532 (iPhone 13/14), 1284×2778 (modèles Pro)
- **Samsung Galaxy** : 1080×2340 (S23), 1440×3088 (S23+)
- **Google Pixel** : 1080×2400 (Pixel 7), 1440×3120 (Pixel 7 Pro)

**Tablettes** :
- **iPad** : 2048×2732 (iPad Pro 12,9"), 1620×2160 (iPad Air)
- **Android** : 1200×2000 (Galaxy Tab), variable selon le fabricant

---

## Résolution vs taille d'écran vs densité de pixels

### Comprendre la relation

**Résolution d'écran** : nombre de pixels (1920×1080)
**Taille d'écran** : mesure physique en diagonale (24 pouces)
**Densité de pixels (PPI)** : pixels par pouce (netteté de l'affichage)

### Calculer le PPI

**Formule** :
```
PPI = √(largeur² + hauteur²) / diagonale_en_pouces
```

**Exemples** :
- **Moniteur 24" 1080p** : ~92 PPI
- **Moniteur 27" 1440p** : ~109 PPI
- **Portable 15" en 1080p** : ~147 PPI
- **iPhone 14** : ~460 PPI

### Ce que le PPI signifie

**PPI faible (72-100)** : grands moniteurs de bureau, pixels visibles de près
**PPI moyen (100-150)** : la plupart des portables, texte net à distance normale
**PPI élevé (150-300)** : portables et tablettes haut de gamme, très net
**PPI très élevé (300+)** : smartphones, qualité "Retina", pixels invisibles

---

## Résolution de problèmes

### Ma résolution semble incorrecte

**Causes courantes** :
1. **Pilotes d'affichage incorrects** : mettez à jour vos pilotes graphiques
2. **Pilotes génériques** : installez les pilotes du fabricant
3. **Limitations du câble** : HDMI/VGA peut limiter la résolution
4. **Problèmes de mise à l'échelle** : vérifiez les paramètres de scaling

**Solutions** :
- Mettez à jour les pilotes (site NVIDIA, AMD ou Intel)
- Vérifiez les câbles : utilisez DisplayPort ou la bonne version HDMI
- Remettez la résolution native/recommandée
- Redémarrez après les changements

### Options de résolution manquantes

**Raisons possibles** :
1. Pilotes graphiques mal installés
2. Type de connexion limitant (VGA/ancien HDMI)
3. Moniteur non détecté correctement
4. Carte graphique ne supportant pas la résolution

**Solutions** :
- Réinstallez les pilotes d'affichage
- Essayez un autre câble ou type de connexion
- Ajoutez manuellement une résolution personnalisée (utilisateurs avancés)
- Vérifiez la résolution maximale supportée par votre moniteur

### Affichage flou

**Causes courantes** :
1. Résolution non native
2. Mauvais réglage de mise à l'échelle DPI
3. Câble de mauvaise qualité ou endommagé
4. Réglages du moniteur incorrects

**Solutions** :
- Utilisez la résolution native de votre moniteur
- Ajustez la mise à l'échelle : 100 %, 125 %, 150 %
- Mettez à jour les pilotes graphiques
- Réinitialisez les réglages du moniteur par défaut

### Problèmes avec plusieurs écrans

**Problèmes courants** :
1. Résolutions différentes entre moniteurs
2. Mise à l'échelle incohérente
3. Mauvais écran défini comme principal
4. Alignement incorrect entre les écrans

**Solutions** :
- Harmonisez les résolutions quand c'est possible
- Réglez la mise à l'échelle individuellement par moniteur
- Arrangez correctement les écrans dans les paramètres
- Utilisez des outils comme DisplayFusion pour une gestion avancée

---

## Régler sa résolution au mieux

### Choisir la bonne résolution

**Pour le gaming** :
- **1080p** : meilleures performances, taux d'images élevé
- **1440p** : bon équilibre qualité/performances
- **4K** : qualité visuelle maximale, GPU puissant requis

**Pour la productivité** :
- **Résolution élevée** : plus d'espace d'écran
- **Pensez à la mise à l'échelle** : 125-150 % pour un texte confortable
- **Multi-écrans** : des résolutions différentes fonctionnent avec un bon réglage

**Pour la création de contenu** :
- **4K** : montage vidéo, retouche photo
- **Bonne fidélité des couleurs** : dalles IPS, gamut large
- **Mise à l'échelle cohérente** : important pour le design

### Résolution et performances

**Impact sur les performances en jeu** :
- **1080p → 1440p** : ~30-40 % de baisse de performances
- **1440p → 4K** : ~50-60 % de baisse de performances
- **Ultra-large** : ~20-30 % plus exigeant que le format standard

**Configuration requise** :
- **Gaming 1080p** : GPU milieu de gamme (RTX 3060, RX 6600)
- **Gaming 1440p** : GPU haut de gamme (RTX 3070+, RX 6700 XT+)
- **Gaming 4K** : GPU premium (RTX 3080+, RX 6800 XT+)

---

## Questions fréquentes

### Comment savoir quelle résolution mon moniteur supporte ?

Consultez les **caractéristiques de votre moniteur** dans le manuel ou sur le site du fabricant. La plupart des moniteurs affichent leur **résolution native** dans le nom du produit (ex. : "Moniteur 24 pouces 1080p"). Vous pouvez aussi vérifier dans les **Paramètres d'affichage** Windows ou les **Préférences Système** Mac où toutes les résolutions supportées sont listées.

### Quelle différence entre résolution et taille d'écran ?

La **résolution** est le nombre de pixels (ex. : 1920×1080), la **taille d'écran** est la mesure physique en diagonale (ex. : 24"). La même résolution sur des écrans de tailles différentes donne un rendu différent — un écran 1080p de portable est bien plus net qu'un TV 1080p car les pixels sont plus serrés (PPI plus élevé).

### Faut-il toujours utiliser la résolution maximale ?

En général **oui**, utilisez la **résolution native** de votre moniteur pour l'image la plus nette. Mais pensez aux performances : une résolution plus élevée demande plus de puissance GPU pour les jeux et peut rendre le texte très petit, ce qui nécessite d'ajuster la mise à l'échelle.

### Pourquoi mon écran 4K est flou sous Windows ?

C'est souvent un **problème de mise à l'échelle**. Un écran 4K à 100 % rend tout minuscule, donc Windows met automatiquement à l'échelle à 150-200 %. Certaines anciennes applications gèrent mal cette mise à l'échelle. Ajustez la mise à l'échelle dans les Paramètres d'affichage ou activez **"Corriger la mise à l'échelle des applications"**.

### Peut-on utiliser des résolutions différentes sur plusieurs écrans ?

**Oui**, les systèmes d'exploitation modernes gèrent bien les résolutions différentes. Le **mouvement de la souris** entre les écrans peut sembler incohérent et le **glisser-déposer de fenêtres** peut être gênant si les résolutions sont très différentes. Pour un meilleur confort, essayez d'**harmoniser les résolutions** ou au moins les **ratios d'aspect**.

### Quelle résolution pour le streaming ou l'enregistrement ?

Pour le **streaming** : 1080p 60 fps est le plus courant. Utilisez **720p 60 fps** si votre connexion est lente ou **1440p** si vous avez un excellent débit montant. Pour l'**enregistrement** : utilisez votre **résolution native** pour la meilleure qualité, ou 1080p pour une compatibilité plus large et des fichiers plus légers.

### Comment changer la résolution si l'écran est illisible ?

Démarrez en **Mode sans échec** (Windows) ou **Mode de récupération** (Mac) où une résolution basse est utilisée par défaut. Sous Windows, appuyez sur **Windows + P** pour changer de mode d'affichage, ou **Windows + I** pour ouvrir les Paramètres. Sur Mac, réinitialisez la NVRAM/PRAM en maintenant **Option + Commande + P + R** au démarrage.

### Une résolution plus élevée est-elle toujours meilleure ?

Pas forcément. Une résolution plus élevée offre **plus de détails et d'espace** mais demande **plus de puissance GPU**, rend le **texte plus petit** (nécessitant une mise à l'échelle) et produit des **fichiers plus lourds** en création de contenu. La "meilleure" résolution dépend de votre **taille d'écran**, **usage**, **matériel graphique** et **distance de visionnage**.

---

## Outils et ressources

### Nos outils

**Screen Size Checker** : [Détectez votre résolution et les caractéristiques de votre écran](/fr/)
**Calculateur PPI** : [Calculez les pixels par pouce de votre écran](/fr/ppi-calculator)
**Outil de comparaison** : [Comparaison visuelle de résolutions et tailles d'écran](/fr/compare)

### En savoir plus

**Guides associés** :
- [Comment mesurer la taille d'un moniteur](/fr/blog/comment-mesurer-taille-moniteur) — mesure physique de l'écran
- [Comment mesurer l'écran d'un PC portable](/fr/blog/comment-mesurer-ecran-pc-portable) — mesure spécifique aux portables
- [Le Device Pixel Ratio expliqué](/fr/blog/device-pixel-ratio) — comprendre le DPI et la mise à l'échelle

---

## Conclusion

Vérifier la résolution de votre écran est simple avec les nombreuses méthodes disponibles sur toutes les plateformes. Que vous passiez par les paramètres système, la ligne de commande ou un outil en ligne comme notre Screen Size Checker, vous pouvez trouver rapidement les caractéristiques de votre écran.

**Points à retenir** :
- **Clic droit sur le bureau** → **Paramètres d'affichage** est la méthode la plus rapide
- Utilisez la **résolution native** pour l'image la plus nette
- Pensez à la **mise à l'échelle** pour un confort de lecture sur les écrans haute résolution
- **Mettez à jour les pilotes graphiques** si des options de résolution manquent
- **Harmonisez les résolutions** autant que possible en configuration multi-écrans

Comprendre votre résolution vous aide à tirer le meilleur de votre affichage, améliorer les performances en jeu et prendre de bonnes décisions pour vos achats de moniteurs.

**Besoin d'aide pour d'autres caractéristiques d'écran ?** Utilisez notre [outil Screen Size Checker](/fr/) pour découvrir votre résolution, densité de pixels et plus encore.

---

*Dernière mise à jour : janvier 2025*
