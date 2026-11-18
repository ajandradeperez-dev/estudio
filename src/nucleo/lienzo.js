/* Lienzo a mano para dibujos del cuaderno y el ✏️ Borrador de la práctica: dedo, ratón y S Pen (Pointer Events).
   - Trazos guardados como datos ({herr, color, ancho, puntos:[[x, y, presión]]}): al girar la tablet o cambiar el tamaño de
     la ventana se vuelven a dibujar (ResizeObserver), y deshacer / rehacer es quitar o devolver un trazo.
   - S Pen: el grosor sigue la presión; se usan los eventos coalescidos (todos los puntos entre cuadros, a 120 Hz) y el
     trazo se suaviza con curvas por el punto medio. El botón lateral (buttons 2 o 32) o el extremo borrador (button 5)
     borran mientras se mantienen.
   - Rechazo de la palma: en cuanto el lienzo ve un lápiz, los toques de dedo ya no dibujan y sirven para desplazar o hacer
     zoom (touch-action vuelve a dejar pasar el gesto). Sin lápiz, el dedo dibuja como siempre.
   - Dentro del lienzo no hay selección de texto ni menú contextual (touch-action:none solo en el lienzo).
   crearLienzo(canvas, {fondo, tinta, trazos, alCambiar}) → {herramienta, color, deshacer, rehacer, limpiar, usado, aBlob, destruir} */
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export function crearLienzo(cv,{fondo=()=>'#ffffff',tinta=()=>'#1f2430',trazos=[],alCambiar=()=>{}}={}){
  const ctx=cv.getContext('2d');let dpr=1,ancho=0,alto=0;
  const estado={herr:'lapiz',color:null,grosor:3};      // color null = la tinta del tema
  const rehacer=[];let actual=null,conLapiz=false;
  cv.style.touchAction='none';cv.style.userSelect='none';cv.style.webkitUserSelect='none';
  const colorDe=t=>t.herr==='borrar'?fondo():t.color||tinta();
  const anchoDe=(t,pr)=>t.herr==='borrar'?t.ancho*6:t.ancho*(t.pen?0.35+1.3*pr:1);
  // un tramo suavizado: curva cuadrática por el punto medio entre puntos consecutivos
  function tramo(t,i){
    const p=t.puntos,a=p[i-1],b=p[i],c=p[i-2]||a;
    const m1=[(c[0]+a[0])/2,(c[1]+a[1])/2],m2=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    ctx.strokeStyle=colorDe(t);ctx.lineWidth=anchoDe(t,(a[2]+b[2])/2);
    ctx.beginPath();ctx.moveTo(...m1);ctx.quadraticCurveTo(a[0],a[1],...m2);ctx.stroke();
  }
  function punto(t){const [x,y,pr]=t.puntos[0];ctx.fillStyle=colorDe(t);ctx.beginPath();ctx.arc(x,y,anchoDe(t,pr)/2,0,Math.PI*2);ctx.fill()}
  function redibujar(){
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=fondo();ctx.fillRect(0,0,cv.width,cv.height);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';
    for(const t of trazos){punto(t);for(let i=1;i<t.puntos.length;i++)tramo(t,i)}
  }
  function medir(){
    const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;
    dpr=Math.min(3,window.devicePixelRatio||1);ancho=r.width;alto=r.height;
    cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);redibujar();
  }
  const ro=new ResizeObserver(medir);ro.observe(cv);medir();
  const pos=e=>{const b=cv.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top,e.pointerType==='pen'||e.pressure>0&&e.pressure!==.5?e.pressure||.5:.5]};
  const esBorrador=e=>e.pointerType==='pen'&&(e.button===5||(e.buttons&32)||(e.buttons&2));
  function verLapiz(e){
    if(e.pointerType!=='pen'||conLapiz)return;
    // desde ahora el dedo no dibuja: desplaza y hace zoom
    conLapiz=true;cv.style.touchAction='pan-x pan-y pinch-zoom';
  }
  function abajo(e){
    verLapiz(e);
    if(e.pointerType==='touch'&&conLapiz)return;            // palma o dedo con el lápiz activo
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}
    const herr=esBorrador(e)?'borrar':estado.herr;
    actual={id:e.pointerId,t:{herr,color:estado.color,ancho:estado.grosor,pen:e.pointerType==='pen',puntos:[pos(e)]}};
    trazos.push(actual.t);rehacer.length=0;punto(actual.t);
  }
  function mover(e){
    if(e.pointerType==='pen')verLapiz(e);
    if(!actual||e.pointerId!==actual.id)return;
    e.preventDefault();
    const evs=e.getCoalescedEvents?.()||[];
    for(const x of evs.length?evs:[e]){actual.t.puntos.push(pos(x));tramo(actual.t,actual.t.puntos.length-1)}
  }
  function arriba(e){if(!actual||e.pointerId!==actual.id)return;actual=null;alCambiar(trazos)}
  const sinMenu=e=>e.preventDefault();
  cv.addEventListener('pointerdown',abajo);cv.addEventListener('pointermove',mover);
  cv.addEventListener('pointerup',arriba);cv.addEventListener('pointercancel',arriba);cv.addEventListener('pointerover',verLapiz);
  cv.addEventListener('contextmenu',sinMenu);cv.addEventListener('selectstart',sinMenu);
  // si el tema cambia (claro ↔ oscuro), la tinta y el papel cambian con él
  const mq=matchMedia('(prefers-color-scheme: dark)'),alTema=()=>redibujar();mq.addEventListener?.('change',alTema);
  return {
    herramienta(h){estado.herr=h},color(c){estado.color=c;estado.herr='lapiz'},grosor(g){estado.grosor=g},
    deshacer(){if(trazos.length){rehacer.push(trazos.pop());redibujar();alCambiar(trazos)}},
    rehacer(){if(rehacer.length){trazos.push(rehacer.pop());redibujar();alCambiar(trazos)}},
    limpiar(){if(!trazos.length)return;rehacer.length=0;trazos.splice(0);redibujar();alCambiar(trazos)},
    get usado(){return trazos.length>0},get puedeDeshacer(){return trazos.length>0},get puedeRehacer(){return rehacer.length>0},
    redibujar,
    // PNG (para guardar en el cuaderno: papel blanco y tinta oscura aunque se haya dibujado en modo oscuro)
    aBlob({papel='#ffffff',tintaPapel='#1f2430'}={}){
      const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const x=c.getContext('2d');
      x.fillStyle=papel;x.fillRect(0,0,c.width,c.height);
      // se vuelve a dibujar cada trazo en el otro lienzo con los colores de papel
      x.setTransform(dpr,0,0,dpr,0,0);x.lineCap='round';x.lineJoin='round';
      for(const t of trazos){const col=t.herr==='borrar'?papel:t.color||tintaPapel,p=t.puntos;
        x.fillStyle=col;x.beginPath();x.arc(p[0][0],p[0][1],anchoDe(t,p[0][2])/2,0,Math.PI*2);x.fill();
        for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],cc=p[i-2]||a;x.strokeStyle=col;x.lineWidth=anchoDe(t,(a[2]+b[2])/2);
          x.beginPath();x.moveTo((cc[0]+a[0])/2,(cc[1]+a[1])/2);x.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);x.stroke()}}
      return new Promise((res,rej)=>c.toBlob(b=>b?res({blob:b,ancho:c.width,alto:c.height}):rej(new Error('No se pudo guardar el dibujo.')),'image/png'));
    },
    destruir(){ro.disconnect();mq.removeEventListener?.('change',alTema)}
  };
}
// Colores del papel según el tema (el borrador sigue el modo oscuro; los dibujos del cuaderno son siempre de papel blanco)
export const papelTema=()=>css('--surface')||'#ffffff',tintaTema=()=>css('--ink')||'#1f2430';
