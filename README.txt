════════════════════════════════════════════════════
  FTC BIOBUZZ — Simulador de Robótica 2026–2027
  Versão 2.0 — Edição Completa
════════════════════════════════════════════════════

COMO USAR
─────────────────────────────────────────────────
Abra "index.html" em Chrome, Firefox, Edge ou Safari.
Funciona 100% offline — sem instalação necessária.

NOVIDADES DESTA VERSÃO
─────────────────────────────────────────────────
✅ Vídeo de introdução com transição suave
✅ Sons: colocar bloco, vencer/perder fase, campeão
✅ Botão RUN bloqueado antes de iniciar a fase
✅ Régua de distância no campo (marcações em cm)
✅ Botão STEP (passo a passo) corrigido e visual
✅ Inputs numéricos digitáveis (não só dropdown)
✅ Clique no nome do bloco para mudar o tipo
✅ Arrastar bloco para cima/baixo para reordenar
✅ Soluções verificadas por simulação de física

CONTROLES
─────────────────────────────────────────────────
▶  RUN      Executa o programa (fase deve estar iniciada)
⬛ PARAR    Para e reseta o robô
⏭ STEP     Passo a passo — clique para avançar bloco
💡 Dica     Estratégia da fase
👁 Solução  Revela e carrega a solução correta

BLOCOS
─────────────────────────────────────────────────
• Clique no bloco da caixa para adicionar ao programa
• Clique no NOME do bloco (no programa) para mudar tipo
• Arraste blocos para cima/baixo para reordenar
• Use ▲▼ para mover bloco uma posição por vez
• Digite o valor diretamente no campo numérico

FASES
─────────────────────────────────────────────────
1 — Primeiro Voo     1 pollen   (introdução)
2 — Navegação 360    2 pollens  (rotações)
3 — Enxame Total     3/5 pollens (loops)
4 — Modo Sensor      2 pollens  (condicionais)
5 — Desafio FTC      4/6 pollens (campo completo)

PONTUAÇÃO
─────────────────────────────────────────────────
+100 pts  por pollen depositado
 −30 pts  por colisão com parede
 +80 pts  bônus tempo < 10 s
 +40 pts  bônus tempo < 20 s

ESTRUTURA DO PROJETO
─────────────────────────────────────────────────
ftc-biobuzz/
├── index.html
├── css/estilos.css
├── js/
│   ├── constantes.js   dados: blocos, fases, soluções
│   ├── estado.js       variáveis globais
│   ├── fisica.js       colisões e sensores
│   ├── renderizacao.js canvas 2D
│   ├── executor.js     interpretador de blocos
│   ├── blocos.js       workspace de programação
│   ├── ui.js           interface e modais
│   ├── sons.js         sistema de áudio
│   └── main.js         loop, vídeo e eventos
└── assets/
    ├── sons/           arquivos MP3
    └── video/          intro.mp4
════════════════════════════════════════════════════
