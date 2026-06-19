---
title: "Android 17 em dobráveis: teste viewport e multijanela"
description: "Teste layouts Android 17 em dobráveis e multijanela com viewports 600/840 CSS px, sem confundir CSS px com Android dp."
date: "2026-06-19"
author: "Equipe Screen Size Checker"
category: "technical"
tags: ["android-17", "foldables", "multi-window", "responsive-design", "viewport", "android"]
featuredImage: ""
---

Durante muito tempo, testar telas Android era fácil de simular: escolher alguns smartphones populares, ajustar o navegador para um viewport estreito em retrato e considerar o layout responsivo como validado.

Isso já não basta. Apps Android e sites móveis hoje são abertos em telefones, tablets, dispositivos dobráveis, janelas do ChromeOS, janelas redimensionáveis com estilo desktop, sessões de tela dividida e monitores externos. Com o Android 17, a direção fica ainda mais clara: os layouts precisam se adaptar ao espaço real que o app ou a página recebe, não ao nome do dispositivo imaginado na fase de design.

Para equipes web, PWA e híbridas, a consequência é a mesma. Uma tela já não é um retângulo fixo. A pergunta útil não é "qual é este dispositivo?", mas "quanto espaço de layout existe agora, qual é a Proporção de Pixels do Dispositivo (DPR) e qual proporção de tela o usuário está vendo?".

Este guia conecta a tendência do Android 17 para telas grandes e janelas redimensionáveis com um fluxo de teste prático para dobráveis (foldables), modo multijanela (multi-window) e as ferramentas do Screen Size Checker.

## Resposta rápida

Para preparar sua UI para o Android 17, teste por tamanho de viewport, não apenas por nome de dispositivo. Cubra pelo menos estes intervalos:

- 320-430 pixels CSS (CSS px) para smartphones Android compactos.
- 600-840 CSS px para telas principais de dobráveis e tablets em retrato.
- 840-1199 CSS px para tablets em paisagem e layouts mais amplos.
- Um cenário dobrável quase quadrado, por exemplo 720 x 720.
- Um cenário em paisagem com pouca altura, por exemplo 844 x 390.
- Pelo menos uma janela de estilo desktop redimensionada livremente.

Primeiro meça em um dispositivo real com o [verificador de tamanho de tela e viewport do Screen Size Checker](https://screensizechecker.com/pt/) o tamanho do viewport, DPR, tamanho de tela reportado pelo navegador e proporção de tela. Depois reproduza os tamanhos críticos no [Responsive Tester para viewports personalizados](https://screensizechecker.com/pt/devices/responsive-tester).

## Por que o Android 17 muda a base de testes

A documentação do Android 17 do Google indica que, para apps direcionados ao Android 17 (nível de API 37) ou superior, as restrições de orientação, redimensionamento e proporção de tela deixam de se aplicar em telas grandes, quando a menor largura disponível é maior que 600 dp (sw600dp e maiores), conforme as exceções oficiais. O Android 17 também remove o opt-out temporário para desenvolvedores que existia no Android 16.

O escopo exato e as exceções, incluindo telas menores que sw600dp, jogos e configurações de proporção de tela escolhidas pelo usuário, devem sempre ser conferidos na documentação oficial. A regra afeta diretamente apps Android nativos e o comportamento associado ao target SDK/API. Para web apps, PWAs e WebViews, ela é principalmente um sinal forte: usuários vão usar com mais frequência janelas Android grandes, divididas e redimensionáveis.

Muitos layouts móveis antigos dependem silenciosamente de suposições como estas:

- O app está sempre em retrato.
- O viewport de telefone é sempre estreito.
- Uma proporção de tela máxima fixa protegerá o layout.
- Um tablet é apenas um telefone maior.
- Um dobrável tem apenas um viewport relevante.

Essas suposições são frágeis em janelas grandes e divididas. As diretrizes do Android para telas grandes levam as equipes a layouts adaptativos que respondem ao tamanho da janela disponível. Isso não afeta apenas equipes Android nativas, mas também web apps, PWAs, WebViews, fluxos de checkout, painéis de conta, portais de suporte e sites responsivos que usuários abrem em ambientes Android redimensionáveis.

Se seu layout quebra quando a largura disponível salta de tamanho de telefone para tamanho de tablet, ou se os controles ficam apertados quando há pouca altura em paisagem, o Android 17 torna essas fragilidades mais fáceis de encontrar pelos usuários.

## Por que dobráveis e multijanela devem ser testados por tamanho de viewport

Um dispositivo Android moderno pode gerar condições de layout muito diferentes:

| Cenário | O que muda | Por que importa |
|---------|------------|-----------------|
| Smartphone em retrato | Viewport CSS estreito, DPR alto, muito espaço vertical | Navegação, controles fixos e formulários precisam de comportamento compacto. |
| Smartphone em paisagem | Mais largura, mas muito menos altura | Pode ser que duas colunas caibam, mas modais, mídia e painéis inferiores podem ficar apertados. |
| Tela externa do dobrável | Muitas vezes estreita e alta | Telas com muito texto, campos de busca e cards podem ficar mais apertados que em smartphones comuns. |
| Tela principal do dobrável | Mais larga, às vezes quase quadrada | Layouts móveis de uma coluna podem parecer vazios, esticados ou pobres em informação. |
| Tablet em retrato | Largura média com mais espaço de leitura | Barras laterais, painéis de detalhe e grids podem começar a fazer sentido. |
| Tablet em paisagem | Largura expandida | Padrões master-detail, layouts multipainel e tabelas de dados passam a ser esperados. |
| Tela dividida | O app recebe apenas parte da tela física | Especificações do dispositivo não bastam; o tamanho da janela é a entrada real. |
| Janela de estilo desktop | Largura e altura podem ser redimensionadas livremente | Usuários criam larguras intermediárias que não aparecem em nenhum preset de dispositivo. |

Por isso, as classes de tamanho de janela do Android (Window Size Classes) se concentram na área de tela disponível para o app. Termos como compact, medium, expanded, large e extra-large são mais úteis para decisões de layout do que rótulos como "phone" ou "tablet", porque o mesmo dispositivo pode mudar de classe ao girar, dobrar, desdobrar, dividir ou redimensionar a tela.

## Antes de escolher breakpoints: meça viewport, DPR e proporção de tela

Para QA responsivo, estes valores são mais úteis que as especificações de marketing do dispositivo:

| Medição | Significado | Utilidade |
|---------|-------------|-----------|
| Tamanho de tela reportado pelo navegador | Dimensões de `screen.width` e `screen.height`, normalmente em pixels CSS | Ajuda a contextualizar o ambiente, mas não substitui a resolução física do painel. |
| Tamanho do viewport | Área disponível em pixels CSS para a página ou superfície do app | Base principal para media queries, breakpoints e reflow. |
| Proporção de Pixels do Dispositivo (DPR) | Pixels físicos por pixel CSS | Explica por que dispositivos com resoluções parecidas podem expor larguras CSS diferentes. |
| Proporção de tela | Relação entre largura e altura | Ajuda a detectar layouts esticados, mídia cortada e painéis desconfortáveis. |
| Orientação e forma da janela | Retrato, paisagem ou forma livre de janela | Revela suposições sobre altura, navegação, teclado e áreas de mídia. |

O erro mais comum é usar a resolução de tela como fonte de breakpoints. Uma tela física de 1440 px de largura ainda pode oferecer apenas cerca de 360-430 CSS px de viewport, dependendo de DPR, UI do navegador, escala do display e configurações do sistema. Em dobráveis, há outra camada de complexidade: a tela externa e a tela principal do mesmo dispositivo podem gerar famílias de viewport completamente diferentes.

Comece pelo comportamento do viewport. Use tamanho de tela reportado, resolução física e DPR depois para explicar qualidade de imagem, renderização em canvas e densidade de pixels.

Importante: o valor de 600 dp da documentação Android pertence ao contexto de layouts Android nativos e regras de plataforma. Os intervalos de 600 e 840 px neste artigo são larguras de teste para layouts web em pixels CSS. Ambos ajudam a levar a sério a área disponível, mas não são uma conversão direta de unidades.

## Matriz de teste para dobráveis Android e multijanela

Use esta matriz como base prática para a preparação para o Android 17. Ela não substitui testes em dispositivos reais, mas evita o erro comum de testar apenas uma largura de smartphone Android.

| Grupo de teste | Intervalo de largura | O que observar |
|----------------|----------------------|----------------|
| Smartphone compacto | 320-374 CSS px | Rótulos longos, formulários de checkout, overflow de navegação, cards de largura fixa. |
| Smartphone Android comum | 375-430 CSS px | Layout móvel padrão, alvos de toque, rodapé fixo. |
| Smartphone em paisagem | 640-932 CSS px de largura com pouca altura | Altura do header, modais, mídia, painéis inferiores, sobreposição do teclado. |
| Dobrável fechado | 320-430 CSS px com proporção de tela alta | Formulários densos, quebra de texto, cards estreitos, barras de busca. |
| Dobrável aberto | 600-840 CSS px, incluindo formas quase quadradas | Espaço vazio, cards esticados, limiares de layout em duas colunas. |
| Tablet em retrato | 600-839 CSS px | Layouts médios, navegação lateral, comprimentos de linha legíveis. |
| Tablet em paisagem | 840-1199 CSS px | Layouts expandidos, tabelas de dados, telas master-detail. |
| Janela de estilo desktop | 500-1600 CSS px, redimensionável livremente | Transições de layout, container queries, overflow de tabelas. |
| Tela dividida | Larguras de meia tela e dois terços | Se o fluxo ainda funciona quando a tela física é grande, mas a janela é pequena. |

Se você puder escolher apenas poucas larguras, teste pelo menos 360, 390, 412, 600, 768, 840 e 1024. Adicione uma largura intermediária redimensionada livremente, como 540 ou 720. A altura deve ser testada separadamente, principalmente para paisagem e modo de tela dividida.

## Reproduzir tamanhos críticos do Android 17 com Screen Size Checker

As ferramentas do Screen Size Checker cobrem as partes principais deste fluxo de trabalho. Use-as nesta ordem.

### 1. Meça primeiro o dispositivo real

Abra o [Screen Size Checker](https://screensizechecker.com/pt/) no dispositivo Android ou no navegador que você quer testar. Anote:

- tamanho do viewport
- tamanho de tela reportado pelo navegador
- Proporção de Pixels do Dispositivo (DPR)
- proporção de tela
- dados do navegador e do sistema operacional

Assim você obtém os valores que seu layout realmente vê, não apenas a resolução anunciada do dispositivo.

### 2. Compare com dispositivos Android comuns

Use a tabela de [tamanhos de viewport Android para dobráveis](https://screensizechecker.com/pt/devices/android-viewport-sizes) para comparar suas medições com dispositivos de referência Google Pixel, Samsung Galaxy, dobráveis, Xiaomi, OPPO, vivo, Honor e outros Android.

Em dobráveis, preste atenção às entradas que separam tela externa e tela principal. O objetivo não é mirar um modelo exato. O objetivo é entender os intervalos de largura, valores de DPR e proporções de tela que seu design precisa suportar com robustez.

### 3. Reproduza o layout no Responsive Tester

Use o [Responsive Tester](https://screensizechecker.com/pt/devices/responsive-tester) para testar sua página em tamanhos de viewport de smartphone, tablet, desktop e personalizados. Observe especialmente:

- se as media queries são acionadas nas larguras esperadas
- se componentes fixos causam overflow
- se cards, tabelas, navegação, menus laterais e modais se reorganizam bem
- se o design também funciona em larguras intermediárias que não têm nome de dispositivo

Para o Android 17, não pare nos presets de smartphone. Adicione larguras personalizadas em torno de 600 px e 840 px, porque muitos layouts adaptativos mudam de estrutura nesses pontos.

### 4. Teste formas, não apenas larguras

Dobráveis e modos multijanela podem criar proporções de tela pouco comuns. Se sua página contém vídeos, gráficos, dashboards, imagens de produto, previews de câmera ou mapas com proporção fixa, use a [calculadora de proporção de tela](https://screensizechecker.com/pt/devices/aspect-ratio-calculator).

Um layout que parece bom em 390 x 844 pode começar a cortar mídia, esticar cards ou deixar barras laterais estreitas demais em 720 x 720 ou 840 x 600.

### 5. Justifique decisões visuais com área disponível

Quando equipes de produto, design e QA discutirem se uma tela deve mudar para duas colunas, use a [ferramenta de comparação de tamanhos de tela](https://screensizechecker.com/pt/devices/compare) para comparar tamanho físico e área útil.

Assim, "parece um tablet" vira uma discussão concreta sobre largura, altura, área e proporção de tela.

## Checklist CSS e QA para Android 17

Use este checklist antes de publicar um layout que usuários Android abrirão em smartphones, dobráveis, tablets ou janelas de estilo desktop:

- Teste abaixo e acima de 600 CSS px.
- Teste pelo menos uma largura expandida a partir de cerca de 840 CSS px.
- Redimensione a janela manualmente em vez de usar apenas presets de dispositivo.
- Teste retrato e paisagem separadamente.
- Teste pouca altura, não apenas pouca largura.
- Evite regras que presumem que um telefone está sempre em retrato.
- Evite lógica por nome de dispositivo, como "se for tablet", quando o tamanho da janela disponível é a base real do layout.
- Use grids fluidos, espaçamento flexível e breakpoints baseados em conteúdo.
- Use container queries para componentes reutilizáveis que podem aparecer em painéis estreitos e largos.
- Defina valores sensatos de `max-width` para linhas longas de texto em layouts expandidos.
- Faça tabelas rolarem, empilharem ou reduzirem colunas antes que estourem.
- Revise modais, menus laterais, rodapés fixos, banners de cookies e botões de ação flutuantes (FAB) com pouca altura.
- Evite que mídia e gráficos sejam esticados ou cortados quando a proporção de tela muda.
- Em apps nativos ou híbridos: verifique se o estado da UI é preservado ao girar, dobrar, desdobrar e redimensionar.

O objetivo não é criar um layout diferente para cada dispositivo Android. O objetivo é fazer cada componente responder ao espaço que realmente recebe.

## Revisão rápida de QA para Android 17

A maioria das equipes pode executar esta revisão em uma sessão de QA:

1. Abra a página em um smartphone Android real e capture o viewport com [Screen Size Checker](https://screensizechecker.com/pt/).
2. Teste o fluxo principal no [Responsive Tester para viewports personalizados](https://screensizechecker.com/pt/devices/responsive-tester) em 360, 390, 412, 600, 768, 840 e 1024 CSS px.
3. Adicione um cenário quase quadrado como 720 x 720.
4. Adicione um cenário em paisagem com pouca altura como 844 x 390.
5. Revise cada etapa do fluxo: navegação, busca, entrada de formulário, checkout ou envio, estados de erro e confirmação.
6. Compare qualquer decisão duvidosa sobre dobrável ou tablet com a tabela de [tamanhos de viewport Android](https://screensizechecker.com/pt/devices/android-viewport-sizes).
7. Documente falhas com tamanho do viewport, DPR e proporção de tela, não apenas com nome de dispositivo.

O último ponto é essencial. "Quebrado no Galaxy Fold" é menos útil que "o resumo do checkout se sobrepõe em 692 x 717 CSS px com DPR 3". O segundo relatório oferece às equipes de design e desenvolvimento uma condição de layout reproduzível.

Se quiser começar rápido, crie no [Responsive Tester](https://screensizechecker.com/pt/devices/responsive-tester) um pequeno conjunto de testes de regressão com 360, 390, 412, 600, 768, 840, 1024, 720 x 720 e 844 x 390.

## Fontes e leituras recomendadas

- [Android 17: restrições de orientação e redimensionamento são ignoradas](https://developer.android.com/about/versions/17/changes/ff-restrictions-ignored)
- [Android Developers: usar Window Size Classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- [Android Developers: oferecer suporte a diferentes tamanhos de tela](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes)
- [Screen Size Checker: tabela Android de tamanhos de viewport](https://screensizechecker.com/pt/devices/android-viewport-sizes)
- [Screen Size Checker: reproduzir layouts no Responsive Tester](https://screensizechecker.com/pt/devices/responsive-tester)
- [Entendendo os fundamentos do viewport](https://screensizechecker.com/pt/blog/viewport-basics)
- [Proporção de Pixels do Dispositivo (DPR) explicada](https://screensizechecker.com/pt/blog/device-pixel-ratio)
- [Fundamentos de Media Queries para Design Responsivo](https://screensizechecker.com/pt/blog/media-queries-essentials)
- [Guia de CSS Container Queries](https://screensizechecker.com/pt/blog/container-queries-guide)
- [Checklist de depuração responsiva](https://screensizechecker.com/pt/blog/responsive-debugging-checklist)

## FAQ

### O Android 17 afeta apenas apps Android nativos?

Não. A mudança de plataforma afeta diretamente apps nativos. Mas a mesma tendência de dispositivos também afeta web apps, PWAs, WebViews e sites responsivos abertos em tablets Android, dobráveis e janelas de estilo desktop. Se sua UI depende de um viewport fixo em formato de telefone, vale a pena testar novamente.

### Quais tamanhos de viewport devo testar para dobráveis Android?

Teste a tela externa e a tela principal desdobrada. Na prática, isso significa 320-430 CSS px para larguras estreitas de smartphone, 600-840 CSS px para larguras médias, pelo menos um cenário em paisagem com pouca altura e pelo menos um cenário quase quadrado. Depois compare com a tabela atual de [tamanhos de viewport Android](https://screensizechecker.com/pt/devices/android-viewport-sizes).

### Resolução de tela ou tamanho do viewport é mais importante para design responsivo?

Para layouts, normalmente o tamanho do viewport é mais importante, porque CSS media queries e a maioria das decisões de layout web trabalham em pixels CSS. O tamanho de tela reportado pelo navegador, a resolução física do painel e o DPR continuam úteis para nitidez de imagem, renderização em canvas e ativos dependentes de densidade.

### 600 CSS px é o mesmo que 600 dp no Android?

Não. Android dp pertence ao sistema de layouts nativos e regras de plataforma. CSS px é a unidade que uma página web vê no viewport. Neste artigo, 600 e 840 CSS px são larguras de teste web, não conversões diretas a partir de Android dp.

### Como testar layouts Android multijanela sem ter todos os dispositivos?

Use primeiro um responsive tester com tamanhos de viewport personalizados e depois valide fluxos críticos em pelo menos um dispositivo Android real ou emulador. Testar multijanela significa alterar a janela disponível; presets com nome de dispositivo não bastam para isso.

### Quais tamanhos são especialmente importantes para Android 17 multijanela?

Teste pelo menos 360, 390, 412, 600, 768, 840 e 1024 CSS px. Adicione 720 x 720 para um cenário dobrável quase quadrado e 844 x 390 para paisagem com pouca altura. Assim você cobre a maioria das transições críticas entre smartphone, dobrável, tablet, modo de tela dividida e janela desktop.

### Devo criar um layout separado para cada modelo dobrável?

Normalmente não. Crie componentes adaptativos que respondam à largura disponível, à altura e à proporção de tela. As tabelas de dispositivos ajudam a entender intervalos reais; os breakpoints devem vir do conteúdo e do fluxo do usuário, não de nomes de modelos específicos.
