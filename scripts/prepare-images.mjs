// prepare-images.mjs — converte os assets de origem para webp otimizado para web.
// Uso: node scripts/prepare-images.mjs
//
// Regras (design.md):
// - Hero: máx. 2560px de largura. Demais fotos do projeto: máx. 1600px.
// - Qualidade webp ~82. Nunca ampliar (withoutEnlargement).
// - Before/After: são compostos antes/depois vindos de fora do projeto.
//   APENAS conversão de formato (sem redimensionar, sem recortar, sem tratar).
//   .rotate() aplica só a orientação do EXIF (no-op se a imagem já está de pé).

import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_IMAGES = path.join(ROOT, "public", "images");
const OUT_VIDEOS = path.join(ROOT, "public", "videos");

// Pasta das before/after — FORA do projeto.
const BEFORE_AFTER_DIR =
  "C:/Users/alith/OneDrive/Desktop/Assets De Clientes/Website Nik/Fotos/Before e After";

const QUALITY = 82;
const HERO_MAX = 2560;
const PHOTO_MAX = 1600;

// Fotos do projeto (assets/ -> public/images/), redimensionadas.
// `cropBottom` (0-1) corta uma fração da BASE antes de redimensionar: serve para
// tirar rodapé morto de foto vertical, aproximando a proporção do enquadramento
// que a composição pede. Largura sempre inteira (cortar as laterais deixaria a
// foto MAIS vertical, que é o oposto do que uma janela larga precisa).
const projectJobs = [
  { src: "assets/hero/hero-agua-desktop.png", out: "hero-agua-desktop.webp", maxWidth: HERO_MAX, budgetKB: 400 },
  { src: "assets/hero/hero-agua-mobile.png", out: "hero-agua-mobile.webp", maxWidth: HERO_MAX, budgetKB: 400 },
  { src: "assets/photos/cena-tratamento-vapor.png", out: "cena-tratamento-vapor.webp", maxWidth: PHOTO_MAX, budgetKB: 250 },
  { src: "assets/photos/cena-tratamento-ultrassom.png", out: "cena-tratamento-ultrassom.webp", maxWidth: PHOTO_MAX, budgetKB: 250 },
  { src: "assets/photos/retrato-nikolle.png", out: "retrato-nikolle.webp", maxWidth: PHOTO_MAX, budgetKB: 250 },
  { src: "assets/photos/espaco-recepcao.png", out: "espaco-recepcao.webp", maxWidth: PHOTO_MAX, budgetKB: 250 },
  // Onda 09-10/08 (feedback da Nikolle): a foto de atendimento EDITADA que ela
  // enviou (âncora dos Serviços, exibida inteira) e a foto do pop-up com a
  // máscara editada para branca (popup-atendimento-branca.jpg é a saída q95 da
  // dessaturação seletiva; o HEIC original segue na pasta como fonte. Para
  // refazer a edição: ffmpeg converte o HEIC — o sharp recusa o iref dele — e
  // o script da dessaturação está no histórico da sessão 10/08).
  { src: "assets/photos/cena-atendimento-editada.jpg", out: "cena-atendimento-editada.webp", maxWidth: PHOTO_MAX, budgetKB: 250 },
  // POP-UP (foto NOVA enviada pela Nikolle em 11/08, substitui a de atendimento
  // com máscara): o ritual do sérum. A diagonal conta a cena inteira, do rosto
  // dela no topo até o rosto da cliente embaixo, passando pelo conta-gotas.
  // O corte de base para em 89% da altura: é onde o queixo da cliente termina
  // (medido). Cortar menos deixaria toalha morta; cortar mais decepa o queixo.
  // Com ele a proporção sai de 0.811 para 0.912, e proporção mais larga é
  // exatamente o que o pop-up MENOR (pedido dela) precisa, porque a fotografia
  // se dimensiona pela altura disponível.
  { src: "assets/photos/popup-ritual-serum.jpg", out: "popup-ritual-serum.webp", cropBottom: 0.11, maxWidth: PHOTO_MAX, budgetKB: 250 },
];

// Before/After (prefixo do arquivo de origem -> nome de saída). Só conversão de formato.
const beforeAfterJobs = [
  { prefix: "A1030654", out: "before-after-01.webp" },
  { prefix: "A4C08AD7", out: "before-after-02.webp" },
  { prefix: "BDDDC643", out: "before-after-03.webp" },
  { prefix: "F819C7F4", out: "before-after-04.webp" },
];

function fmtKB(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

async function report(outPath, budgetKB) {
  const { size } = await stat(outPath);
  const meta = await sharp(outPath).metadata();
  const kb = size / 1024;
  const over = budgetKB && kb > budgetKB ? "  ⚠ acima do alvo" : "";
  console.log(
    `  ${path.basename(outPath).padEnd(30)} ${String(meta.width).padStart(5)}×${String(meta.height).padEnd(5)}  ${fmtKB(size).padStart(10)}${over}`,
  );
}

async function run() {
  await mkdir(OUT_IMAGES, { recursive: true });
  await mkdir(OUT_VIDEOS, { recursive: true });

  console.log("\nFotos do projeto (redimensionadas + webp q" + QUALITY + "):");
  for (const job of projectJobs) {
    const srcPath = path.join(ROOT, job.src);
    const outPath = path.join(OUT_IMAGES, job.out);
    try {
      let pipeline = sharp(srcPath).rotate();
      if (job.cropBottom) {
        const meta = await sharp(srcPath).rotate().metadata();
        pipeline = pipeline.extract({
          left: 0,
          top: 0,
          width: meta.width,
          height: Math.round(meta.height * (1 - job.cropBottom)),
        });
      }
      await pipeline
        .resize({ width: job.maxWidth, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(outPath);
      await report(outPath, job.budgetKB);
    } catch (err) {
      console.error(`  ✗ ${job.src}: ${err.message}`);
    }
  }

  console.log("\nBefore/After (só conversão de formato, sem redimensionar):");
  let entries = [];
  try {
    entries = await readdir(BEFORE_AFTER_DIR);
  } catch (err) {
    console.error(`  ✗ pasta não encontrada: ${BEFORE_AFTER_DIR}\n    ${err.message}`);
  }
  for (const job of beforeAfterJobs) {
    const match = entries.find((f) =>
      f.toUpperCase().startsWith(job.prefix.toUpperCase()),
    );
    const outPath = path.join(OUT_IMAGES, job.out);
    if (!match) {
      console.error(`  ✗ origem com prefixo ${job.prefix} não encontrada`);
      continue;
    }
    try {
      await sharp(path.join(BEFORE_AFTER_DIR, match))
        .rotate()
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(outPath);
      await report(outPath, null);
    } catch (err) {
      console.error(`  ✗ ${match}: ${err.message}`);
    }
  }

  console.log("\nConcluído. Saída em public/images/ e public/videos/.\n");
}

run();
