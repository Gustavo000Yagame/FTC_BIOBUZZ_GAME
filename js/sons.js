const Sons = (() => {
  const cache = {};
  const BASE   = 'assets/sons/';

  function carregar(nome, arquivo) {
    const audio = new Audio(BASE + arquivo);
    audio.preload = 'auto';
    cache[nome]  = audio;
  }

  function tocar(nome, volume = 1) {
    const original = cache[nome];
    if (!original) return;
    try {
      
      const clone = original.cloneNode();
      clone.volume = Math.min(1, Math.max(0, volume));
      clone.play().catch(() => {});
    } catch(_) {}
  }

  carregar('bloco',         'bloco-colocado.mp3');
  carregar('fasePerdida',   'fase-perdida.mp3');
  carregar('faseVencida',   'fase-vencida.mp3');
  carregar('ultimaFase',    'ultima-fase.mp3');

  return { tocar };
})();
