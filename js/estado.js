let faseAtual       = 1;
let pontuacaoTotal  = 0;
let estadoExecucao  = 'parado'; 
let faseIniciada    = false;    

let robo = { x:0, y:0, angulo:0, polens:0, intakeAtivo:false,
             caminho:[], colisoes:0, timerCaminho:0 };

let nivelAtual     = null;
let polensNoCampo  = [];
let depositado     = 0;
let tempoDecorrido = 0;
let tempoExecucao  = 0;

let blocos         = [];
let blocoAtivoIdx  = -1;
let contadorId     = 0;

let solicitarParada  = false;
let modoStep         = false;
let resolverStep     = null;
let aguardandoPasso  = false; 

let cmdMover  = null;
let cmdGirar  = null;

let ultimoTimestamp = 0;

let idxDrag         = null;
let idxDragOver     = null; 

let canvasJogo = null;
let ctx        = null;
