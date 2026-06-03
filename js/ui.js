
function carregarFase(num){
  faseAtual=num; nivelAtual=FASES[num];
  polensNoCampo=nivelAtual.polens.map(p=>({...p,coletado:false}));
  faseIniciada=false;
  reiniciarRobo();
  document.getElementById('numero-fase-atual').textContent=num;
  document.getElementById('label-fase-simulacao').textContent='Fase '+num+' — '+nivelAtual.nome;
  document.querySelectorAll('.aba-fase').forEach(el=>el.classList.toggle('ativa',+el.dataset.fase===num));
  mostrarIntro();
}

function reiniciarRobo(){
  const s=nivelAtual.roboInicio;
  robo={x:s.x,y:s.y,angulo:s.angulo,polens:0,intakeAtivo:false,
        caminho:[{x:s.x,y:s.y}],colisoes:0,timerCaminho:0};
  polensNoCampo=nivelAtual.polens.map(p=>({...p,coletado:false}));
  depositado=0; tempoDecorrido=0; estadoExecucao='parado';
  blocoAtivoBlocklyId=null; solicitarParada=true; cmdMover=null; cmdGirar=null; aguardandoPasso=false;
  if(workspaceBlockly) workspaceBlockly.highlightBlock(null);
  setTimeout(()=>{solicitarParada=false;},60);
  atualizarControles(); atualizarHUD(); definirStatus('','⚪ Parado');
}

function mostrarIntro(){
  const d=nivelAtual.intro;
  document.getElementById('intro-numero').textContent=d.numero;
  document.getElementById('intro-titulo').textContent=d.titulo;
  document.getElementById('intro-descricao').textContent=d.descricao;
  document.getElementById('intro-objetivo').innerHTML='<strong>🎯 Objetivo:</strong> '+d.objetivo;
  document.getElementById('intro-dica').textContent=d.dica;
  document.getElementById('tela-intro').classList.add('visivel');
}

function mostrarResultado(){
  const pl=depositado,meta=nivelAtual.metaPolen,tm=tempoExecucao,co=robo.colisoes;
  const ok=pl>=meta;
  const pts=Math.max(0,Math.round(pl*100-co*30+(tm<10?80:tm<20?40:0)));
  pontuacaoTotal+=pts;
  document.getElementById('pontuacao-total').textContent=pontuacaoTotal;
  if(ok&&faseAtual===5) Sons.tocar('ultimaFase');
  else if(ok)           Sons.tocar('faseVencida');
  else                  Sons.tocar('fasePerdida');
  document.getElementById('resultado-titulo').textContent=ok?'🎯 Missão Completa!':'⚠ Missão Incompleta';
  document.getElementById('resultado-nome-fase').textContent='Fase '+faseAtual+' — '+nivelAtual.nome;
  _stat('resultado-polens',pl+'/'+meta,pl>=meta?'bom':pl>0?'ok':'ruim');
  _stat('resultado-tempo',tm.toFixed(1)+'s',tm<12?'bom':tm<22?'ok':'ruim');
  _stat('resultado-colisoes',co,co===0?'bom':co<3?'ok':'ruim');
  document.getElementById('resultado-pontos').textContent=pts;
  let msg='';
  if(!ok) msg=`<strong>Precisou de mais ${meta-pl} pollen(s).</strong><br>${nivelAtual.intro.dica}`;
  else if(co>2) msg=`<strong>Objetivo cumprido!</strong> Mas ${co} colisões — tente rota mais suave.`;
  else if(tm>22) msg=`<strong>Pollen entregue!</strong> Use loops para ganhar tempo.`;
  else msg=`<strong>Execução perfeita!</strong> Rota eficiente e sem colisões!`;
  document.getElementById('resultado-mensagem').innerHTML=msg;
  const nx=document.getElementById('btn-proxima-fase');
  nx.disabled=faseAtual>=5; nx.textContent=faseAtual>=5?'🏆 Campeão FTC!':'Próxima Fase ▶';
  document.getElementById('tela-resultado').classList.add('visivel');
}

function _stat(id,val,cls){const el=document.getElementById(id);el.textContent=val;el.className='valor-stat '+cls;}

function atualizarHUD(){
  document.getElementById('hud-polens').textContent=robo.polens;
  document.getElementById('hud-tempo').textContent=tempoDecorrido.toFixed(1)+'s';
  document.getElementById('hud-colisoes').textContent=robo.colisoes;
  const ie=document.getElementById('hud-intake');
  ie.textContent=robo.intakeAtivo?'ON':'OFF';
  ie.className='valor-hud '+(robo.intakeAtivo?'verde':'');
}

function definirStatus(cls,txt){
  const el=document.getElementById('status-programa');
  el.className='status-programa '+(cls||''); el.textContent=txt;
}

function atualizarControles(){
  const exec=estadoExecucao==='executando';
  const introVis=document.getElementById('tela-intro').classList.contains('visivel');
  const resVis=document.getElementById('tela-resultado').classList.contains('visivel');
  const bloqueado=!faseIniciada||introVis||resVis;
  document.getElementById('btn-executar').disabled=exec||bloqueado;
  document.getElementById('btn-passo').disabled=bloqueado||(exec&&!aguardandoPasso);
}

const TEXTOS_DICA={
  1:'Ative o intake para coletar pollen ao passar por cima. Vá até a colmeia e deposite.',
  2:'Use Girar para mudar de direção e desviar da parede central.',
  3:'Use REPETIR para executar o mesmo trecho várias vezes.',
  4:'Conecte o bloco "🌸 pollen próximo?" dentro do bloco SE para coleta condicional.',
  5:'Planeje a rota antes! Cada colisão custa 30 pontos.',
};
const PASSOS_DICA={
  1:['1. ⚡ Intake ON','2. ▶ Frente 60 un','3. ↺ Girar Esq 45°','4. ▶ Frente 30 un','5. 💛 Depositar'],
  2:['1. ⚡ Intake ON','2. ↺ Esq 90° → ▶ 30','3. ↻ Dir 90° → ▶ 60 (pollen cima)','4. ↻ Dir 90° → ▶ 60 (pollen baixo)','5. ↺ Esq 90° → ▶ 30 → ↺ Esq 90° → ▶ 30','6. 💛 Depositar'],
  3:['1. ⚡ Intake ON → ▶ 60 (centro)','2. ↻ 90° → ▶ 30 (baixo-dir)','3. ↻ 90° → ▶ 30 (baixo-esq)','4. ↻ 180° → ▶ 30 → ↺ 90° → ▶ 30','5. ↻ 90° → ▶ 30 → 💛 Depositar'],
  4:['1. ⚡ Intake ON → ▶ 60','2. ↻ Dir 45° → ▶ 30 (pollen cen)','3. ↺ Esq 45° → ▶ 30','4. ↺ Esq 90° → ▶ 30 (pollen dir)','5. ↻ Dir 180° → ▶ 30 → 💛 Depositar'],
  5:['1. ⚡ Intake ON → ▶ 60','2. ↺ Esq 90° → ▶ 30 (pollen1)','3. ↻ Dir 90° → ▶ 30+30 (pollen2)','4. ↻ Dir 90° → ▶ 30 → ↺ Esq 90° → ▶ 30+30','5. ↻ Dir 180° → ▶ 60 → ↻ Dir 180° → ▶ 30','6. 💛 Depositar'],
};

function mostrarDica(){
  const popup=document.getElementById('popup-dica');
  const btn=document.getElementById('btn-dica');
  if(popup.classList.contains('visivel')){popup.classList.remove('visivel');return;}
  document.getElementById('popup-texto-dica').textContent=TEXTOS_DICA[faseAtual];
  const cod=document.getElementById('popup-codigo-dica');
  cod.innerHTML=PASSOS_DICA[faseAtual].map(p=>`<span class="linha-codigo-dica">${p}</span>`).join('');
  const r=btn.getBoundingClientRect();
  popup.style.top=(r.bottom+8)+'px';
  popup.style.left=Math.max(8,r.left-10)+'px';
  popup.classList.add('visivel');
}
