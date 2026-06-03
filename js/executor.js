
function moverRobo(dist,dir){return new Promise(res=>{cmdMover={restante:dist*2.6,direcao:dir,resolver:res};});}
function girarRobo(graus,dir){return new Promise(res=>{cmdGirar={restante:Math.abs(graus),direcao:dir,resolver:res};});}
function aguardar(s){return new Promise(res=>setTimeout(res,s*1000));}

function aguardarPasso(){
  return new Promise(res=>{
    resolverStep=res; aguardandoPasso=true;
    const btn=document.getElementById('btn-passo');
    if(btn){btn.style.background='#4C97FF';btn.style.color='#fff';btn.style.borderColor='#4C97FF';btn.textContent='⏭ AVANÇAR';btn.disabled=false;}
  });
}
function _resetStep(){
  aguardandoPasso=false;
  const btn=document.getElementById('btn-passo');
  if(btn){btn.style.background='';btn.style.color='';btn.style.borderColor='';btn.textContent='⏭';}
}

async function avaliarCondicao(bloco){
  if(!bloco) return false;
  switch(bloco.type){
    case 'sensor_pollen':  return pollenProximo();
    case 'sensor_parede':  return paredeProxima();
    case 'sensor_colmeia': return naColmeia();
    default: return false;
  }
}

async function executarArvore(bloco){
  if(!bloco||solicitarParada) return;
  blocoAtivoBlocklyId=bloco.id;
  if(workspaceBlockly) workspaceBlockly.highlightBlock(bloco.id);
  if(modoStep){ await aguardarPasso(); if(solicitarParada) return; }

  switch(bloco.type){
    case 'robot_avancar':    await moverRobo(parseFloat(bloco.getFieldValue('DISTANCIA')||60),1);  break;
    case 'robot_recuar':     await moverRobo(parseFloat(bloco.getFieldValue('DISTANCIA')||60),-1); break;
    case 'robot_virar_dir':  await girarRobo(parseFloat(bloco.getFieldValue('GRAUS')||90),1);     break;
    case 'robot_virar_esq':  await girarRobo(parseFloat(bloco.getFieldValue('GRAUS')||90),-1);    break;
    case 'robot_parar':      await aguardar(.12); break;
    case 'robot_intake_on':  robo.intakeAtivo=true;  await aguardar(.08); break;
    case 'robot_intake_off': robo.intakeAtivo=false; await aguardar(.08); break;
    case 'robot_depositar':
      if(naColmeia()&&robo.polens>0){depositado+=robo.polens;robo.polens=0;}
      await aguardar(.2); break;
    case 'robot_esperar':    await aguardar(parseFloat(bloco.getFieldValue('SEGUNDOS')||1)); break;
    case 'controls_repeat_ext':{
      const tb=bloco.getInputTargetBlock('TIMES');
      const v=tb?parseInt(tb.getFieldValue('NUM'))||3:3;
      for(let i=0;i<v&&!solicitarParada;i++) await executarArvore(bloco.getInputTargetBlock('DO'));
      break;
    }
    case 'controls_if':{
      const cond=bloco.getInputTargetBlock('IF0');
      if(await avaliarCondicao(cond)&&!solicitarParada)
        await executarArvore(bloco.getInputTargetBlock('DO0'));
      if(!await avaliarCondicao(cond)&&bloco.elseCount_&&!solicitarParada)
        await executarArvore(bloco.getInputTargetBlock('ELSE'));
      break;
    }
  }
  if(!solicitarParada) await executarArvore(bloco.getNextBlock());
}

async function executarPrograma(){
  if(!faseIniciada){definirStatus('','⚠ Clique em "Começar!" primeiro');return;}
  if(!workspaceBlockly) return;
  const tops=workspaceBlockly.getTopBlocks(true);
  if(!tops.length){definirStatus('','⚠ Adicione blocos no editor');return;}
  solicitarParada=false; estadoExecucao='executando';
  robo.colisoes=0; depositado=0; tempoDecorrido=0;
  atualizarControles(); definirStatus('executando','🟢 Executando...');
  const t0=performance.now();
  for(const b of tops){ if(solicitarParada) break; await executarArvore(b); }
  tempoExecucao=(performance.now()-t0)/1000;
  blocoAtivoBlocklyId=null;
  if(workspaceBlockly) workspaceBlockly.highlightBlock(null);
  _resetStep();
  if(!solicitarParada){
    estadoExecucao='concluido'; atualizarControles();
    definirStatus('concluido','🔵 Concluído'); mostrarResultado();
  } else { definirStatus('','⚪ Parado'); }
}
