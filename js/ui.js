function carregarFase(num) {
  faseAtual=num; nivelAtual=FASES[num];
  polensNoCampo=nivelAtual.polens.map(p=>({...p,coletado:false}));
  faseIniciada=false; 
  reiniciarRobo();
  document.getElementById('numero-fase-atual').textContent=num;
  document.getElementById('label-fase-simulacao').textContent='Fase '+num+' — '+nivelAtual.nome;
  document.querySelectorAll('.aba-fase').forEach(el=>el.classList.toggle('ativa',+el.dataset.fase===num));
  mostrarIntro();
}

function reiniciarRobo() {
  const s=nivelAtual.roboInicio;
  robo={x:s.x,y:s.y,angulo:s.angulo,polens:0,intakeAtivo:false,
        caminho:[{x:s.x,y:s.y}],colisoes:0,timerCaminho:0};
  polensNoCampo=nivelAtual.polens.map(p=>({...p,coletado:false}));
  depositado=0; tempoDecorrido=0; estadoExecucao='parado'; blocoAtivoIdx=-1;
  solicitarParada=true; cmdMover=null; cmdGirar=null;
  aguardandoPasso=false;
  setTimeout(()=>{solicitarParada=false;},60);
  destacarBloco(); atualizarControles(); atualizarHUD(); definirStatus('','⚪ Parado');
}

function mostrarIntro() {
  const d=nivelAtual.intro;
  document.getElementById('intro-numero').textContent=d.numero;
  document.getElementById('intro-titulo').textContent=d.titulo;
  document.getElementById('intro-descricao').textContent=d.descricao;
  document.getElementById('intro-objetivo').innerHTML='<strong>🎯 Objetivo:</strong> '+d.objetivo;
  document.getElementById('intro-dica').textContent=d.dica;
  document.getElementById('tela-intro').classList.add('visivel');
}

function mostrarResultado() {
  const pl=depositado,meta=nivelAtual.metaPolen,tm=tempoExecucao,co=robo.colisoes;
  const ok=pl>=meta;
  const pts=Math.max(0,Math.round(pl*100-co*30+(tm<10?80:tm<20?40:0)));
  pontuacaoTotal+=pts;
  document.getElementById('pontuacao-total').textContent=pontuacaoTotal;

  if (ok && faseAtual===5) Sons.tocar('ultimaFase');
  else if (ok)             Sons.tocar('faseVencida');
  else                     Sons.tocar('fasePerdida');

  document.getElementById('resultado-titulo').textContent=ok?'🎯 Missão Completa!':'⚠ Missão Incompleta';
  document.getElementById('resultado-nome-fase').textContent='Fase '+faseAtual+' — '+nivelAtual.nome;
  _stat('resultado-polens',pl+'/'+meta,pl>=meta?'bom':pl>0?'ok':'ruim');
  _stat('resultado-tempo',tm.toFixed(1)+'s',tm<12?'bom':tm<22?'ok':'ruim');
  _stat('resultado-colisoes',co,co===0?'bom':co<3?'ok':'ruim');
  document.getElementById('resultado-pontos').textContent=pts;

  let msg='';
  if (!ok) msg=`<strong>Precisou de mais ${meta-pl} pollen(s).</strong><br>${nivelAtual.intro.dica}`;
  else if (co>2) msg=`<strong>Objetivo cumprido!</strong> Mas ${co} colisões — tente rota mais suave.`;
  else if (tm>22) msg=`<strong>Pollen entregue!</strong> Use loops para ganhar tempo.`;
  else msg=`<strong>Execução perfeita!</strong> Rota eficiente e sem colisões!`;
  document.getElementById('resultado-mensagem').innerHTML=msg;

  const nx=document.getElementById('btn-proxima-fase');
  nx.disabled=faseAtual>=5;
  nx.textContent=faseAtual>=5?'🏆 Campeão FTC!':'Próxima Fase ▶';
  document.getElementById('tela-resultado').classList.add('visivel');
}

function _stat(id,val,cls) {
  const el=document.getElementById(id); el.textContent=val; el.className='valor-stat '+cls;
}

function atualizarHUD() {
  document.getElementById('hud-polens').textContent=robo.polens;
  document.getElementById('hud-tempo').textContent=tempoDecorrido.toFixed(1)+'s';
  document.getElementById('hud-colisoes').textContent=robo.colisoes;
  const ie=document.getElementById('hud-intake');
  ie.textContent=robo.intakeAtivo?'ON':'OFF';
  ie.className='valor-hud '+(robo.intakeAtivo?'verde':'');
}

function definirStatus(cls,txt) {
  const el=document.getElementById('status-programa');
  el.className='status-programa '+(cls||''); el.textContent=txt;
}

function atualizarControles() {
  const exec=estadoExecucao==='executando';
  const introVis=document.getElementById('tela-intro').classList.contains('visivel');
  const resVis=document.getElementById('tela-resultado').classList.contains('visivel');
  const bloqueado=!faseIniciada||introVis||resVis; 

  document.getElementById('btn-executar').disabled=exec||bloqueado;
  
  document.getElementById('btn-passo').disabled=bloqueado||(exec&&!aguardandoPasso);
}

const TEXTOS_DICA={
  1:'Ative o intake para coletar pollen ao passar por cima. Depois vá até a colmeia e deposite.',
  2:'Use Girar para mudar de direção e desviar da parede. Planeje antes de executar!',
  3:'Use REPETIR para executar o mesmo trecho várias vezes e economizar blocos.',
  4:'O bloco "Se Pollen Próximo →" executa o próximo bloco apenas se houver pollen perto.',
  5:'Planeje a rota antes! Use loops e sensores. Cada colisão custa 30 pontos.',
};
const PASSOS_DICA={
  1:['1. ⚡ Intake ON','2. ▶ Frente 60cm','3. ↺ Girar Esq 45°','4. ▶ Frente 30cm','5. 💛 Depositar'],
  2:['1. ⚡ Intake ON','2. ↺ Esq 90° → ▶ 30cm','3. ↻ Dir 90° → ▶ 60cm (pollen atas)','4. ↻ Dir 90° → ▶ 60cm (pollen baixo)','5. ↺ Esq 90° → ▶ 30cm → ↺ Esq 90° → ▶ 30cm','6. 💛 Depositar'],
  3:['1. ⚡ Intake ON → ▶ 60cm (pollen centro)','2. ↻ Dir 90° → ▶ 30cm (pollen baixo-dir)','3. ↻ Dir 90° → ▶ 30cm (pollen baixo-esq)','4. ↻ Dir 180° → ▶ 30cm → ↺ Esq 90°','5. ▶ 30cm → ↻ Dir 90° → ▶ 30cm','6. 💛 Depositar'],
  4:['1. ⚡ Intake ON → ▶ 60cm','2. ↻ Dir 45° → ▶ 30cm (pollen cen)','3. ↺ Esq 45° → ▶ 30cm','4. ↺ Esq 90° → ▶ 30cm (pollen dir)','5. ↻ Dir 180° → ▶ 30cm','6. 💛 Depositar'],
  5:['1. ⚡ Intake ON → ▶ 60cm','2. ↺ Esq 90° → ▶ 30cm (pollen1)','3. ↻ Dir 90° → ▶ 30cm (pollen2)','4. ↻ Dir 90° → ▶ 30cm → ↺ Esq 90° → ▶ 30cm','5. ↺ Esq 90° → ▶ 30cm (pollen3)','6. ↻ Dir 180° → ▶ 60cm (pollen6) → ↻ Dir 180° → ▶ 30cm','7. 💛 Depositar'],
};

function mostrarDica() {
  const popup=document.getElementById('popup-dica');
  const btn=document.getElementById('btn-dica');
  if (popup.classList.contains('visivel')) { popup.classList.remove('visivel'); return; }
  document.getElementById('popup-texto-dica').textContent=TEXTOS_DICA[faseAtual];
  const cod=document.getElementById('popup-codigo-dica');
  cod.innerHTML=PASSOS_DICA[faseAtual].map(p=>`<span class="linha-codigo-dica">${p}</span>`).join('');
  const r=btn.getBoundingClientRect();
  popup.style.top=(r.bottom+8)+'px';
  popup.style.left=Math.max(8,r.left-10)+'px';
  popup.classList.add('visivel');
}

function revelarSolucao() {
  const sol=SOLUCOES[faseAtual];
  const pv=document.getElementById('previa-mini-blocos');
  pv.innerHTML='';
  sol.forEach(b=>{
    const def=DEF_BLOCOS[b.tipo]; if(!def) return;
    const m=document.createElement('span');
    m.className=`mini-bloco ${def.categoria}`;
    m.textContent=def.rotulo+(b.valor!=null?` ${b.valor}${def.unidade||''}`:'');
    pv.appendChild(m);
  });
  document.getElementById('modal-solucao').classList.add('visivel');
}

function aplicarSolucao() {
  blocos=SOLUCOES[faseAtual].map(b=>({id:'b'+(++contadorId),tipo:b.tipo,valor:b.valor}));
  solicitarParada=true; cmdMover=null; cmdGirar=null;
  setTimeout(()=>{reiniciarRobo();renderizarEspaco();},60);
  document.getElementById('modal-solucao').classList.remove('visivel');
}
