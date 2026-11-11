function iniciarVideoIntro(){
  const overlay=document.getElementById('video-overlay');
  const video=document.getElementById('intro-video');
  const skipBtn=document.getElementById('btn-pular-video');
  if(!overlay||!video){inicializar();return;}
  let encerrando=false;
  function encerrar(){
    if(encerrando) return; encerrando=true;
    overlay.style.transition='opacity .8s ease'; overlay.style.opacity='0';
    setTimeout(()=>{overlay.remove();inicializar();},850);
  }
  video.addEventListener('ended',encerrar,{once:true});
  // começa a dissolver um pouco antes do fim, para a transição ficar suave
  video.addEventListener('timeupdate',()=>{
    if(video.duration&&video.duration-video.currentTime<=0.9) encerrar();
  });
  skipBtn.addEventListener('click',encerrar,{once:true});
  overlay.addEventListener('click',encerrar,{once:true});
  let vis=true;
  setInterval(()=>{const p=document.getElementById('video-pulso');if(p)p.style.opacity=vis?'1':'0.2';vis=!vis;},700);
  video.onerror=()=>setTimeout(encerrar,300);
  setTimeout(()=>{if(overlay.isConnected)encerrar();},30000);
}

function inicializar(){
  inicializarBlockly();
}

document.addEventListener('DOMContentLoaded',iniciarVideoIntro);
