function moverRobo(distancia, direcao) {
  return new Promise(res => { cmdMover = { restante: distancia*2.6, direcao, resolver: res }; });
}
function girarRobo(graus, direcao) {
  return new Promise(res => { cmdGirar = { restante: Math.abs(graus), direcao, resolver: res }; });
}
function aguardar(seg) {
  return new Promise(res => setTimeout(res, seg*1000));
}

function aguardarPasso() {
  return new Promise(res => {
    resolverStep   = res;
    aguardandoPasso = true;
    _atualizarVisualStep(true);
  });
}
function _atualizarVisualStep(esperando) {
  const btn = document.getElementById('btn-passo');
  if (!btn) return;
  if (esperando) {
    btn.style.background    = '#4C97FF';
    btn.style.color         = '#fff';
    btn.style.borderColor   = '#4C97FF';
    btn.textContent         = '⏭ AVANÇAR';
    btn.disabled            = false;
  } else {
    btn.style.background  = '';
    btn.style.color       = '';
    btn.style.borderColor = '';
    btn.textContent       = '⏭';
  }
}

async function executarBloco(bloco) {
  if (solicitarParada) return;
  switch (bloco.tipo) {
    case 'avancar':         await moverRobo(bloco.valor||60,  1); break;
    case 'recuar':          await moverRobo(bloco.valor||60, -1); break;
    case 'virar-direita':   await girarRobo(bloco.valor||90,  1); break;
    case 'virar-esquerda':  await girarRobo(bloco.valor||90, -1); break;
    case 'parar':           await aguardar(.12); break;
    case 'intake-ligar':    robo.intakeAtivo=true;  await aguardar(.08); break;
    case 'intake-desligar': robo.intakeAtivo=false; await aguardar(.08); break;
    case 'depositar':
      if (naColmeia() && robo.polens>0) { depositado+=robo.polens; robo.polens=0; }
      await aguardar(.2); break;
    case 'esperar':         await aguardar(bloco.valor||1); break;
  }
}

async function executarLista(lista, prof) {
  if (prof>15) return;
  let i=0;
  while (i<lista.length && !solicitarParada) {
    const b = lista[i];
    blocoAtivoIdx = blocos.indexOf(b);
    destacarBloco();

    if (b.tipo==='se-pollen-proximo') { if (!pollenProximo()) i++; i++; continue; }
    if (b.tipo==='se-parede-proxima') { if (!paredeProxima()) i++; i++; continue; }
    if (b.tipo==='se-na-colmeia')     { if (!naColmeia())     i++; i++; continue; }

    if (b.tipo==='repetir') {
      const vezes=b.valor||3; let p2=1,j=i+1;
      while (j<lista.length && p2>0) {
        if (lista[j].tipo==='repetir')    p2++;
        if (lista[j].tipo==='fim-repetir') p2--;
        if (p2>0) j++;
      }
      const inner=lista.slice(i+1,j);
      for (let r=0;r<vezes&&!solicitarParada;r++) await executarLista(inner,prof+1);
      i=j+1; continue;
    }
    if (b.tipo==='fim-repetir') { i++; continue; }

    if (modoStep) await aguardarPasso();
    if (solicitarParada) break;

    await executarBloco(b);
    i++;
  }
}

async function executarPrograma() {
  
  if (!faseIniciada) {
    definirStatus('', '⚠ Clique em "Começar!" primeiro');
    return;
  }
  solicitarParada=false; estadoExecucao='executando';
  robo.colisoes=0; depositado=0; tempoDecorrido=0;
  atualizarControles();
  definirStatus('executando','🟢 Executando...');
  const t0=performance.now();
  await executarLista(blocos,0);
  tempoExecucao=(performance.now()-t0)/1000;
  aguardandoPasso=false;
  _atualizarVisualStep(false);
  if (!solicitarParada) {
    estadoExecucao='concluido'; blocoAtivoIdx=-1;
    destacarBloco(); atualizarControles();
    definirStatus('concluido','🔵 Concluído');
    mostrarResultado();
  } else {
    definirStatus('','⚪ Parado');
  }
}
