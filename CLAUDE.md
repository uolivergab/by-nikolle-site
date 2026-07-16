# CLAUDE.md — by Nikolle (regras permanentes do projeto)

Estética facial holística premium, Moa Wellness Center, Kaka'ako, Honolulu.
Site monolíngue em inglês. **MODO A (marca premium):** zero countdown, zero
escassez fabricada, zero toast de prova social, zero venda agressiva. A ação
única do site é enviar o SMS de agendamento.

Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Framer
Motion + shadcn/ui (base-nova). Deploy Vercel.

## Regras (valem em toda edição, sem exceção)

1. **Ler antes de editar.** Ler `roteiro.md` (copy) e `design.md` (gramática do
   projeto) na íntegra antes de qualquer alteração. Eles são a fonte de verdade.
2. **Copy intocável.** Só renderizar texto que existe no `roteiro.md`. Nunca
   inventar palavra visível (overline, eyebrow, legenda, microcopy, alt de
   marketing). Se um elemento pedir texto que não está lá, a decisão sobe para o
   Gabriel; não se cria no código. Itens `[PLACEHOLDER]` são provisórios.
3. **Tokens sempre.** Nunca cor hardcoded em componente. Usar as 3 camadas de
   `app/globals.css` (primitivo → semântico → componente) e os utilitários da
   marca (`bg-linen`, `text-graphite`, `border-sage`, `bg-olive`, `font-display`,
   `font-sans`). `olive` aparece exatamente 2 vezes no site (Programa + footer).
4. **SVG inline, nunca emoji como ícone.** Ícones e logo são SVG inline com
   atributos inline; `currentColor` só em SVG inline. A logo é `components/brand/Logo.tsx`.
5. **Grade 8pt.** Espaçamentos em múltiplos de 8 (meios-passos de 4 quando
   necessário). Sem valores mágicos.
6. **prefers-reduced-motion respeitado** em toda animação (degradar para fade
   simples; folhagem estática). Animar só transform e opacity.
7. **Sem travessão** (em dash / em-dash) em texto visível. Usar ponto ou vírgula.
8. **Build, lint e typecheck sempre verdes:** `npm run build`, `npm run lint`,
   `npm run typecheck`.
9. **Relatar ao final de cada sessão** os arquivos alterados.

## Método

Uma seção por vez. Nenhuma seção fecha sem a passada de acabamento
(skill `detalhes-aesthetic`): estrutura aprovada → detalhes → mock → aprovação →
implementação → seção fechada. Repertório informa, autoria decide.

## Assets e imagens

`node scripts/prepare-images.mjs` converte os assets de origem para
`public/images/` em webp (hero ≤ 2560px, demais ≤ 1600px, q82). Before/after são
convertidas cruas (só formato, sem redimensionar/recortar/tratar).

## Next.js 16

Esta versão tem breaking changes em relação a versões anteriores. Ver `AGENTS.md`
e, na dúvida, consultar `node_modules/next/dist/docs/` antes de escrever código.
