function novoBloco(tipo) {
  const def = DEF_BLOCOS[tipo]; if (!def) return null;
  return { id:'b'+(++contadorId), tipo, valor: def.opcoes?def.opcoes[0]:null };
}

function adicionarBloco(tipo) {
  const b = novoBloco(tipo); if (!b) return;
  blocos.push(b);
  renderizarEspaco();
  Sons.tocar('bloco', 0.6); 
}

function removerBloco(idx) { blocos.splice(idx,1); renderizarEspaco(); }

function moverBloco(idx, dir) {
  const j=idx+dir; if (j<0||j>=blocos.length) return;
  [blocos[idx],blocos[j]]=[blocos[j],blocos[idx]]; renderizarEspaco();
}

function limparEspaco() { blocos=[]; renderizarEspaco(); }

function renderizarEspaco() {
  const espaco = document.getElementById('espaco-trabalho');
  Array.from(espaco.children).forEach(el=>{ if(el.id!=='espaco-vazio') el.remove(); });
  document.getElementById('espaco-vazio').style.display  = blocos.length?'none':'flex';
  document.getElementById('contador-blocos').textContent = blocos.length+(blocos.length===1?' bloco':' blocos');
  let recuo=0;
  blocos.forEach((b,i) => {
    const def = DEF_BLOCOS[b.tipo]; if (!def) return;
    if (b.tipo==='fim-repetir') recuo=Math.max(0,recuo-1);
    const el = _criarElementoBloco(b,def,i,recuo);
    espaco.appendChild(el);
    if (b.tipo==='repetir') recuo++;
  });
}

function _criarElementoBloco(bloco, def, idx, recuo) {
  const el = document.createElement('div');
  el.className = ['bloco-espaco', def.categoria,
    bloco.tipo==='repetir'?'abre-repeticao':'',
    bloco.tipo==='fim-repetir'?'fecha-repeticao':'',
    idx===blocoAtivoIdx?'ativo':'',
  ].filter(Boolean).join(' ');
  el.dataset.idx = idx;
  el.draggable   = true;
  el.style.marginLeft = (recuo*14)+'px';

  const su=document.createElement('button'); su.className='btn-mover-bloco'; su.textContent='▲'; su.title='Mover para cima';    su.onclick=e=>{e.stopPropagation();moverBloco(idx,-1);};
  const sd=document.createElement('button'); sd.className='btn-mover-bloco'; sd.textContent='▼'; sd.title='Mover para baixo'; sd.onclick=e=>{e.stopPropagation();moverBloco(idx,1);};
  el.append(su,sd);

  const notch=document.createElement('span'); notch.className='notch-espaco'; el.appendChild(notch);

  const label=document.createElement('span');
  label.className='label-bloco';
  label.textContent=def.rotulo;
  label.title='Clique para mudar tipo de bloco';
  label.style.cursor='pointer';
  label.onclick=e=>{e.stopPropagation(); abrirSeletorTipo(bloco,idx,el);};
  el.appendChild(label);

  if (def.chaveParam && def.opcoes) {
    const inp=document.createElement('input');
    inp.type='number'; inp.className='input-bloco';
    inp.min=def.opcoes[0]; inp.max=def.opcoes[def.opcoes.length-1];
    inp.step=def.opcoes.length>1?def.opcoes[1]-def.opcoes[0]:1;
    inp.value=bloco.valor??def.opcoes[0];
    inp.title=def.chaveParam+' ('+def.unidade+')';
    inp.onchange=e=>{
      const v=parseFloat(e.target.value);
      bloco.valor=isNaN(v)?def.opcoes[0]:Math.min(inp.max,Math.max(inp.min,v));
      inp.value=bloco.valor;
    };
    inp.onclick=e=>e.stopPropagation();
    const unit=document.createElement('span'); unit.className='unit-bloco'; unit.textContent=def.unidade||'';
    el.append(inp,unit);
  }

  const del=document.createElement('button'); del.className='btn-remover-bloco'; del.innerHTML='&times;';
  del.onclick=e=>{e.stopPropagation();removerBloco(idx);}; el.appendChild(del);

  el.ondragstart=e=>{
    idxDrag=idx;
    e.dataTransfer.setData('text','espaco');
    setTimeout(()=>el.classList.add('arrastando'),0);
  };
  el.ondragend=()=>{
    el.classList.remove('arrastando');
    document.querySelectorAll('.bloco-espaco').forEach(b=>b.classList.remove('drop-acima','drop-abaixo'));
    idxDrag=null;
  };
  el.ondragover=e=>{
    e.preventDefault();
    if (idxDrag===null||idxDrag===idx) return;
    document.querySelectorAll('.bloco-espaco').forEach(b=>b.classList.remove('drop-acima','drop-abaixo'));
    const meio=el.getBoundingClientRect().top+el.offsetHeight/2;
    el.classList.add(e.clientY<meio?'drop-acima':'drop-abaixo');
  };
  el.ondragleave=()=>el.classList.remove('drop-acima','drop-abaixo');
  el.ondrop=e=>{
    e.preventDefault();
    el.classList.remove('drop-acima','drop-abaixo');
    if (e.dataTransfer.getData('text')==='espaco' && idxDrag!==null && idxDrag!==idx) {
      const meio=el.getBoundingClientRect().top+el.offsetHeight/2;
      const insertAfter=e.clientY>=meio;
      const [mv]=blocos.splice(idxDrag,1);
      const newIdx=blocos.indexOf(blocos[idx-(idxDrag<idx?1:0)]);
      const target=idx-(idxDrag<idx?1:0)+(insertAfter?1:0);
      blocos.splice(Math.max(0,Math.min(blocos.length,target)),0,mv);
      idxDrag=null;
      renderizarEspaco();
    }
  };

  return el;
}

let _seletorAberto = null;

function abrirSeletorTipo(bloco, idx, elRef) {
  fecharSeletorTipo();
  const popup = document.createElement('div');
  popup.id = 'seletor-tipo';
  popup.className = 'seletor-tipo-popup';

  const titulo = document.createElement('div');
  titulo.className = 'seletor-titulo'; titulo.textContent = '↕ Mudar tipo de bloco:';
  popup.appendChild(titulo);

  const cats = {};
  Object.entries(DEF_BLOCOS).forEach(([tipo,d])=>{
    if(!cats[d.categoria]) cats[d.categoria]={};
    cats[d.categoria][tipo]=d;
  });

  const nomeCat={'movimento':'🚗 Movimento','acao':'🐝 Ações','sensor':'👁 Sensores','logica':'🔁 Lógica'};
  Object.entries(cats).forEach(([cat,tipos])=>{
    const sec=document.createElement('div'); sec.className='seletor-sec';
    const lbl=document.createElement('div'); lbl.className='seletor-sec-lbl'; lbl.textContent=nomeCat[cat]||cat;
    sec.appendChild(lbl);
    Object.entries(tipos).forEach(([tipo,d])=>{
      const btn=document.createElement('button');
      btn.className='seletor-opt '+cat+(tipo===bloco.tipo?' seletor-ativo':'');
      btn.textContent=d.rotulo;
      btn.onclick=e=>{
        e.stopPropagation();
        bloco.tipo=tipo;
        bloco.valor=d.opcoes?d.opcoes[0]:null;
        fecharSeletorTipo();
        renderizarEspaco();
      };
      sec.appendChild(btn);
    });
    popup.appendChild(sec);
  });

  document.body.appendChild(popup);
  _seletorAberto=popup;

  const r=elRef.getBoundingClientRect();
  popup.style.left=Math.min(r.left,window.innerWidth-220)+'px';
  popup.style.top=(r.bottom+4)+'px';

  setTimeout(()=>document.addEventListener('click',fecharSeletorTipo,{once:true}),10);
}

function fecharSeletorTipo() {
  if (_seletorAberto) { _seletorAberto.remove(); _seletorAberto=null; }
}

function destacarBloco() {
  document.querySelectorAll('.bloco-espaco').forEach((el,i)=>el.classList.toggle('ativo',i===blocoAtivoIdx));
}
