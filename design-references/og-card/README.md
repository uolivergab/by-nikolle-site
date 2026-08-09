# OG card e monograma (o porão da marca)

O que o link do site mostra quando alguém manda no WhatsApp, posta em rede
social ou vê no resultado do Google.

## Arquivos no ar

| Arquivo | O que é |
|---|---|
| `app/opengraph-image.jpg` | O cartão, 1200x630. Gerado da fonte aqui do lado. |
| `app/opengraph-image.alt.txt` | Alt do cartão. |
| `app/icon0.svg` | Favicon vetorial (monograma). |
| `app/icon1.png` | Mesmo monograma em 192px, para buscadores e navegadores antigos. |
| `app/apple-icon.png` | 180px SANGRADO, sem cantos arredondados (o iOS aplica a máscara dele). |

O Next monta as tags sozinho a partir desses nomes de arquivo. O que faz as URLs
ficarem absolutas (e sem isso o WhatsApp não busca a imagem) é o `metadataBase`
em `app/layout.tsx`.

## Regerar o monograma

```
node scripts/brand-assets.mjs
```

Extrai o glifo "N" do próprio wordmark vetorizado (`components/brand/Logo.tsx`),
como pede o design.md ("Favicon do monograma vetorizado"). Não é desenho novo.
Se a logo mudar, o script avisa (ele confere que o wordmark ainda tem 36 paths).

## Regerar o cartão

O cartão não sai de script porque precisa das fontes reais do site. O caminho:

1. Copiar `og-card-source.tsx` para `app/og-card/page.tsx`.
2. Subir o dev server, abrir `/og-card` numa janela de 1200x630 com DPR 2.
3. Fotografar (sai 2400x1260).
4. Reduzir para 1200x630 e salvar como `app/opengraph-image.jpg`. Reduzir de 2x
   dá supersampling, ou seja, tipografia mais limpa do que fotografar a 1x.
5. Apagar `app/og-card/`.

A fonte já cuida de duas armadilhas: esconde o indicador de dev do Next
(`nextjs-portal`), que senão é assado dentro do PNG, e tira a barra de rolagem,
que senão entra na captura.

## Decisões de composição

Campo: a ATMOSFERA da marca (o plate de gesso com sombra de folhagem e cáustica
d'água da Seção 5b), não uma fotografia de rosto ou tratamento. É o que o
design.md pede no Porão: "OG card desenhado (não foto solta)".

Copy: só string já aprovada. O wordmark carrega "SKIN · NOURISHMENT · BALANCE" e
a linha de baixo é o título de página que já está no ar.

Centragem é ÓPTICA, não geométrica: o viewBox do wordmark tem folga interna no
topo, então a caixa centrada deixa a tinta 12px baixa. Daí o `translateY(-12px)`.

`variante-com-selo.png` é a alternativa com o carimbo Best of Honolulu no canto.
Não foi a escolhida por padrão (Modo A pede prova social discreta, e no
tamanhinho da lista de conversas o selo azul vira um borrão), mas está pronta:
basta virar `COM_SELO` para `true` na fonte e refotografar.
