---
title: "CSS Media Queries em 2026: guia base"
description: "Aprenda a usar CSS media queries melhor: escolher breakpoints úteis, entender min-width vs max-width e evitar erros comuns de layout responsivo."
date: "2026-03-31"
author: "Equipe Screen Size Checker"
category: "css"
tags: ["media-queries", "design-responsivo", "css", "breakpoints"]
featuredImage: "media-queries.jpg"
slug: "fundamentos-media-queries"
keywords: "css media queries, breakpoints responsivos, min width max width, design responsivo css, media queries guia"
---

# CSS Media Queries em 2026: guia básico

Media queries continuam sendo uma das ferramentas mais importantes do CSS responsivo. Elas permitem ajustar layout, tipografia e espaçamento de acordo com largura, altura, orientação e outras condições reais do dispositivo.`r`n`r`n**Resposta rápida**: uma media query aplica estilos CSS apenas quando uma condição específica é atendida — por exemplo, viewport menor que 768px ou tela em modo paisagem. É assim que um layout muda de forma controlada entre celular, tablet e desktop.

## O Que São Media Queries?

Media queries são técnicas CSS que permitem aplicar diferentes estilos com base nas características do dispositivo, como tamanho da tela, resolução ou orientação. Elas são definidas usando a regra `@media` no CSS:

```css
@media screen and (max-width: 768px) {
  /* Estilos aplicados quando a largura do viewport é 768px ou menos */
  .container {
    flex-direction: column;
  }
}
```

Esse conceito simples alimenta o comportamento responsivo dos sites modernos, permitindo que eles forneçam experiências otimizadas em todos os dispositivos.

## Anatomia de uma Media Query

Uma media query típica consiste em:

1. **Tipo de Mídia**: Especifica o tipo de dispositivo (ex: `screen`, `print`, `speech`)
2. **Operadores Lógicos**: `and`, `not`, `only`, e vírgulas para combinar múltiplas consultas
3. **Recursos de Mídia**: Condições como `width`, `height`, `orientation`, etc.
4. **Regras CSS**: Os estilos a aplicar quando as condições são atendidas

```css
@media screen and (min-width: 768px) and (max-width: 1024px) {
  /* Estilos para tablets e laptops pequenos */
}
```

## Recursos de Mídia Comuns

Aqui estão os recursos de mídia mais frequentemente usados:

| Recurso | Descrição | Exemplo |
|---------|-------------|---------|
| `width` | Largura do viewport | `(min-width: 768px)` |
| `height` | Altura do viewport | `(max-height: 1024px)` |
| `aspect-ratio` | Razão largura/altura | `(aspect-ratio: 16/9)` |
| `orientation` | Retrato ou paisagem | `(orientation: landscape)` |
| `resolution` | Densidade de pixels | `(min-resolution: 2dppx)` |
| `hover` | Capacidade de hover | `(hover: hover)` |
| `prefers-color-scheme` | Preferência de cor do usuário | `(prefers-color-scheme: dark)` |

## Estratégias de Breakpoint

Breakpoints são as larguras de viewport nas quais seu design se adapta. Existem várias abordagens para escolher breakpoints:

### 1. Breakpoints baseados em dispositivos

Baseado em categorias de dispositivos comuns:
- Celulares: 360px - 428px
- Tablets: 768px - 1024px
- Laptops: 1024px - 1440px
- Desktops: 1440px+

```css
/* Estilos mobile (padrão) */
.container { width: 100%; }

/* Estilos tablet */
@media (min-width: 768px) {
  .container { width: 750px; }
}

/* Estilos laptop */
@media (min-width: 1024px) {
  .container { width: 980px; }
}

/* Estilos desktop */
@media (min-width: 1440px) {
  .container { width: 1200px; }
}
```

### 2. Breakpoints baseados em conteúdo

Uma abordagem mais flexível que se adapta com base em quando seu conteúdo começa a parecer quebrado:

```css
.article-grid {
  display: grid;
  grid-template-columns: 1fr;
}

/* Quando há espaço suficiente para 2 colunas */
@media (min-width: 600px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Quando há espaço suficiente para 3 colunas */
@media (min-width: 900px) {
  .article-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Mobile-First vs. Desktop-First

Existem duas abordagens principais para implementar media queries:

### Abordagem Mobile-First

Comece com estilos para telas pequenas e adicione complexidade para telas maiores usando consultas `min-width`:

```css
/* Estilos base para mobile */
.navigation {
  flex-direction: column;
}

/* Melhorar para telas maiores */
@media (min-width: 768px) {
  .navigation {
    flex-direction: row;
  }
}
```

### Abordagem Desktop-First

Comece com estilos para telas grandes e simplifique para telas menores usando consultas `max-width`:

```css
/* Estilos base para desktop */
.navigation {
  flex-direction: row;
}

/* Simplificar para telas menores */
@media (max-width: 767px) {
  .navigation {
    flex-direction: column;
  }
}
```

A maioria do desenvolvimento moderno favorece a abordagem mobile-first por sua filosofia de melhoria progressiva e código tipicamente mais limpo.

## Técnicas Avançadas de Media Query

### 1. Consultas de Faixa (Range Queries)

Alvo de uma faixa específica de tamanhos de viewport:

```css
@media (min-width: 768px) and (max-width: 1023px) {
  /* Estilos apenas para tablets */
}
```

### 2. Consultas de Orientação

Aplicar estilos com base na orientação do dispositivo:

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

### 3. Consultas de Recurso com `@supports`

Combine media queries com detecção de recursos:

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

### 4. Container Queries (Novo!)

O futuro do design responsivo, permitindo estilos com base no tamanho do container em vez do viewport:

```css
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

Nota: As container queries ainda estão sendo implementadas nos navegadores, então verifique a compatibilidade antes de usá-las.

## Casos de Uso Comuns de Media Query

### Menus de Navegação

```css
/* Mobile: Menu hambúrguer */
.nav-menu {
  display: none;
}

.hamburger-icon {
  display: block;
}

/* Desktop: Menu expandido */
@media (min-width: 1024px) {
  .nav-menu {
    display: flex;
  }
  
  .hamburger-icon {
    display: none;
  }
}
```

### Layouts de Grid

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

### Tipografia

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

## Testando Media Queries

Testar adequadamente suas media queries é crucial para garantir que seu design responsivo funcione conforme o esperado:

1. **Ferramentas de Desenvolvedor do Navegador**: Use o modo responsivo para redimensionar o viewport
2. **Dispositivos Reais**: Teste em telefones, tablets e computadores reais
3. **Ferramenta Screen Size Checker**: Use nosso [Verificador de Tamanho de Tela]({{lang_prefix}}/) para verificar as dimensões do seu viewport e testar como seu design responde

## Conclusão

Media queries são uma ferramenta essencial para criar sites modernos e responsivos. Ao entender como estruturá-las e implementá-las de forma eficaz, você pode garantir que seu site ofereça uma experiência ideal em todos os dispositivos e tamanhos de tela.

Lembre-se de que o design responsivo é mais do que apenas fazer elementos caberem em telas diferentes — é sobre criar uma experiência de usuário coesa, independentemente de como alguém acessa seu conteúdo.

Para mais tópicos relacionados, confira nossos artigos sobre [Noções Básicas de Viewport]({{lang_prefix}}/blog/viewport-basics) e [Proporção de Pixels do Dispositivo]({{lang_prefix}}/blog/device-pixel-ratio).
