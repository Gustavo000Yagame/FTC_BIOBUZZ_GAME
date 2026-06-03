
let faseAtual=1, pontuacaoTotal=0, estadoExecucao='parado', faseIniciada=false;
let robo={x:0,y:0,angulo:0,polens:0,intakeAtivo:false,caminho:[],colisoes:0,timerCaminho:0};
let nivelAtual=null, polensNoCampo=[], depositado=0, tempoDecorrido=0, tempoExecucao=0;
let solicitarParada=false, modoStep=false, resolverStep=null, aguardandoPasso=false;
let cmdMover=null, cmdGirar=null, ultimoTimestamp=0;
let canvasJogo=null, ctx=null;
