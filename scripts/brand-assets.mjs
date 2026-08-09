// Gera os assets de marca do porão: monograma (favicon) e derivados raster.
//
// O MONOGRAMA não é desenho novo: é o glifo "N" extraído do próprio wordmark
// vetorizado em components/brand/Logo.tsx (design.md, Porão: "Favicon do
// monograma vetorizado"). O N é o path de índice 3 na ordem do documento,
// medido no browser em x470 y88, 298x284 dentro do viewBox 0 0 1870 642.
// Rodar de novo se a logo mudar:  node scripts/brand-assets.mjs
//
// O OG card NÃO sai daqui: ele é fotografado do app (ver
// design-references/og-card/) porque precisa das fontes reais do site.
import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";

const OLIVE = "#5e6646";
const LINEN = "#f5f0e8";

// Geometria do glifo dentro do viewBox original.
const N = { x: 470, y: 88, w: 298, h: 284 };
const cx = N.x + N.w / 2;
const cy = N.y + N.h / 2;
// Lado da caixa do ícone. 430 deixa o N ocupando 69% dela: grande o bastante
// para ler a 16px e com margem para não encostar nas bordas a 128px.
const S = 430;

const src = await readFile("components/brand/Logo.tsx", "utf8");
const tags = src.match(/<path\b[\s\S]*?\/>/g) ?? [];
if (tags.length !== 36) {
  throw new Error(`o wordmark mudou: esperava 36 paths, achei ${tags.length}`);
}
const d = tags[3].match(/\bd="([^"]+)"/)[1];
const transform = tags[3].match(/\btransform="([^"]+)"/)[1];

const x = cx - S / 2;
const y = cy - S / 2;
const monograma = (raio) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${S} ${S}" role="img" aria-label="by Nikolle">
<title>by Nikolle</title>
<rect x="${x}" y="${y}" width="${S}" height="${S}"${raio ? ` rx="${raio}"` : ""} fill="${OLIVE}"/>
<path d="${d}" transform="${transform}" fill="${LINEN}"/>
</svg>
`;

// Aba de navegador: quadrado macio (raio 22% do lado).
const svgAba = monograma(Math.round(S * 0.22));
await writeFile("app/icon0.svg", svgAba, "utf8");

// Fallback raster, para buscadores e navegadores que não pegam favicon SVG.
await sharp(Buffer.from(svgAba)).resize(192, 192).png({ compressionLevel: 9 }).toFile("app/icon1.png");

// apple-icon SANGRADO, sem raio: o iOS aplica a máscara dele por cima, e a
// transparência dos cantos arredondados viraria preto embaixo dela.
await sharp(Buffer.from(monograma(0))).resize(180, 180).png({ compressionLevel: 9 }).toFile("app/apple-icon.png");

const kb = async (p) => ((await stat(p)).size / 1024).toFixed(0) + " KB";
console.log("app/icon0.svg     ", await kb("app/icon0.svg"));
console.log("app/icon1.png     ", await kb("app/icon1.png"));
console.log("app/apple-icon.png", await kb("app/apple-icon.png"));
console.log(`N ocupa ${((N.w / S) * 100).toFixed(0)}% da caixa`);
