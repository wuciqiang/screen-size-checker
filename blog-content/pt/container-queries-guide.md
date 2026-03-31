---
title: "CSS Container Queries em 2026: guia e exemplos"
description: "Aprenda CSS Container Queries com sintaxe, exemplos, compatibilidade e padrões práticos para criar componentes realmente responsivos."
date: "2026-03-31"
author: "Equipe Screen Size Checker"
category: "css"
tags: ["css", "design-responsivo", "container-queries", "desenvolvimento-web", "frontend"]
featured: true
readingTime: "12 min de leitura"
slug: "guia-css-container-queries"
keywords: "css container queries, guia container queries, exemplos container queries, componentes responsivos css, compatibilidade container queries"
---

# CSS Container Queries em 2026: guia e exemplos

Por anos, o design web responsivo dependeu de media queries para adaptar layouts a diferentes tamanhos de tela. Mas o que acontece quando você precisa que um componente responda ao tamanho do próprio container, e não ao viewport? Em 2026, CSS Container Queries já fazem parte do toolkit moderno para criar componentes realmente reutilizáveis.

**Resposta Rápida**: Use `container-type: inline-size` no elemento pai e escreva regras `@container` para adaptar o componente ao espaço disponível. Em 2026, container queries já são uma solução prática para cards, sidebars, grids, widgets e blocos reutilizáveis.

## Por Que Precisávamos Desesperadamente de Container Queries

Imagine isto: Você construiu um componente de cartão bonito que parece perfeito no desktop. Ele tem uma imagem à esquerda, conteúdo à direita e tudo está bem equilibrado. Agora você precisa usar esse mesmo componente em uma barra lateral estreita. Com media queries, você está preso — o componente só conhece a largura do viewport, não seu espaço real disponível.

```css
/* A maneira antiga com media queries - problemática */
@media (min-width: 768px) {
  .card {
    display: flex;
  }
}
/* Mas e se este cartão estiver em uma barra lateral de 300px em uma tela de 1920px? */
```

Essa limitação fundamental atormentou os desenvolvedores por anos, levando a componentes duplicados, convenções de nomenclatura complexas e pesadelos de manutenção. As container queries resolvem isso elegantemente, permitindo que os componentes respondam ao tamanho de seu container.

## Entendendo Container Queries: O Básico

### O Que São Exatamente as Container Queries?

As container queries permitem que elementos adaptem seus estilos com base no tamanho de seu elemento pai (container), em vez do viewport. Isso significa que um componente pode ser verdadeiramente independente e responsivo, independentemente de onde for colocado em seu layout.

**Diferenças Chave das Media Queries:**
- **Media Queries**: Respondem às características do viewport/dispositivo
- **Container Queries**: Respondem às dimensões do container pai
- **Escopo**: Media queries são globais, container queries são escopadas para containers específicos

### Suporte do Navegador em 2026

Boas notícias: em 2026, container queries já têm suporte sólido nos principais navegadores modernos:

| Navegador | Versão | Suporte |
|---------|---------|---------|
| Chrome | 105+ | ✅ Suporte Total |
| Firefox | 110+ | ✅ Suporte Total |
| Safari | 16+ | ✅ Suporte Total |
| Edge | 105+ | ✅ Suporte Total |

Com mais de 90% dos usuários agora em navegadores suportados, as container queries estão prontas para produção na maioria dos projetos.

### Sintaxe Básica e Configuração

```css
/* Passo 1: Definir um container */
.card-wrapper {
  container-type: inline-size;
  /* ou */
  container: card / inline-size; /* com um nome */
}

/* Passo 2: Consultar o container */
@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 1rem;
  }
}

/* Ou consultar um container nomeado */
@container card (min-width: 400px) {
  .card-title {
    font-size: 2rem;
  }
}
```

## Aplicações e Exemplos do Mundo Real

### Exemplo 1: Componente de Cartão Adaptativo

Vamos construir um componente de cartão que se adapta inteligentemente ao seu espaço disponível:

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

/* Container estreito: Empilhar verticalmente */
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

/* Container médio: Lado a lado com imagem pequena */
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

/* Container grande: Layout espaçoso */
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

### Exemplo 2: Menu de Navegação Responsivo

Container queries são excelentes para criar componentes de navegação que se adaptam ao espaço disponível:

```css
.nav-container {
  container-type: inline-size;
}

.nav-menu {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

/* Menu estilo mobile em containers estreitos */
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

/* Menu horizontal com dropdowns em containers mais largos */
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

### Exemplo 3: Layouts de Grid Dinâmicos

Crie grids que se ajustam com base na largura do container, não do viewport:

```css
.grid-container {
  container-type: inline-size;
}

.product-grid {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

/* Uma coluna para containers estreitos */
@container (width < 400px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

/* Duas colunas para containers médios */
@container (400px <= width < 800px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Três colunas para containers largos */
@container (width >= 800px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Quatro colunas para containers extra largos */
@container (width >= 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Técnicas Avançadas e Unidades de Container

### Unidades de Container Query

As container queries introduzem novas unidades CSS que são relativas às dimensões do container:

- **cqw**: 1% da largura do container
- **cqh**: 1% da altura do container
- **cqi**: 1% do tamanho inline do container
- **cqb**: 1% do tamanho de bloco do container
- **cqmin**: O menor valor entre cqi ou cqb
- **cqmax**: O maior valor entre cqi ou cqb

```css
.responsive-text {
  container-type: inline-size;
}

.responsive-text h2 {
  /* Tamanho da fonte escala com a largura do container */
  font-size: clamp(1.5rem, 5cqi, 3rem);
  
  /* Padding relativo ao container */
  padding: 2cqi 4cqi;
}

.responsive-text p {
  /* Altura da linha que se adapta ao container */
  font-size: clamp(0.875rem, 2cqi, 1.125rem);
  line-height: 1.6;
  
  /* Margem que escala com o container */
  margin-bottom: 3cqb;
}
```

### Combinando Container e Media Queries

Para a melhor experiência responsiva, combine ambas as abordagens:

```css
.article-layout {
  container-type: inline-size;
}

/* Estilos base mobile-first */
.article-content {
  padding: 1rem;
}

/* Responder ao viewport para grandes mudanças de layout */
@media (min-width: 1024px) {
  .article-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
}

/* Ajuste fino baseado no tamanho real do container */
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

Olhando para o futuro, style queries permitem consultar propriedades personalizadas:

```css
/* Sintaxe futura - ainda com suporte limitado em 2026 */
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

## Testando Container Queries com Ferramentas de Tamanho de Tela

Para testar efetivamente suas container queries, você precisa das ferramentas certas. Nosso [Testador de Design Responsivo]({{lang_prefix}}/devices/responsive-tester) é perfeito para isso:

1. **Teste Diferentes Tamanhos de Container**: Use o recurso de arrastar para redimensionar para ver como seus componentes respondem a várias larguras de container
2. **Predefinições de Dispositivo**: Verifique como os containers se comportam dentro de diferentes viewports de dispositivos
3. **Atualizações em Tempo Real**: Veja suas container queries dispararem enquanto você redimensiona

Para calcular breakpoints ideais com base no conteúdo, nossa [Calculadora de Proporção]({{lang_prefix}}/devices/aspect-ratio-calculator) ajuda a determinar as melhores dimensões de container para seus layouts.

## Considerações de Desempenho

### Melhores Práticas para Desempenho

1. **Evite Aninhamento Profundo**
```css
/* Evite */
.container1 { container-type: inline-size; }
  .container2 { container-type: inline-size; }
    .container3 { container-type: inline-size; }

/* Melhor */
.component-container { container-type: inline-size; }
```

2. **Use Contenção com Sabedoria**
```css
/* Apenas defina container-type onde necessário */
.card-grid {
  /* Nenhum container-type necessário aqui */
}

.card-wrapper {
  container-type: inline-size; /* Apenas no pai direto */
}
```

3. **Otimize Condições de Consulta**
```css
/* Use combinações lógicas eficientemente */
@container (400px <= width < 800px) {
  /* Estilos para containers médios */
}

/* Evite consultas redundantes */
@container (min-width: 400px) and (max-width: 799px) {
  /* Mesmo que acima, mas mais verboso */
}
```

### Métricas de Desempenho

As container queries têm impacto mínimo no desempenho quando usadas corretamente:
- **Tempo de pintura**: aumento de ~2-5% com uso intenso
- **Recálculo de layout**: Semelhante às media queries
- **Uso de memória**: Aumento insignificante

## Estratégia de Migração: De Media Queries para Container Queries

### Passo 1: Audite Seus Estilos Atuais

Identifique componentes que se beneficiariam de container queries:
```javascript
// Componentes que aparecem em múltiplos contextos
const candidateComponents = [
  'cards',
  'menus de navegação',
  'barras laterais',
  'tabelas de dados',
  'layouts de formulário',
  'galerias de imagens'
];
```

### Passo 2: Abordagem de Melhoria Progressiva

```css
/* Estilos base que funcionam em todos os lugares */
.card {
  padding: 1rem;
  background: white;
}

/* Fallback com media queries */
@media (min-width: 768px) {
  @supports not (container-type: inline-size) {
    .card {
      display: flex;
    }
  }
}

/* Container queries modernas */
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

### Passo 3: Teste e Validação

Use detecção de recursos para garantir compatibilidade:
```javascript
// Detecção de recursos JavaScript
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

## Armadilhas Comuns e Como Evitá-las

### Armadilha 1: Esquecer de Definir Container Type
```css
/* Não funcionará - nenhum container-type definido */
@container (min-width: 400px) {
  .card { display: flex; }
}

/* Corrigido */
.card-wrapper {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card { display: flex; }
}
```

### Armadilha 2: Container Type no Elemento Errado
```css
/* Errado - container-type no elemento sendo estilizado */
.card {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card { /* Isso não funcionará */ }
}

/* Certo - container-type no pai */
.card-wrapper {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card { /* Isso funciona */ }
}
```

### Armadilha 3: Nomes de Container Conflitantes
```css
/* Cuidado com a nomenclatura */
.outer {
  container: layout / inline-size;
}
.inner {
  container: layout / inline-size; /* Mesmo nome - confuso */
}

/* Melhor - use nomes únicos */
.outer {
  container: outer-layout / inline-size;
}
.inner {
  container: inner-layout / inline-size;
}
```

## Exemplo de Implementação de Projeto Real

Vamos implementar um painel responsivo completo que mostra container queries em ação:

```css
/* Layout do Dashboard */
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Container da barra lateral */
.sidebar {
  container-type: inline-size;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

/* Área de conteúdo principal */
.main-content {
  container-type: inline-size;
}

/* Containers de widget */
.widget {
  container-type: inline-size;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Navegação da barra lateral adapta-se à largura da barra lateral */
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

/* Widgets adaptam-se ao seu container */
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

/* Tabela responsiva dentro de widgets */
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
    display: none; /* Esconder colunas menos importantes */
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

## O Futuro das Container Queries

### O Que Vem Por Aí?

1. **Style Queries**: Consultar qualquer propriedade CSS, não apenas tamanho
2. **Unidades de Comprimento de Container Query em Cálculos**: Cálculos mais complexos com unidades cq
3. **DevTools Melhorados**: Melhores ferramentas de depuração e visualização
4. **Integração com Frameworks**: Melhor suporte em bibliotecas CSS-in-JS

### Container Queries + CSS Moderno

As container queries funcionam lindamente com outros recursos CSS modernos:

```css
/* Com CSS Grid */
.grid-container {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

/* Com Cascade Layers */
@layer components {
  @container (min-width: 400px) {
    .card { display: flex; }
  }
}

/* Com Propriedades Personalizadas */
.theme-aware {
  container-type: inline-size;
  --spacing: 1rem;
}

@container (min-width: 600px) {
  .theme-aware {
    --spacing: 2rem;
  }
}

/* Com seletor :has() */
.dynamic-container:has(.special-content) {
  container-type: inline-size;
}
```

## Exercício Prático: Tente Você Mesmo

Aqui está um desafio para testar seu entendimento:

**Desafio**: Crie um componente de postagem de blog responsivo que:
1. Mostra apenas o título e o resumo em containers abaixo de 300px
2. Adiciona uma imagem em miniatura entre 300px e 500px
3. Mostra conteúdo completo com uma grande imagem de destaque acima de 500px
4. Ajusta a tipografia com base na largura do container

**Código Inicial**:
```css
.blog-post-container {
  /* Adicione configuração de container query */
}

.blog-post {
  /* Estilos base */
}

/* Adicione suas container queries aqui */
```

Teste sua solução usando nosso [Testador de Design Responsivo]({{lang_prefix}}/devices/responsive-tester) para ver como ele se comporta em diferentes tamanhos de container!

## Conclusão: A Revolução das Container Queries

As container queries representam uma mudança fundamental na forma como abordamos o design responsivo. Elas permitem componentes verdadeiramente modulares e conscientes do contexto que se adaptam inteligentemente ao seu ambiente.

### Principais Aprendizados:
- **Container queries** tornam os componentes verdadeiramente reutilizáveis e conscientes do contexto
- **Suporte do navegador** agora é suficiente para uso em produção (cobertura de 90%+)
- **Impacto no desempenho** é mínimo quando usado corretamente
- **Migração** pode ser feita progressivamente com fallbacks adequados
- **Recursos futuros** as tornarão ainda mais poderosas

### Próximos Passos:
1. Comece a experimentar com container queries em novos componentes
2. Identifique componentes existentes que se beneficiariam da migração
3. Use nossas [ferramentas do Screen Size Checker]({{lang_prefix}}/) para testar suas implementações
4. Mantenha-se atualizado sobre novos desenvolvimentos em style queries e unidades de container

A era dos componentes verdadeiramente responsivos chegou. Container queries não são apenas um novo recurso — são uma nova maneira de pensar sobre design web. Comece a usá-las hoje, e seu eu futuro (e sua equipe) lhe agradecerão.

---

*Última atualização: Março de 2026*

*Quer testar suas container queries em diferentes tamanhos de tela? Tente nosso [Testador de Design Responsivo gratuito]({{lang_prefix}}/devices/responsive-tester) para ver como seus componentes se adaptam em tempo real. Para mais artigos sobre CSS moderno e design responsivo, confira nosso [blog]({{lang_prefix}}/blog/).*
