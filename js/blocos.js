
let workspaceBlockly = null;

function definirBlocos() {
  Blockly.Blocks['robot_avancar'] = { init() {
    this.appendDummyInput().appendField('▶ Frente').appendField(new Blockly.FieldNumber(1,0.1,60,0.1),'TEMPO').appendField('S');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#4C97FF');
  }};
  Blockly.Blocks['robot_recuar'] = { init() {
    this.appendDummyInput().appendField('◀ Trás').appendField(new Blockly.FieldNumber(1,0.1,60,0.1),'TEMPO').appendField('S');
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
  Blockly.Blocks['robot_intake_on'] = { init() {
    this.appendDummyInput().appendField('⚡ Intake ON');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FF8000');
  }};
  Blockly.Blocks['robot_lancar'] = { init() {
    this.appendDummyInput().appendField('🚀 Lançar');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FF8000');
  }};
  Blockly.Blocks['robot_intake_off'] = { init() {
    this.appendDummyInput().appendField('○ Intake OFF');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#FF8000');
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
    ]},
    { kind:'category', name:'🐝 Ações', colour:'#FF8000', contents:[
      { kind:'block', type:'robot_intake_on' },
      { kind:'block', type:'robot_intake_off' },
      { kind:'block', type:'robot_lancar' },
    ]},
    { kind:'category', name:'🔁 Controle', colour:'#FFAB19', contents:[
      { kind:'block', type:'controls_repeat_ext',
        inputs:{ TIMES:{ block:{ type:'math_number', fields:{ NUM:3 } } } } },
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
