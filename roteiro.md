# roteiro.md — by Nikolle (copy oficial do site, EN)

> FONTE DE VERDADE DA COPY. Tradução fiel do roteiro da cliente (Roteiro Web Design Nik + COMPLEMENTOS).
> REGRA ABSOLUTA: não reescrever, não cortar, não reorganizar, não resumir e NÃO ADICIONAR texto
> (overline, eyebrow, legenda, microcopy) que não esteja neste arquivo. Se um elemento visual pedir
> texto que não existe aqui, a decisão sobe para o Gabriel; não se cria no código. Itens marcados
> [PLACEHOLDER] são provisórios e serão substituídos pela cliente antes do site ir ao ar público.
>
> ATUALIZADO 26/07 — ONDA NIKOLLE JULHO: incorporada a lista de 12 pontos da Nik + o
> Roteiro_Web_Design_EN (PDF de julho). O que ela mandou substituir foi substituído; o que ela
> mandou manter, ficou. Marcações: [AGUARDA ASSET] = depende de material dela;
> [DECISÃO GABRIEL] = precisa de martelo antes de ir pro código; [PENDENTE NIK] = confirmação dela.

---

## REVISÃO NIKOLLE 30/07 (lista escrita + 5 áudios + print da copy do pop-up)

> Fonte: lista "Ajustes e Melhorias do Website" + áudios transcritos. O que virou
> COPY está marcado abaixo em cada seção; o que é forma está no design.md.
> Mudanças de copy desta onda: separador antes de Kakaʻako, slot vivo devolvido,
> título do Sobre, abertura do Sobre sem repetir o nome, rótulos "Full Story" e
> "More Info" (nomes sugeridos por ela), telefone único, "Contact number" no SMS,
> e a copy nova do pop-up.

## Seção 1 — Hero

- LOGO GRANDE centralizada no topo do hero, acima da overline (pedido da Nik; a logo pequena
  da navbar permanece). IMPLEMENTADA 27/07: decorativa (aria-hidden), 60px desktop / 44px
  mobile, centrada, entra em fade junto da overline.
- Overline: Holistic Wellness · Kakaʻako
  (REVISÃO 30/07: ela escreveu "Holistic Wellness . Kaka'ako" e pediu "adicionar o ícone do
  potinho antes de Kaka'ako" — lemos o "potinho" como o SEPARADOR · que faltava, e é isso que
  explica o "o nome está escrito incorretamente". A ʻokina padrão do site foi mantida.
  Se ela quis dizer outra coisa com "potinho", é 1 linha de ajuste.) [CONFIRMAR NIK]
- Headline: A conscious approach to skincare, health, and well-being
  - SLOT VIVO DEVOLVIDO 30/07 por pedido direto da Nikolle ("eu gostaria que cada palavra
    aparecesse: Skincare, depois Health, e depois Well-being... gostei muito desse efeito que
    já tava"). A frase virou 'A Conscious Approach to [slot]' em 2 linhas, e o slot cicla
    Skincare -> Health -> Well-Being em dissolve lento. A frase integral do roteiro segue
    inteira no sr-only. REVOGA a remoção de 27/07 (que tinha sido ordem do Gabriel).
  - TRATAMENTO (mocks do Gabriel, 2ª passada 27/07): caixa de título em TRÊS LINHAS REAIS,
    'A *Conscious* Approach' / 'to Skincare, *Health*,' / 'and *Well-Being*', com as
    estruturais em Inter Tight e as itálicas em Bodoni Moda. 3 linhas em desktop E mobile.
    A copy é a mesma do roteiro; muda só a renderização. Ver design.md item 1-REFEITO.
- Texto de apoio: Discover personalized holistic facials and integrative wellness designed to nurture your skin, nourish your body, and restore balance.
- CTA principal: Book My Consultation — em retângulo MENOR que o atual (pedido da Nik).
- Tag da oferta: REMOVIDA do hero ('Opening Wellness Offer · 15% off your first visit' sai;
  a oferta migra para o pop-up de boas-vindas abaixo).
- Credencial (linha caps discreta, visível na 1ª tela): Best of Honolulu 2024 Winner
- Imagem/vídeo de fundo: a Nik gostou da tonalidade mas quer imagem que remeta mais a
  wellness/holistic health (não só facial). ENTREGUE 27/07: vídeos Veo novos (desktop 16:9 e
  mobile 9:16) processados em ping-pong de 12s + posters, em public/videos/hero-*.
  Falta o ok da Nik na cena nova.

## Pop-up de boas-vindas (REDESENHADO 30/07 em components/ui/WelcomeGift.tsx;
## modal centrado e grande, com retrato; aparece ~20s de navegação; 1x por sessão)

> COPY SUBSTITUÍDA 30/07 pela própria Nikolle (print no WhatsApp: "Da tempo de
> mudar o q esta escrito no pop up? Gostaria q fosse assim"). A copy antiga fica
> como histórico no fim do bloco.

- Título: Begin Your Wellness Journey
- Texto: Whether you're seeking holistic skincare or a Nervous System Reset, each session is designed to support your skin, body, and overall well-being.
- Linha da oferta: Enjoy 20% off your first visit.  (era 15%; subiu para 20% a pedido da Nikolle, 09/08)
- Botão: Reserve My Visit  (desde 10/08 abre o FORMULÁRIO de agendamento, que monta o SMS
  já preenchido; antes abria o SMS direto)
- FOTO: RESOLVIDO 10/08 — ela enviou a foto específica do pop-up ("imagem para pop up",
  09/08) e reprovou o retrato repetido do Sobre. Entrou popup-atendimento.webp com a
  MÁSCARA EDITADA PARA BRANCA (dessaturação seletiva nossa; original HEIC guardado em
  assets/photos/). Redesenho completo 10/08: foto em coluna inteira no desktop
  (max-w 1040px), convite de tela quase cheia no mobile, papel de linho, moldura de fio
  d'água na foto, linha d'água antes da oferta.
- HISTÓRICO (copy da v1, substituída 30/07): título 'A special welcome gift for
  new clients'; texto 'Enjoy 15% off your first holistic skincare experience and
  discover a conscious approach to healthy, radiant skin.'; botão 'Start your
  skin journey'.
- NOTA MODO A: executar como convite discreto e elegante. Sem urgência, sem countdown, sem
  pulso. Fechável no X e no Esc, foco acessível, 1x por sessão (sessionStorage).
- QUANDO APARECE (09/08): dois gatilhos, o que vier primeiro. TETO de 20s no relógio (era 30s,
  encurtado a pedido do Gabriel) e ATALHO por interesse aos 30% da rolagem, que é o fim dos
  Serviços nos dois breakpoints (a pessoa acabou de ver os tratamentos e os preços). O atalho
  só arma aos 8s, para não pegar quem só folheou. O convite só é GASTO quando a pessoa de
  fato o vê: com a aba em segundo plano ele espera ela voltar.

## Seção 2 — Marquee de palavras (a faixa que passa abaixo do hero)

- Palavras: Integrative Wellness · Natural & Organic · Reset · Holistic · Non-invasive · Clean beauty
  (Skin, Nourishment e Balance SAEM; as demais ficam — pedido da Nik.)
- Adicionar um ÍCONE na frente de cada palavra (SVG inline da marca, nunca emoji). Desenho dos
  ícones a definir. [DECISÃO GABRIEL]
- Cor: escurecer um passo (a Nik achou a fonte atual muito apagada).

## Seção 2 — Filosofia (Os Três Pilares)

- Eyebrow: The By Nikolle Philosophy  (substitui 'The by Nikolle Method')
- Título: Discover our three pillars
  (substitui 'A mindful approach to your self-care.'; itálico em 'pillars' — aprovado
  27/07, implementado)
- CTA da seção (NOVO, do briefing do Gabriel 27/07, narrativa de scroll): Explore the Philosophy
  (com seta fina; leva ao #about, onde a filosofia é contada em 1ª pessoa — decisão nossa,
  o briefing não fixou destino) [DECISÃO GABRIEL só no destino]
- Numerais estruturais dos cards: 01 / 02 / 03 + indicador '01 [fio] 03' (decorativos,
  do mock aprovado; o traço do indicador é um FIO desenhado, nunca travessão em texto)
- Pilar 1 — SKIN (descrição NOVA, do roteiro): Holistic, non-invasive treatments that strengthen the skin barrier and support your skin's natural ability to heal, renew, and thrive. Lasting results without aggressive treatments.
- Pilar 2 — NOURISHMENT (mantido, ok da Nik): True beauty is nourished from the inside out. We pair aesthetics with lifestyle, integrative nutrition and practices that feed your body and your vitality.
- Pilar 3 — BALANCE (descrição NOVA, do roteiro): An integrative approach that supports harmony between body, mind, and nervous system through calm, connection, and intentional daily rituals.
- ÍCONES: TROCAR entre si — o ícone que hoje está no Skin vai pro Balance, e o do Balance vai
  pro Skin. (Nourish fica.)

## Seção 3 — Serviços

- Título: Care designed for your unique needs
  (substitui 'Care designed for your unique journey.'; itálico em 'unique needs' — aprovado
  27/07, implementado)
- Subtítulo: A holistic and personalized approach to help you look, feel, and live well.
  (substitui 'Real results through a holistic and non-invasive approach.')
- Legenda da imagem-âncora: Every treatment tailored to your skin needs.
  (substitui 'Every treatment, tailored to your skin.')
- Label do gatilho do acordeão (UI microcopy NOSSA; Nikolle revisa depois): View services
- IMAGEM: RESOLVIDO 10/08 — a foto editada chegou (WhatsApp 09/08, "imagem versão aditada
  atendendo a cliente") e entrou como cena-atendimento-editada.webp, INTEIRA, sem cortar
  (o quadro usa a proporção natural 1082x1350 do asset nos dois breakpoints).
- FORMATO: RESTAURADO 10/08 ao acordeão aprovado em 30/07 (pedido dela 09/08: "quero como
  estava... um abaixo do outro... o fundo com a mesma tonalidade do restante do site").
  O trilho + carta de 08/08 saiu.

### Signature Facials
- Intro: Customized holistic facials designed to nourish the skin, restore balance, and support long-term skin health through a natural, results-driven approach.
- Skin Consultation + Customized Holistic Facial | $150 (80 min): A 20 minutes consultation to assess your skin concerns and goals, followed by a customized holistic facial tailored to your skin's current needs. All first-time clients are required to book this treatment.
- Deep Pore Detox Facial | $145 (75 min): Clarifying and balancing treatment that deeply cleanses pores, removes impurities and excess oil. Ideal for congested, oily or acne-prone skin.
- Stimulating Herbal Facial | $140 (60 min): Invigorating herbal treatment designed to stimulate circulation and reveal radiant skin. Ideal for mature or fatigued skin.
- Superfood Renewal Facial | $135 (60 min): Nourishing treatment to restore hydration, brightness and vitality. Ideal for normal, dry, dull, dehydrated or tired skin.
- Soothing Recovery Facial | $125 (60 min): Calming and restorative treatment to strengthen the skin barrier, reduce inflammation and support sensitive, reactive or stressed skin.

#### Add-Ons (agora DENTRO de Signature Facials — pedido da Nik)
- Intro: Elevate your session.
- LED Light Therapy | +15 min | $20: Reduces inflammation and stimulates collagen.
- Intro to Marma Points | +15 min | $25: More time for deep relaxation and tension release.
- (Ultrasound Infusion e Extended Facial Massage SAÍRAM da lista.)

### Advanced Treatments
- Intro: Non-invasive yet powerful treatments designed to promote deeper skin renewal through advanced technologies that support collagen, improve circulation, and restore overall skin vitality.
- Age Corrective Treatment | $165 (75 min): Targets visible signs of aging including fine lines, dehydration and loss of elasticity for smoother, firmer-looking skin.
- Pigment Balance Treatment | $165 (75 min): Helps improve the appearance of pigmentation, sun damage and uneven skin tone for a brighter, more balanced complexion.
- Dermal Infusion Micro-Crystal Treatment | $230 (90 min): Advanced skin renewal treatment designed to stimulate collagen production and enhance product infusion for smoother, brighter, radiant skin. A gentle alternative to traditional microneedling with no downtime.

### Nervous System Reset (CATEGORIA NOVA — 3ª categoria)

> PREÇOS REVISADOS 09/08 pela Nikolle (WhatsApp): Deep Relaxation Facial $125 -> $130,
> Marma Therapy $110 -> $115, e 'Monthly sessions | $95' virou
> 'Marma Monthly Sessions | $99'.

- Intro: A restorative experience designed to calm the nervous system, reduce stress, and promote deep relaxation and balance.
- Deep Relaxation Facial | $130 (60 min): A soothing facial designed to nourish the skin while promoting deep relaxation. This treatment includes a prolonged facial, scalp, neck, and shoulder massage, introductory Marma point stimulation, and vibrational sound to calm the mind.
- Marma Therapy | $115 (60 min): An Ayurvedic energy therapy that stimulates vital energy points to encourage the flow of prana (life force), release tension, and support the body's natural healing response. This treatment includes Marma point stimulation on the head, face, neck, shoulders, and feet, combined with vibrational sound to promote nervous system balance and overall well-being.
- Marma Monthly Sessions | $99: To support your nervous system through regular care.

- Nota ao fim da seção de serviços: Coming soon: Integrative Wellness Coaching Program

## Seção NOVA — Integrative Wellness Coaching Program (Coming Soon)

> A Nik quer esta seção À VISTA na home (não escondida dentro dos programas).
> CONSTRUÍDA 27/07 (ComingSoon.tsx, entre o Sobre e o FAQ; card pedra + meniscos).

- Título: Coming Soon: Integrative Wellness Coaching Program
- Texto: Rooted in Integrative Nutrition and Ayurvedic principles, our upcoming wellness programs are designed to support lasting health, balance, and vitality through personalized guidance in nutrition, lifestyle, and mindful living. A deeper journey toward well-being from the inside out. Coming soon.
  (o travessão do original virou ponto — regra 7, sem em-dash em texto visível)

## Seção 4 — Holistic Skincare Programs

- Título: Holistic Skincare Programs
  (substitui 'Skin Wellness Program' — é o nome-guarda-chuva dos DOIS programas; itálico em
  'programs' — aprovado 27/07, implementado)
- Eyebrow (UI microcopy NOSSA, aprovada em mock): By invitation
- Texto: Lasting transformation requires consistency. We created an exclusive program for clients who want to maintain their skin goals through regular treatments at special rates.
- CTA: Discover the Program Benefits — TOGGLE do painel com os DOIS programas dentro da
  própria seção olive (IMPLEMENTADO 27/07; preços só no painel, a home segue convite; o
  painel fecha com 'Book My Consultation' abrindo o SMS)

### Programa 1 — Skin Wellness Program
(formato de referência da Nik: 3 tratamentos divididos em boxes; ela sugeriu fotos nos boxes)
- Signature Facials — Monthly: $110 | Every 2 Months: $120
- Advanced Treatments — Monthly: $135 | Every 2 Months: $145
- Dermal Infusion Micro-Crystal Treatment — Monthly: $185 | Every 2 Months: $205
- Clients receive a one-week grace period for rescheduling while keeping their Skin Wellness Rate.
- NOTA: preços de programa entram POR PEDIDO DA NIK, confirmado 27/07: só DENTRO do painel
  (a seção da home continua convite, sem preço).

### Programa 2 — Pigment Balance Program
- A personalized skin wellness program designed to support melasma and hyperpigmentation through a holistic, results-driven approach.
- At By Nikolle, we understand melasma as a reflection of a compromised skin barrier influenced by multiple factors. Our Method focuses on strengthening the skin barrier, providing deep nourishment, and gently supporting natural skin renewal. As skin health and resilience are restored, pigmentation gradually improves over time.
- The program combines a series of Pigment Balance Treatments and Dermal Infusion sessions, customized home care regimen with Eminence Organics skin products and lifestyle guidance to support lasting results.
- Each program is tailored to your individual skin needs and goals.
- Program investment is determined following an initial consultation.

## Seção 5 — Transformações (before/after, 'O Amanhecer')

- Título (UI microcopy NOSSA): Real transformations.
- Rótulos: Before / After · rótulos verticais 'Transformation · I..' neutros (NUNCA claim clínico)
- Disclaimer FTC: Individual results may vary.
- Hint (desktop): hover to reveal
- FOTOS: colocar TODAS as before/after que a Nik enviou, NA ORDEM que ela organizou (o Drive
  desordenou). Cada pessoa tem 2 fotos de ângulos diferentes; só a 3ª pessoa (eczema) tem 1.
  Conferir o conjunto e a ordem com ela antes de reconstruir os painéis. [AGUARDA ASSET/ordem]
- Info de tratamento por par (PENDENTE dado real da Nik — NÃO inventar; é claim clínico).

## Seção VOZES — depoimentos ('Kind words')

- Título: Kind words from our clients
  (substitui 'Real Experiences, Natural Results.' — pedido da Nik; itálico em 'clients',
  implementado 27/07; seção construída em Voices.tsx, eyebrow 'Voices' ficou fora)
- A Nik pediu MAIS DESTAQUE para os reviews (hoje a seção nem existe no site; construir com
  presença — ver design.md item 5v, atualizar o título no design).
- Depoimentos REAIS (fonte de verdade, completos):
  - Ali Z: "I went in for the first time for my very first facial. Really nice experience. Relaxing and rejuvenating are just the tip of the experience! Nikolle and her expertise are a delight and gift to Honolulu. Gentle kind and respectful in all aspects. Very professional. Nikolle took her time and focused on giving a top tier pampered experience. Highly recommend in every way."
  - Sara M: "I've had many facials over the years, but Nikolle's treatments are unlike anything I've experienced before. Her knowledge, gentle touch, and personalized care have transformed my skin."
  - Melani S: "I was skeptical at first after trying countless treatments for my melasma, but Nikolle's method truly transformed my skin. My melasma has noticeably faded, and my skin feels healthier than ever. Forever grateful."
  - Ashley B: "I came to Nikolle about a year ago hoping to improve my dark spots. She encouraged me to be patient and trust the process, and I'm so glad I did. Over time, my skin became brighter, healthier, and almost no signs of hyperpigmentation."
- EXCERPTS DE DISPLAY (derivados dos completos; [PENDENTE NIK] ok dela):
  - Melani S: "I was skeptical after countless treatments for my melasma, but Nikolle's method truly transformed my skin. My melasma has noticeably faded."
  - Ashley B: "She encouraged me to be patient and trust the process. My skin became brighter, healthier, with almost no signs of hyperpigmentation."
  - Sara M: "Nikolle's treatments are unlike anything I've experienced before. Her knowledge, gentle touch and personalized care have transformed my skin."
  - Ali Z: "Nikolle and her expertise are a delight and gift to Honolulu. A top-tier, pampered experience."

## Interlúdio — Imprensa (entre Transformações/Vozes e Sobre)

> RESTAURADO 10/08 (revisão da Nikolle 09/08: "the best of Honolulu eu quero como estava...
> Gosto da versão antiga", com print do interlúdio estático). A cena editorial de scroll de
> 27/07 saiu do site; a copy dela fica como histórico abaixo. A copy ativa volta a ser a v1:

- Divisórias (filete duplo com label): In the Press · Honolulu · 2024  /  Est. Kaka'ako
- Masthead: As seen in Honolulu Magazine
- Headline: Named Best natural facial.
- Pull-quote (citação REAL completa da Honolulu Magazine): Coelho delivers bespoke holistic skin rejuvenation. You leave with a radiant glow and a relaxed state of mind.
- Fólio: Honolulu Magazine · Best of Honolulu 2024 Winner
- Assets: public/images/recorte-revista-honolulu.png + selo-best-of-honolulu.png.
- HISTÓRICO (copy da cena de scroll 27/07-09/08, fora do site desde 10/08): pill IN THE PRESS;
  headline NAMED BEST + natural facial.; microcopy BEST OF HONOLULU 2024 WINNER; quote encurtada
  "You leave with a radiant glow and a relaxed state of mind."; fonte HONOLULU MAGAZINE · 2024;
  CTA VIEW THE FEATURE; hint SCROLL TO UNFOLD; indicadores 01/03 · 02/THE FEATURE UNFOLDS · 03/03.
  Os assets dela seguem em public/images/press/ sem uso (podar = decisão do Gabriel).

## Seção 6 — Sobre Nikolle (The Founder)

- Eyebrow: The Founder  (mantém — pedido explícito da Nik)
- Título: Aloha, I'm Nikolle.
  (RESOLVIDO 30/07: era [PENDENTE NIK] e ela bateu o martelo — "substituir 'Nice to meet you'
  por 'Aloha, I'm Nikolle.'". Tratamento v2: 'ALOHA,' / "I'M Nikolle." com o nome em itálico.)
- Botão de expansão da seção (rótulo sugerido por ela): Full Story
  (a seção "ficou muito comprida": abre com a apresentação + 1º parágrafo, e o restante do
  texto + as credenciais entram no clique. Nada de conteúdo foi cortado.)
- Subtítulo: True beauty begins from within
  (substitui 'Beauty is the reflection of your balance.')
- Texto (NOVO, substitui o anterior por inteiro):
  - Abertura: Founder of By Nikolle | skin • nourishment • balance.
    (ENCURTADA 30/07 a pedido dela: "não é necessário repetir meu nome novamente logo abaixo;
    começar diretamente com Founder of By Nikolle". O 'Aloha, I'm Nikolle' subiu para o título.)
  - P1: With over a decade of experience in skincare, By Nikolle was born from my passion for holistic skincare, integrative health, nutrition, and spirituality, and from the desire to create a space where skin health, wellness, and conscious living come together.
  - P2: Over the years, my vision of aesthetics and health has deeply evolved. Through my studies and personal journey, I came to understand that skin health goes far beyond surface-level treatments, it reflects the balance of the body, mind, and daily habits.
    (o em-dash do original virou vírgula — regra 7)
  - P3: Today, By Nikolle is a reflection of my own evolution, bringing together holistic skincare and wellness to support transformation from the inside out.
- Credentials & Training ('por favor mantenha como está' — a Nik; bloco NOVO no site):
  - Licensed Esthetician - Flávia Leal Beauty Institute | Boston, MA
  - Certified Integrative Nutrition Health Coach - Institute of Integrative Nutrition (IIN) | Online
  - Certified Marma Therapist - Ayuskama Ayurveda | Rishikesh, India
  - Ayurveda Nutrition & Cooking - Ayuskama Ayurveda | Rishikesh, India
  - 200-Hour Yoga Teacher Training - World Peace Yoga School | Bali, Indonesia
  - Reiki Level I & II Practitioner - Starseed Healing Journeys | Hawaii
- CTA: Explore the Holistic Skincare Programs  (nome novo do programa)
- Assinatura: Nikolle Coelho  (antes era só 'Nikolle'; segue na Parisienne com a revelação)
  - POSIÇÃO (revisão Nikolle 09/08, implementada 10/08): a assinatura NÃO aparece na página
    principal; vive DENTRO do Full Story ("somente quando click p mais info"), fechando a
    carta expandida, depois das credenciais.
- Legenda sob o retrato (NOVA, enviada pela Nikolle via WhatsApp 09/08):
  Holistic Esthetician and Nutritional Health Coach
  (ENCURTADA POR ELA em 11/08: era 'Holistic Skincare Practitioner and Nutritional Health
  Coach' e ela mesma trocou 'Skincare Practitioner' por 'Esthetician' "p caber tudo em uma
  linha" no mobile. Decisão de copy dela, não nossa.)
- FOTO: aumentar o retrato para NÃO cortar o topo do cabelo (ajustar enquadramento/aspect).

## Seção 7 — FAQ

- Botão de expansão (rótulo sugerido por ela, revisão 30/07): More Info
  (a seção "ficou muito comprida": as 5 primeiras perguntas ficam à vista e as demais entram
  no clique. Nenhuma pergunta foi removida.)

- Título: What you need to know before booking.
  (mantido — aprovado 27/07; o rótulo 'Frequently Asked Questions' do PDF não vira heading)
- Perguntas e respostas (conjunto NOVO do roteiro, na ordem):
  - P1: Is holistic skincare effective?
    R: Yes. Holistic skincare can be highly effective because it addresses both the external and internal factors that influence skin health. While professional treatments support the skin directly, factors such as nutrition, lifestyle, stress, sleep, and overall well-being also play an important role in achieving healthy, radiant skin.
  - P2: What makes your approach different from traditional facials?
    R: My approach goes beyond treating the surface of the skin. Each treatment is customized and combines advanced non-invasive techniques, natural and organic skincare, facial massage, and holistic principles to support long-term skin health, balance, and overall well-being.
  - P3: Do you treat melasma and hyperpigmentation?
    R: Yes. I specialize in supporting clients with melasma and hyperpigmentation through a holistic and integrative approach. Because melasma is a complex condition influenced by multiple internal and external factors, treatment focuses on improving skin health, reducing triggers, protecting the skin barrier, and creating sustainable lifestyle and skincare practices.
  - P4: How long does it take to see results with melasma?
    R: Every skin is unique, and results vary depending on the severity of pigmentation, lifestyle factors, home-care consistency, and overall health. Many clients begin noticing improvements within a few months, but melasma requires patience, consistency, and a long-term approach for lasting results.
  - P5: Will my melasma completely disappear?
    R: Melasma is often considered a chronic skin condition, which means management and prevention are key. While significant improvement is possible, the goal is to reduce pigmentation, strengthen skin health, minimize flare-ups, and help you maintain healthier, more balanced skin long-term.
  - P6: Do I need to use natural products at home?
    R: Yes. At By Nikolle, we believe that what we put on our skin matters. Our philosophy is centered on using clean, skin-supportive products that nurture the skin barrier while minimizing unnecessary exposure to potentially harmful ingredients. We educate our clients on the importance of a more conscious, less toxic approach to skincare and wellness, supporting healthy skin and overall well-being from the inside out.
  - P7: Do you offer aggressive or invasive treatments?
    R: No. My philosophy is centered around non-invasive yet effective treatments that work in harmony with the skin rather than compromising its integrity. I believe healthy, resilient skin is the foundation for lasting results.
  - P8: Is your approach only focused on skincare products?
    R: No. Skin health is influenced by many factors, including nutrition, stress, sleep, digestion, hormones, and lifestyle habits. When appropriate, we may explore these aspects to better support your skin and overall well-being.
  - P9: How often should I receive treatments?
    R: Treatment frequency depends on your skin concerns and goals. For clients working on concerns such as melasma or age management, treatments every 3-6 weeks are generally recommended, along with a consistent home-care routine.
  - P10: When will the Integrative Wellness Program begin, and what will it include?
    R: Integrative wellness programs are expected to launch by the end of this year or early 2027. These programs are being thoughtfully developed and structured to better support clients seeking a deeper, more holistic approach to health and well-being. Rooted in integrative nutrition and Ayurvedic principles, the programs will offer personalized guidance on nutrition, lifestyle, stress management, and holistic wellness practices to support both skin health and overall well-being. More details coming soon.
  - EXTRA (mantida do roteiro anterior — aprovado 27/07; é a pergunta 11 do acordeão): Where are you located?
    R: We are inside the welcoming Moa Wellness Center in Kakaʻako, with free parking available for your comfort.

## Seção 8 — Footer

- Frase central: Supporting your journey to skin health, nourishment, and balance.
  (REAUDITORIA 27/07: no PDF a frase nova está em LARANJA logo abaixo da antiga, que NÃO
  está riscada. Lemos como substituição, padrão das demais anotações dela; se a Nik quiser
  as duas, é 1 linha de ajuste.) [PENDENTE NIK só nesse detalhe]
- Localização: Moa Wellness Center — Kakaʻako, Honolulu, HI
- Agendamento: Text to Book: (808) 457-8823
  (CORRIGIDO 30/07 pela Nikolle: "a mensagem de booking está sendo enviada para o número
  errado. O único número correto é: 808 457 8823". O 721-7476 SAIU do site inteiro e o SMS
  passou a apontar para o 457-8823. Revoga a leitura de 27/07, que mantinha os dois.)
- Instagram: @by_nikolle_snb  (MUDOU — antes @bynikolle)
- Studio Hours:
  - Tuesday - Friday · 10:30 AM - 6:00 PM
  - First & Third Saturday of the month · 10:30 AM - 5:00 PM
  - Appointments by booking only.
- Fecho: Mahalo for supporting our holistic practice!
  (substitui 'Thank you for supporting small & holistic. ♡'; manter o ♡? confirmar) [PENDENTE NIK]

## Selos de valores (ícones da Nik — 'colocar em algum lugar do site')

> A Nik enviou ícones (do material impresso dela) e quer os dizeres assim. Posição a definir
> em mock (proposta: faixa discreta perto do footer ou entre seções). [DECISÃO GABRIEL]
- holistic skincare
- Support for mature skin & melasma
- Natural & organic products
- Personalized care
- Integrative Nutrition
- Ayurveda

## Mensagem de agendamento (SMS — body NOVO, substitui o atual)

Hi Nikolle! I'd like to schedule my first visit.

My name is ______.

Contact number: ______.

I'm interested in:
☐ Holistic Facial
☐ Nervous System Reset

My main concern or intention is: ______.

My preferred day/time is: ______.

Thank you! I look forward to my experience with you.

> NOTA TÉCNICA: body multi-linha em sms: exige %0A no encoding; o caractere ☐ pode não
> renderizar em todo teclado/aparelho (fallback sugerido: '( )'). Testar em iPhone e Android
> reais antes do go-live.

## Notas globais da revisão da Nik (julho)

- Fontes do site um passo MAIORES (ela achou pequenas para leitura; manter a estética).
- Tipografia com predominância mais ESCURA (textos 'pretos'; hoje graphite #43463D — avaliar
  escurecer um passo o corpo e labels apagados).
- Fundos claros predominantes; branco entra também; Sage Olive como detalhe mínimo.
- 'Podendo usar um pouco de gold': DECIDIDO 27/07 (Gabriel seguiu a recomendação) — dourado
  NÃO entra; a lei 'nunca dourado' permanece. Reabrir apenas se a Nik insistir explicitamente.
- Revisar espaçamento, alinhamento e organização geral em todas as seções.

## Conteúdo pendente da cliente (NÃO construir sem o material/confirmação)
- Foto nova do hero (wellness/holistic) — ou produção nossa com aprovação dela
- Foto nova da seção de serviços (máscara branca, usar inteira)
- Conjunto completo e ORDEM das fotos before/after (2 ângulos por pessoa; eczema 1 foto)
- Confirmações: ʻokina na overline, título do Sobre (Aloha?), frase central e ♡ do footer,
  segundo telefone, excerpts das Vozes
