function atualizar(dt) {
  if (estadoExecucao!=='executando') return;
  tempoDecorrido+=dt;
  if (cmdMover) {
    const passo=Math.min(VELOCIDADE_ROBO*dt,cmdMover.restante);
    const rad=robo.angulo*Math.PI/180;
    const nx=robo.x+Math.cos(rad)*passo*cmdMover.direcao;
    const ny=robo.y+Math.sin(rad)*passo*cmdMover.direcao;
    if (colisaoParede(nx,ny)) { robo.colisoes++; cmdMover.restante=0; }
    else { robo.x=nx; robo.y=ny; cmdMover.restante-=passo; }
    robo.timerCaminho+=dt;
    if (robo.timerCaminho>INTERVALO_CAMINHO) { robo.caminho.push({x:robo.x,y:robo.y}); robo.timerCaminho=0; }
    verificarColeta();
    if (cmdMover.restante<=0.5) { const r=cmdMover.resolver; cmdMover=null; r(); }
  } else if (cmdGirar) {
    const passo=Math.min(VELOCIDADE_GIRO*dt,cmdGirar.restante);
    robo.angulo+=passo*cmdGirar.direcao; cmdGirar.restante-=passo;
    if (cmdGirar.restante<=0.5) { const r=cmdGirar.resolver; cmdGirar=null; r(); }
  }
}

function loopJogo(ts) {
  const dt=Math.min((ts-ultimoTimestamp)/1000,.05);
  ultimoTimestamp=ts;
  atualizar(dt); renderizar(); atualizarHUD();
  requestAnimationFrame(loopJogo);
}

function iniciarVideoIntro() {
  const overlay  = document.getElementById('video-overlay');
  const video    = document.getElementById('intro-video');
  const skipBtn  = document.getElementById('btn-pular-video');
  const pulso    = document.getElementById('video-pulso');

  if (!overlay || !video) { inicializar(); return; }

  function encerrarVideo() {
    overlay.style.transition='opacity .8s ease';
    overlay.style.opacity='0';
    setTimeout(()=>{ overlay.remove(); inicializar(); }, 850);
  }

  video.addEventListener('ended',   encerrarVideo, {once:true});
  skipBtn.addEventListener('click',  encerrarVideo, {once:true});
  overlay.addEventListener('click',  encerrarVideo, {once:true});

  let vis=true;
  setInterval(()=>{ pulso.style.opacity=vis?'1':'0.2'; vis=!vis; }, 700);

  video.onerror=()=>setTimeout(encerrarVideo,300);
  setTimeout(()=>{ if(overlay.isConnected) encerrarVideo(); }, 30000);
}

function registrarEventos() {

  document.querySelectorAll('.bloco-caixa').forEach(el=>{
    el.draggable=true;
    el.ondragstart=e=>e.dataTransfer.setData('text','caixa:'+el.dataset.tipo);
    el.onclick=()=>adicionarBloco(el.dataset.tipo);
  });

  const espaco=document.getElementById('espaco-trabalho');
  espaco.ondragover=e=>{e.preventDefault(); espaco.classList.add('arraste-sobre');};
  espaco.ondragleave=()=>espaco.classList.remove('arraste-sobre');
  espaco.ondrop=e=>{
    e.preventDefault(); espaco.classList.remove('arraste-sobre');
    const d=e.dataTransfer.getData('text');
    if (d.startsWith('caixa:')) adicionarBloco(d.split(':')[1]);
  };

  document.querySelectorAll('.pilula-categoria').forEach(p=>{
    p.onclick=()=>{
      document.querySelectorAll('.pilula-categoria').forEach(x=>x.classList.remove('ativa'));
      p.classList.add('ativa');
      document.getElementById('sec-'+p.dataset.cat)?.scrollIntoView({behavior:'smooth',block:'nearest'});
    };
  });

  document.getElementById('btn-executar').onclick=()=>{
    if (!faseIniciada) { definirStatus('','⚠ Clique em "Começar!" para iniciar a fase'); return; }
    if (document.getElementById('tela-resultado').classList.contains('visivel')) return;
    if (!blocos.length) { definirStatus('','⚠ Adicione blocos primeiro'); return; }
    modoStep=false; reiniciarRobo();
    setTimeout(()=>{ estadoExecucao='executando'; executarPrograma(); },60);
  };

  document.getElementById('btn-parar').onclick=()=>{
    solicitarParada=true; cmdMover=null; cmdGirar=null;
    aguardandoPasso=false;
    document.getElementById('tela-resultado').classList.remove('visivel');
    setTimeout(()=>reiniciarRobo(),80);
  };

  document.getElementById('btn-passo').onclick=()=>{
    if (document.getElementById('tela-intro').classList.contains('visivel')) return;
    if (document.getElementById('tela-resultado').classList.contains('visivel')) return;

    if (estadoExecucao==='parado' || estadoExecucao==='concluido') {
      
      if (!blocos.length) return;
      modoStep=true; reiniciarRobo();
      setTimeout(()=>{ estadoExecucao='executando'; executarPrograma(); },60);
    } else if (modoStep && aguardandoPasso && resolverStep) {
      
      aguardandoPasso=false;
      const r=resolverStep; resolverStep=null;
      _atualizarVisualStep(false);
      r();
    }
  };

  document.getElementById('btn-dica').onclick=mostrarDica;
  document.getElementById('btn-solucao').onclick=revelarSolucao;
  document.getElementById('btn-fechar-dica').onclick=()=>document.getElementById('popup-dica').classList.remove('visivel');

  document.addEventListener('click',e=>{
    if (!document.getElementById('popup-dica').contains(e.target) && e.target.id!=='btn-dica')
      document.getElementById('popup-dica').classList.remove('visivel');
  });

  document.getElementById('btn-confirmar-solucao').onclick=aplicarSolucao;
  document.getElementById('btn-cancelar-solucao').onclick=()=>document.getElementById('modal-solucao').classList.remove('visivel');
  document.getElementById('modal-solucao').onclick=e=>{
    if (e.target===document.getElementById('modal-solucao')) document.getElementById('modal-solucao').classList.remove('visivel');
  };

  document.querySelectorAll('.aba-fase').forEach(btn=>{
    btn.onclick=()=>{
      solicitarParada=true; blocos=[];
      setTimeout(()=>{renderizarEspaco(); carregarFase(+btn.dataset.fase);},80);
    };
  });

  document.getElementById('btn-comecar-fase').onclick=()=>{
    faseIniciada=true;
    document.getElementById('tela-intro').classList.remove('visivel');
    atualizarControles();
  };

  document.getElementById('btn-tentar-novamente').onclick=()=>{
    document.getElementById('tela-resultado').classList.remove('visivel');
    solicitarParada=true; setTimeout(()=>reiniciarRobo(),80);
  };

  document.getElementById('btn-proxima-fase').onclick=()=>{
    if (faseAtual<5) {
      document.getElementById('tela-resultado').classList.remove('visivel');
      blocos=[]; solicitarParada=true;
      setTimeout(()=>{renderizarEspaco(); carregarFase(faseAtual+1);},80);
    }
  };
}

function inicializar() {
  inicializarCanvas();
  registrarEventos();
  carregarFase(1);
  renderizarEspaco();
  ultimoTimestamp=performance.now();
  requestAnimationFrame(loopJogo);
}

document.addEventListener('DOMContentLoaded', iniciarVideoIntro);
