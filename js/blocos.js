
let workspaceBlockly = null;
let blocoAtivoBlocklyId = null;

function definirBlocos() {
  Blockly.Blocks['robot_avancar'] = { init() {
    this.appendDummyInput().appendField('▶ Frente').appendField(new Blockly.FieldNumber(60,1,500,1),'DISTANCIA').appendField('un');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#4C97FF');
  }};
  Blockly.Blocks['robot_recuar'] = { init() {
    this.appendDummyInput().appendField('◀ Trás').appendField(new Blockly.FieldNumber(60,1,500,1),'DISTANCIA').appendField('un');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#4C97FF');
  }};
  Blockly.Blocks['robot_virar_dir'] = { init() {
    this.appendDummyInput().appendField('↻ Girar Direita').appendField(new Blockly.FieldNumber(90,1,360,1),'GRAUS').appendField('°');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#4C97FF');
  }};
  Blockly.Blocks['robot_virar_esq'] = { init() {
    this.appendDummyInput().appendField('↺ Girar Esquerda').appendField(new Blockly.FieldNumber(90,1,360,1),'GRAUS').appendField('°');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#4C97FF');
  }};
  Blockly.Blocks['robot_parar'] = { init() {
    this.appendDummyInput().appendField('⬛ Parar');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#4C97FF');
  }};
  Blockly.Blocks['robot_intake_on'] = { init() {
    this.appendDummyInput().appendField('⚡ Intake ON');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FF8000');
  }};
  Blockly.Blocks['robot_intake_off'] = { init() {
    this.appendDummyInput().appendField('○ Intake OFF');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FF8000');
  }};
  Blockly.Blocks['robot_depositar'] = { init() {
    this.appendDummyInput().appendField('💛 Depositar');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FF8000');
  }};
  Blockly.Blocks['sensor_pollen'] = { init() {
    this.appendDummyInput().appendField('🌸 pollen próximo?');
    this.setOutput(true,'Boolean'); this.setColour('#5CB1D6');
  }};
  Blockly.Blocks['sensor_parede'] = { init() {
    this.appendDummyInput().appendField('🧱 parede à frente?');
    this.setOutput(true,'Boolean'); this.setColour('#5CB1D6');
  }};
  Blockly.Blocks['sensor_colmeia'] = { init() {
    this.appendDummyInput().appendField('🍯 na colmeia?');
    this.setOutput(true,'Boolean'); this.setColour('#5CB1D6');
  }};
  Blockly.Blocks['robot_esperar'] = { init() {
    this.appendDummyInput().appendField('⏱ Esperar').appendField(new Blockly.FieldNumber(1,0.1,60,0.1),'SEGUNDOS').appendField('s');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FFAB19');
  }};
}

const TOOLBOX_CONFIG = {
  kind:'categoryToolbox',
  contents:[
    { kind:'category', name:'🚗 Movimento', colour:'#4C97FF', contents:[
      { kind:'block', type:'robot_avancar' },
      { kind:'block', type:'robot_recuar' },
      { kind:'block', type:'robot_virar_dir' },
      { kind:'block', type:'robot_virar_esq' },
      { kind:'block', type:'robot_parar' },
    ]},
    { kind:'category', name:'🐝 Ações', colour:'#FF8000', contents:[
      { kind:'block', type:'robot_intake_on' },
      { kind:'block', type:'robot_intake_off' },
      { kind:'block', type:'robot_depositar' },
    ]},
    { kind:'category', name:'👁 Sensores', colour:'#5CB1D6', contents:[
      { kind:'block', type:'sensor_pollen' },
      { kind:'block', type:'sensor_parede' },
      { kind:'block', type:'sensor_colmeia' },
    ]},
    { kind:'category', name:'🔁 Lógica', colour:'#FFAB19', contents:[
      { kind:'block', type:'controls_repeat_ext',
        inputs:{ TIMES:{ block:{ type:'math_number', fields:{ NUM:3 } } } } },
      { kind:'block', type:'controls_if' },
      { kind:'block', type:'robot_esperar' },
    ]},
  ]
};

function inicializarBlockly() {
  definirBlocos();
  workspaceBlockly = Blockly.inject('blockly-div', {
    toolbox: TOOLBOX_CONFIG,
    grid: { spacing: 24, colour: '#E2E8F4', snap: true },
    zoom: { controls: true, wheel: true, startScale: 0.9 },
    trashcan: true,
    sounds: false,
    renderer: 'zelos',
    theme: Blockly.Theme.defineTheme('biobuzz', {
      name:'biobuzz',
      componentStyles:{ workspaceBackgroundColour:'#F9FAFB', toolboxBackgroundColour:'#fff',
        toolboxForegroundColour:'#333', flyoutBackgroundColour:'#F5F7FA',
        flyoutForegroundColour:'#333', flyoutOpacity:1,
        scrollbarColour:'#DDE3ED', insertionMarkerColour:'#4C97FF' }
    }),
  });
  workspaceBlockly.addChangeListener(ev => {
    if (ev.type === Blockly.Events.BLOCK_CREATE) Sons.tocar('bloco', 0.6);
    const n = workspaceBlockly.getAllBlocks(false).length;
    const el = document.getElementById('contador-blocos');
    if (el) el.textContent = n + (n===1?' bloco':' blocos');
  });
  // Redimensiona quando a janela muda
  window.addEventListener('resize', () => Blockly.svgResize(workspaceBlockly));
}

function limparEspaco() {
  if (workspaceBlockly) workspaceBlockly.clear();
}

function aplicarSolucao() {
  if (!workspaceBlockly) return;
  workspaceBlockly.clear();
  const xml = _gerarXML(SOLUCOES[faseAtual]);
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspaceBlockly);
  } catch(e) { console.error('Erro ao carregar solução:', e); }
  solicitarParada=true; cmdMover=null; cmdGirar=null;
  setTimeout(()=>reiniciarRobo(), 60);
  document.getElementById('modal-solucao').classList.remove('visivel');
}

function _gerarXML(sol) {
  function chain(items) {
    if (!items || !items.length) return '';
    const [b, ...resto] = items;
    if (b.tipo==='fim-repetir') return chain(resto);
    if (b.tipo==='repetir') {
      let d=1,i=0;
      while(i<resto.length&&d>0){if(resto[i].tipo==='repetir')d++;if(resto[i].tipo==='fim-repetir')d--;if(d>0)i++;}
      const inn=chain(resto.slice(0,i)), ap=chain(resto.slice(i+1));
      return `<block type="controls_repeat_ext"><value name="TIMES"><block type="math_number"><field name="NUM">${b.valor||3}</field></block></value><statement name="DO">${inn}</statement>${ap?`<next>${ap}</next>`:''}</block>`;
    }
    const SM={'se-pollen-proximo':'sensor_pollen','se-parede-proxima':'sensor_parede','se-na-colmeia':'sensor_colmeia'};
    if (SM[b.tipo]) {
      const doB=chain([resto[0]]), ap=chain(resto.slice(1));
      return `<block type="controls_if"><value name="IF0"><block type="${SM[b.tipo]}"></block></value><statement name="DO0">${doB}</statement>${ap?`<next>${ap}</next>`:''}</block>`;
    }
    const TM={
      'avancar':['robot_avancar',`<field name="DISTANCIA">${b.valor||60}</field>`],
      'recuar':['robot_recuar',`<field name="DISTANCIA">${b.valor||60}</field>`],
      'virar-direita':['robot_virar_dir',`<field name="GRAUS">${b.valor||90}</field>`],
      'virar-esquerda':['robot_virar_esq',`<field name="GRAUS">${b.valor||90}</field>`],
      'parar':['robot_parar',''],'intake-ligar':['robot_intake_on',''],
      'intake-desligar':['robot_intake_off',''],'depositar':['robot_depositar',''],
      'esperar':['robot_esperar',`<field name="SEGUNDOS">${b.valor||1}</field>`],
    };
    const e=TM[b.tipo]; if(!e) return chain(resto);
    const ap=chain(resto);
    return `<block type="${e[0]}">${e[1]}${ap?`<next>${ap}</next>`:''}</block>`;
  }
  const c = chain(sol);
  if (!c) return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
  const first = c.replace(/^<block /, '<block x="30" y="30" ');
  return `<xml xmlns="https://developers.google.com/blockly/xml">${first}</xml>`;
}

function revelarSolucao() {
  const pv=document.getElementById('previa-mini-blocos');
  pv.innerHTML='';
  SOLUCOES[faseAtual].forEach(b=>{
    const def=DEF_BLOCOS[b.tipo]; if(!def) return;
    const m=document.createElement('span');
    m.className=`mini-bloco ${def.categoria}`;
    m.textContent=def.rotulo+(b.valor!=null?` ${b.valor}`:''  );
    pv.appendChild(m);
  });
  document.getElementById('modal-solucao').classList.add('visivel');
}
