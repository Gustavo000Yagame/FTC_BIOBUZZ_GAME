function inicializarCanvas() {
  canvasJogo = document.getElementById('canvas-jogo');
  ctx        = canvasJogo.getContext('2d');
}

function renderizar() {
  ctx.clearRect(0,0,LARGURA_CAMPO,ALTURA_CAMPO);
  
  ctx.fillStyle = '#C8E6C9';
  ctx.fillRect(0,0,LARGURA_CAMPO,ALTURA_CAMPO);

  ctx.strokeStyle = 'rgba(255,255,255,.45)';
  ctx.lineWidth = 1;
  for (let x=0;x<=LARGURA_CAMPO;x+=30) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ALTURA_CAMPO);ctx.stroke(); }
  for (let y=0;y<=ALTURA_CAMPO;y+=30) { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(LARGURA_CAMPO,y);ctx.stroke(); }

  ctx.strokeStyle = 'rgba(0,100,0,.18)';
  ctx.lineWidth = 1.5;
  for (let x=90;x<LARGURA_CAMPO;x+=90) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ALTURA_CAMPO);ctx.stroke(); }
  for (let y=90;y<ALTURA_CAMPO;y+=90)  { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(LARGURA_CAMPO,y);ctx.stroke(); }

  ctx.strokeStyle = '#81C784'; ctx.lineWidth = 2;
  ctx.strokeRect(14,14,LARGURA_CAMPO-28,ALTURA_CAMPO-28);

  _desenharRegua();

  if (!nivelAtual) return;
  _desenharParedes();
  _desenharColmeia();
  _desenharRastro();
  _desenharPosicaoInicial();
  _desenharPolens();
  desenharRobo();
  ctx.textAlign = 'left';
}

function _desenharRegua() {
  const CM_POR_PX = 1 / ESCALA_CM; 
  ctx.save();
  ctx.font = 'bold 8px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(0,70,0,.55)';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';
  
  for (let x = 78; x < LARGURA_CAMPO - 20; x += 78) {
    const cm = Math.round(x / ESCALA_CM);
    ctx.fillText(cm + 'cm', x, ALTURA_CAMPO - 3);
    ctx.fillStyle = 'rgba(0,70,0,.25)'; ctx.lineWidth = .7;
    ctx.beginPath(); ctx.moveTo(x, ALTURA_CAMPO-14); ctx.lineTo(x, ALTURA_CAMPO-3); ctx.stroke();
    ctx.fillStyle = 'rgba(0,70,0,.55)';
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let y = 78; y < ALTURA_CAMPO - 20; y += 78) {
    const cm = Math.round(y / ESCALA_CM);
    ctx.fillText(cm + 'cm', 3, y);
    ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(4, y); ctx.stroke();
  }
  ctx.restore();
}

function _desenharParedes() {
  for (const p of nivelAtual.paredes) {
    ctx.fillStyle = '#607D8B'; ctx.fillRect(p.x,p.y,p.l,p.a);
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(p.x,p.y,p.l,4);
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 1; ctx.strokeRect(p.x,p.y,p.l,p.a);
  }
}

function _desenharColmeia() {
  const c = nivelAtual.colmeia;
  ctx.fillStyle = 'rgba(255,183,3,.18)';
  retanguloArredondado(ctx,c.x,c.y,c.largura,c.altura,8); ctx.fill();
  ctx.strokeStyle = '#FFB703'; ctx.lineWidth = 2.5; ctx.setLineDash([5,4]);
  retanguloArredondado(ctx,c.x,c.y,c.largura,c.altura,8); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,183,3,.1)';
  for (let dy=0;dy<c.altura;dy+=15) for (let dx=0;dx<c.largura;dx+=17)
    desenharHexagono(ctx,c.x+dx+(dy%30===0?0:8),c.y+dy,6);
  ctx.fillStyle='#E65100'; ctx.font='bold 11px Nunito,sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('🍯',c.x+c.largura/2,c.y+c.altura/2-7);
  ctx.font='bold 9px Nunito,sans-serif';
  ctx.fillText(depositado+' ✓',c.x+c.largura/2,c.y+c.altura/2+8);
  ctx.textBaseline='alphabetic';
}

function _desenharRastro() {
  if (robo.caminho.length < 2) return;
  ctx.strokeStyle='rgba(76,151,255,.35)'; ctx.lineWidth=2.5; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(robo.caminho[0].x,robo.caminho[0].y);
  for (let i=1;i<robo.caminho.length;i++) ctx.lineTo(robo.caminho[i].x,robo.caminho[i].y);
  ctx.stroke(); ctx.setLineDash([]);
}

function _desenharPosicaoInicial() {
  const ini = nivelAtual.roboInicio;
  ctx.strokeStyle='rgba(76,151,255,.2)'; ctx.lineWidth=1.5; ctx.setLineDash([2,2]);
  ctx.strokeRect(ini.x-LARGURA_ROBO/2,ini.y-ALTURA_ROBO/2,LARGURA_ROBO,ALTURA_ROBO);
  ctx.setLineDash([]);
}

function _desenharPolens() {
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for (const p of polensNoCampo) {
    if (p.coletado) continue;
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.arc(p.x+2,p.y+2,RAIO_POLLEN,0,6.28); ctx.fill();
    ctx.fillStyle='#FFD600'; ctx.beginPath(); ctx.arc(p.x,p.y,RAIO_POLLEN,0,6.28); ctx.fill();
    ctx.strokeStyle='#F9A825'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#7A5200'; ctx.font='bold 10px sans-serif'; ctx.fillText('✿',p.x,p.y);
  }
  ctx.textBaseline='alphabetic';
}

function desenharRobo() {
  ctx.save();
  ctx.translate(robo.x,robo.y);
  ctx.rotate(robo.angulo*Math.PI/180);
  if (robo.intakeAtivo) {
    ctx.strokeStyle='rgba(89,192,89,.5)'; ctx.lineWidth=1.5;
    for (let i=0;i<3;i++) { ctx.beginPath(); ctx.arc(LARGURA_ROBO/2+2+i*5,0,3,-Math.PI/2,Math.PI/2); ctx.stroke(); }
  }
  ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(-LARGURA_ROBO/2+2,-ALTURA_ROBO/2+2,LARGURA_ROBO,ALTURA_ROBO);
  ctx.fillStyle=robo.intakeAtivo?'#1565C0':'#1976D2';
  retanguloArredondado(ctx,-LARGURA_ROBO/2,-ALTURA_ROBO/2,LARGURA_ROBO,ALTURA_ROBO,4); ctx.fill();
  ctx.strokeStyle='#BBDEFB'; ctx.lineWidth=1.5;
  retanguloArredondado(ctx,-LARGURA_ROBO/2,-ALTURA_ROBO/2,LARGURA_ROBO,ALTURA_ROBO,4); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.2)';
  retanguloArredondado(ctx,-LARGURA_ROBO/2+2,-ALTURA_ROBO/2+2,LARGURA_ROBO-4,ALTURA_ROBO/3,2); ctx.fill();
  ctx.fillStyle='#BBDEFB'; ctx.beginPath();
  ctx.moveTo(LARGURA_ROBO/2-1,-4); ctx.lineTo(LARGURA_ROBO/2+7,0); ctx.lineTo(LARGURA_ROBO/2-1,4); ctx.closePath(); ctx.fill();
  if (robo.polens>0) {
    ctx.fillStyle='#FFD600'; ctx.font='bold 8px Nunito,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('+'+robo.polens,0,0); ctx.textBaseline='alphabetic';
  }
  if (robo.intakeAtivo) { ctx.fillStyle='#59C059'; ctx.beginPath(); ctx.arc(-LARGURA_ROBO/2+4,-ALTURA_ROBO/2+4,3,0,6.28); ctx.fill(); }
  ctx.restore();
}

function retanguloArredondado(ctx,x,y,l,a,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+l-r,y); ctx.quadraticCurveTo(x+l,y,x+l,y+r);
  ctx.lineTo(x+l,y+a-r); ctx.quadraticCurveTo(x+l,y+a,x+l-r,y+a);
  ctx.lineTo(x+r,y+a); ctx.quadraticCurveTo(x,y+a,x,y+a-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

function desenharHexagono(ctx,cx,cy,r) {
  ctx.beginPath();
  for (let i=0;i<6;i++) { const a=(Math.PI/3)*i-Math.PI/6; if(i===0)ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)); else ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a)); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(255,183,3,.18)'; ctx.lineWidth=.5; ctx.stroke();
}

const ESCALA_CM = 2.6;
