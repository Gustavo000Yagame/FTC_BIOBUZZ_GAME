function colisaoParede(nx, ny) {
  const mL = LARGURA_ROBO / 2, mA = ALTURA_ROBO / 2;
  if (nx-mL<14 || nx+mL>LARGURA_CAMPO-14 || ny-mA<14 || ny+mA>ALTURA_CAMPO-14) return true;
  for (const p of nivelAtual.paredes)
    if (nx+mL>p.x && nx-mL<p.x+p.l && ny+mA>p.y && ny-mA<p.y+p.a) return true;
  return false;
}

function verificarColeta() {
  if (!robo.intakeAtivo) return;
  for (const p of polensNoCampo) {
    if (!p.coletado && Math.hypot(robo.x-p.x, robo.y-p.y) < RAIO_COLETA) {
      p.coletado = true; robo.polens++; break;
    }
  }
}

function pollenProximo() {
  for (const p of polensNoCampo)
    if (!p.coletado && Math.hypot(robo.x-p.x, robo.y-p.y) < RAIO_COLETA*1.6) return true;
  return false;
}

function paredeProxima() {
  const r = robo.angulo * Math.PI / 180;
  return colisaoParede(robo.x+Math.cos(r)*45, robo.y+Math.sin(r)*45);
}

function naColmeia() {
  const c = nivelAtual.colmeia;
  return robo.x>c.x-RAIO_DEPOSITO && robo.x<c.x+c.largura+RAIO_DEPOSITO &&
         robo.y>c.y-RAIO_DEPOSITO && robo.y<c.y+c.altura+RAIO_DEPOSITO;
}
