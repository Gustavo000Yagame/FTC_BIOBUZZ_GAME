const LARGURA_CAMPO  = 370;
const ALTURA_CAMPO   = 340;
const LARGURA_ROBO   = 24;
const ALTURA_ROBO    = 24;
const VELOCIDADE_ROBO  = 110;
const VELOCIDADE_GIRO  = 140;
const RAIO_POLLEN    = 10;
const RAIO_COLETA    = 34;
const RAIO_DEPOSITO  = 45;
const INTERVALO_CAMINHO = 0.07;

const DEF_BLOCOS = {
  'avancar':            { categoria:'movimento', rotulo:'▶ Andar Frente',         chaveParam:'distancia', opcoes:[30,60,90,120,150], unidade:'cm' },
  'recuar':             { categoria:'movimento', rotulo:'◀ Andar Trás',            chaveParam:'distancia', opcoes:[30,60,90,120],     unidade:'cm' },
  'virar-direita':      { categoria:'movimento', rotulo:'↻ Girar Direita',         chaveParam:'graus',     opcoes:[45,90,135,180],    unidade:'°'  },
  'virar-esquerda':     { categoria:'movimento', rotulo:'↺ Girar Esquerda',        chaveParam:'graus',     opcoes:[45,90,135,180],    unidade:'°'  },
  'parar':              { categoria:'movimento', rotulo:'⬛ Parar',                 chaveParam:null },
  'intake-ligar':       { categoria:'acao',      rotulo:'⚡ Intake ON',            chaveParam:null },
  'intake-desligar':    { categoria:'acao',      rotulo:'○ Intake OFF',            chaveParam:null },
  'depositar':          { categoria:'acao',      rotulo:'💛 Depositar',            chaveParam:null },
  'se-pollen-proximo':  { categoria:'sensor',    rotulo:'? Se Pollen Próximo →',  chaveParam:null },
  'se-parede-proxima':  { categoria:'sensor',    rotulo:'? Se Parede Próxima →',  chaveParam:null },
  'se-na-colmeia':      { categoria:'sensor',    rotulo:'? Se Na Colmeia →',      chaveParam:null },
  'repetir':            { categoria:'logica',    rotulo:'↺ Repetir {',            chaveParam:'vezes',     opcoes:[2,3,4,5,8,10],    unidade:'x'  },
  'fim-repetir':        { categoria:'logica',    rotulo:'} Fim Repetir',           chaveParam:null },
  'esperar':            { categoria:'logica',    rotulo:'⏱ Esperar',              chaveParam:'segundos',  opcoes:[0.5,1,1.5,2,3],   unidade:'s'  },
};

const FASES = {
  1: {
    nome: 'Primeiro Voo',
    intro: { numero:'FASE 1 DE 5', titulo:'PRIMEIRO VOO 🐝',
      descricao:'Mova o robô até o pollen amarelo e entregue na colmeia!',
      objetivo:'Ative o intake, avance até o pollen e deposite na colmeia.',
      dica:'💡 Intake ON → Frente 60cm → Girar Esq 45° → Frente 30cm → Depositar' },
    roboInicio:{ x:55, y:170, angulo:0 },
    polens:[ {x:190,y:170} ],
    colmeia:{ x:290, y:120, largura:64, altura:58 },
    paredes:[
      {x:0,y:0,l:LARGURA_CAMPO,a:14},{x:0,y:ALTURA_CAMPO-14,l:LARGURA_CAMPO,a:14},
      {x:0,y:0,l:14,a:ALTURA_CAMPO},{x:LARGURA_CAMPO-14,y:0,l:14,a:ALTURA_CAMPO},
    ], metaPolen:1
  },
  2: {
    nome: 'Navegação 360',
    intro:{ numero:'FASE 2 DE 5', titulo:'NAVEGAÇÃO 360 🔄',
      descricao:'Use rotações para alcançar pollens em posições diferentes!',
      objetivo:'Colete 2 pollens usando rotações e deposite na colmeia.',
      dica:'💡 Intake ON → Esq 90° → Frente 30cm → Dir 90° → Frente 60cm → Dir 90° → Frente 60cm → Esq 90° → Frente 30cm → Esq 90° → Frente 30cm → Depositar' },
    roboInicio:{ x:55, y:170, angulo:0 },
    polens:[ {x:185,y:90}, {x:185,y:250} ],
    colmeia:{ x:293, y:135, largura:64, altura:58 },
    paredes:[
      {x:0,y:0,l:LARGURA_CAMPO,a:14},{x:0,y:ALTURA_CAMPO-14,l:LARGURA_CAMPO,a:14},
      {x:0,y:0,l:14,a:ALTURA_CAMPO},{x:LARGURA_CAMPO-14,y:0,l:14,a:ALTURA_CAMPO},
      {x:135,y:115,l:14,a:110},
    ], metaPolen:2
  },
  3: {
    nome: 'Enxame Total',
    intro:{ numero:'FASE 3 DE 5', titulo:'ENXAME TOTAL 🐝🐝',
      descricao:'Cinco pollens! Colete 3 para passar de fase.',
      objetivo:'Colete pelo menos 3 dos 5 pollens e deposite na colmeia.',
      dica:'💡 Intake ON → Frente 60cm → Dir 90° → Frente 30cm → Dir 90° → Frente 30cm → Dir 180° → Frente 30cm → Esq 90° → Frente 30cm → Dir 90° → Frente 30cm → Depositar' },
    roboInicio:{ x:48, y:170, angulo:0 },
    polens:[ {x:148,y:95},{x:218,y:95},{x:183,y:170},{x:148,y:245},{x:218,y:245} ],
    colmeia:{ x:295, y:140, largura:60, altura:60 },
    paredes:[
      {x:0,y:0,l:LARGURA_CAMPO,a:14},{x:0,y:ALTURA_CAMPO-14,l:LARGURA_CAMPO,a:14},
      {x:0,y:0,l:14,a:ALTURA_CAMPO},{x:LARGURA_CAMPO-14,y:0,l:14,a:ALTURA_CAMPO},
      {x:100,y:14,l:14,a:68},{x:100,y:258,l:14,a:68},
      {x:270,y:14,l:14,a:68},{x:270,y:258,l:14,a:68},
    ], metaPolen:3
  },
  4: {
    nome: 'Modo Sensor',
    intro:{ numero:'FASE 4 DE 5', titulo:'MODO SENSOR 👁',
      descricao:'Use blocos condicionais para lógica inteligente!',
      objetivo:'Use detectores para coletar pelo menos 2 pollens.',
      dica:'💡 Intake ON → Frente 60cm → Dir 45° → Frente 30cm → Esq 45° → Frente 30cm → Esq 90° → Frente 30cm → Dir 180° → Frente 30cm → Depositar' },
    roboInicio:{ x:48, y:170, angulo:0 },
    polens:[ {x:158,y:130},{x:248,y:210},{x:318,y:130} ],
    colmeia:{ x:293, y:238, largura:64, altura:58 },
    paredes:[
      {x:0,y:0,l:LARGURA_CAMPO,a:14},{x:0,y:ALTURA_CAMPO-14,l:LARGURA_CAMPO,a:14},
      {x:0,y:0,l:14,a:ALTURA_CAMPO},{x:LARGURA_CAMPO-14,y:0,l:14,a:ALTURA_CAMPO},
      {x:200,y:14,l:14,a:120},{x:200,y:206,l:14,a:120},
    ], metaPolen:2
  },
  5: {
    nome: 'Desafio FTC Real',
    intro:{ numero:'FASE FINAL ⚡', titulo:'DESAFIO FTC 🏆',
      descricao:'Campo completo! Navegue pelo labirinto e colete 4+ pollens.',
      objetivo:'Colete pelo menos 4 dos 6 pollens. O tempo conta!',
      dica:'💡 Rota: Intake ON → Frente 60cm → Esq 90° → Frente 30cm → [navegar top] → [navegar right] → Depositar' },
    roboInicio:{ x:38, y:170, angulo:0 },
    polens:[
      {x:130,y:75},{x:210,y:75},{x:290,y:75},
      {x:130,y:265},{x:210,y:265},{x:290,y:265},
    ],
    colmeia:{ x:305, y:140, largura:54, altura:60 },
    paredes:[
      {x:0,y:0,l:LARGURA_CAMPO,a:14},{x:0,y:ALTURA_CAMPO-14,l:LARGURA_CAMPO,a:14},
      {x:0,y:0,l:14,a:ALTURA_CAMPO},{x:LARGURA_CAMPO-14,y:0,l:14,a:ALTURA_CAMPO},
      {x:90,y:14,l:14,a:110},{x:90,y:216,l:14,a:110},
      {x:170,y:120,l:14,a:100},
      {x:250,y:14,l:14,a:110},{x:250,y:216,l:14,a:110},
      {x:330,y:200,l:14,a:126},
    ], metaPolen:4
  }
};

const SOLUCOES = {
  1: [ 
    {tipo:'intake-ligar',  valor:null},
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-esquerda',valor:45  },
    {tipo:'avancar',       valor:30  },
    {tipo:'depositar',     valor:null},
  ],
  2: [ 
    {tipo:'intake-ligar',  valor:null},
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'depositar',     valor:null},
  ],
  3: [ 
    {tipo:'intake-ligar',  valor:null},
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:180 },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'depositar',     valor:null},
  ],
  4: [ 
    {tipo:'intake-ligar',  valor:null},
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-direita', valor:45  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-esquerda',valor:45  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:180 },
    {tipo:'avancar',       valor:30  },
    {tipo:'depositar',     valor:null},
  ],
  5: [ 
    {tipo:'intake-ligar',  valor:null},
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-esquerda',valor:90  },
    {tipo:'avancar',       valor:30  },
    {tipo:'virar-direita', valor:180 },
    {tipo:'avancar',       valor:60  },
    {tipo:'virar-direita', valor:180 },
    {tipo:'avancar',       valor:30  },
    {tipo:'depositar',     valor:null},
  ],
};
