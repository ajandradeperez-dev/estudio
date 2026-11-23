/* Lienzo a mano para dibujos del cuaderno y el ✏️ Borrador de la práctica: dedo, ratón y S Pen (Pointer Events).
   - Trazos guardados como datos ({herr, color, ancho, puntos:[[x, y, presión]]}) en píxeles CSS de la caja de contenido
     del lienzo: al girar la tablet, cambiar el tamaño de la ventana o el tamaño del texto (zoom) se vuelven a dibujar
     (ResizeObserver), y deshacer / rehacer es quitar o devolver un trazo.
   - Sin desfase: el punto se mide contra la caja de CONTENIDO (sin el borde) y se corrige el zoom o la escala del
     elemento (rect.width / offsetWidth); el mapa de bits mide lo que se ve × devicePixelRatio, así no se estira.
   - Trazo: lo terminado se guarda en un lienzo aparte y el trazo en curso se vuelve a pintar entero en cada cuadro
     (requestAnimationFrame) hasta el último punto, más el punto que el navegador predice (getPredictedEvents): la
     tinta va pegada a la punta. Con grosor fijo (dedo y ratón) es un solo camino suave, sin "cuentas" en las uniones.
   - S Pen: el grosor sigue la presión; se usan los eventos coalescidos (todos los puntos entre cuadros, a 120 Hz). El
     botón lateral (buttons 2 o 32) o el extremo borrador (button 5) borran mientras se mantienen.
   - Rechazo de la palma: en cuanto el lienzo ve un lápiz, los toques de dedo ya no dibujan y sirven para desplazar o hacer
     zoom (touch-action vuelve a dejar pasar el gesto). Sin lápiz, un dedo dibuja y DOS dedos desplazan la página (el
     trazo que había empezado el primer dedo se descarta: dos dedos NUNCA dibujan); tocar con dos dedos deshace.
   - Dentro del lienzo no hay selección de texto ni menú contextual (touch-action:none solo en el lienzo).
   crearLienzo(canvas, {fondo, tinta, trazos, alCambiar}) → {herramienta, color, grosor, deshacer, rehacer, limpiar, usado,
   trazos, aBlob, destruir} */
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export function crearLienzo(cv,{fondo=()=>'#ffffff',tinta=()=>'#1f2430',trazos=[],alCambiar=()=>{}}={}){
  const ctx=cv.getContext('2d');let dpr=1,esc=1,ancho=0,alto=0;
  const hecho=document.createElement('canvas'),hctx=hecho.getContext('2d');   // los trazos terminados
  const estado={herr:'lapiz',color:null,grosor:3};      // color null = la tinta del tema
  const rehacer=[];let actual=null,conLapiz=false,cuadro=0,prediccion=null;
  const dedos=new Map();let pan=null;                  // toques activos y desplazamiento con dos dedos
  cv.style.touchAction='none';cv.style.userSelect='none';cv.style.webkitUserSelect='none';
  const colorDe=(t,papel,tn)=>t.herr==='borrar'?papel:t.color||tn;
  const anchoDe=(t,pr)=>t.herr==='borrar'?t.ancho*6:t.ancho*(t.pen?0.35+1.3*pr:1);
  /* Pinta un trazo completo en el contexto x (ya escalado). Con presión, tramo a tramo (cada uno con su grosor);
     sin presión, un solo camino por los puntos medios. Termina en el último punto (y en el predicho, si hay). */
  function pintar(x,t,{papel=fondo(),tn=tinta(),extra=null}={}){
    const p=extra?[...t.puntos,extra]:t.puntos,col=colorDe(t,papel,tn);
    x.fillStyle=col;x.strokeStyle=col;
    if(p.length===1){x.beginPath();x.arc(p[0][0],p[0][1],anchoDe(t,p[0][2])/2,0,Math.PI*2);x.fill();return}
    if(!t.pen||t.herr==='borrar'){
      x.lineWidth=anchoDe(t,.5);x.beginPath();x.moveTo(p[0][0],p[0][1]);
      for(let i=1;i<p.length-1;i++)x.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);
      const u=p[p.length-1];x.lineTo(u[0],u[1]);x.stroke();return;
    }
    for(let i=1;i<p.length;i++){
      const a=p[i-1],b=p[i],c=p[i-2]||a,ini=i===1?a:[(c[0]+a[0])/2,(c[1]+a[1])/2],fin=i===p.length-1?b:[(a[0]+b[0])/2,(a[1]+b[1])/2];
      x.lineWidth=anchoDe(t,(a[2]+b[2])/2);x.beginPath();x.moveTo(ini[0],ini[1]);x.quadraticCurveTo(a[0],a[1],fin[0],fin[1]);x.stroke();
    }
  }
  const preparar=(x,k)=>{x.setTransform(k,0,0,k,0,0);x.lineCap='round';x.lineJoin='round'};
  // vuelve a pintar los trazos terminados (al cambiar de tamaño, de tema, deshacer…)
  function rehacerFondo(){
    hctx.setTransform(1,0,0,1,0,0);hctx.fillStyle=fondo();hctx.fillRect(0,0,hecho.width,hecho.height);
    preparar(hctx,esc);const papel=fondo(),tn=tinta();for(const t of trazos)if(t!==actual?.t)pintar(hctx,t,{papel,tn});
  }
  function componer(){
    cuadro=0;ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(hecho,0,0);
    if(actual){preparar(ctx,esc);pintar(ctx,actual.t,{extra:prediccion})}
  }
  const pedirCuadro=()=>{if(!cuadro)cuadro=requestAnimationFrame(componer)};
  function redibujar(){rehacerFondo();componer()}
  // escala del elemento (zoom del texto, transformaciones) y caja de contenido en coordenadas de la ventana
  function caja(){
    const r=cv.getBoundingClientRect(),k=cv.offsetWidth?r.width/cv.offsetWidth:1;
    return {x:r.left+cv.clientLeft*k,y:r.top+cv.clientTop*k,k};
  }
  function medir(){
    const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
    const k=caja().k||1;dpr=Math.min(3,window.devicePixelRatio||1);esc=k*dpr;ancho=w;alto=h;
    const W=Math.round(w*esc),H=Math.round(h*esc);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;hecho.width=W;hecho.height=H}
    redibujar();
  }
  const ro=new ResizeObserver(medir);ro.observe(cv);medir();
  const presion=e=>e.pointerType==='pen'||e.pressure>0&&e.pressure!==.5?e.pressure||.5:.5;
  const pos=(e,b=caja())=>[(e.clientX-b.x)/b.k,(e.clientY-b.y)/b.k,presion(e)];
  const esBorrador=e=>e.pointerType==='pen'&&(e.button===5||(e.buttons&32)||(e.buttons&2));
  function verLapiz(e){
    if(e.pointerType!=='pen'||conLapiz)return;
    // desde ahora el dedo no dibuja: desplaza y hace zoom
    conLapiz=true;cv.style.touchAction='pan-x pan-y pinch-zoom';
  }
  // el primer contenedor que se puede desplazar (o la página)
  function desplazable(){
    for(let el=cv.parentElement;el&&el!==document.body;el=el.parentElement){
      const o=getComputedStyle(el).overflowY;if(/(auto|scroll)/.test(o)&&el.scrollHeight>el.clientHeight)return el}
    return document.scrollingElement||document.documentElement;
  }
  const centroDedos=()=>{let x=0,y=0;for(const d of dedos.values()){x+=d[0];y+=d[1]}return [x/dedos.size,y/dedos.size]};
  function abajo(e){
    verLapiz(e);
    if(e.pointerType==='touch'&&conLapiz)return;            // palma o dedo con el lápiz activo
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}
    if(e.pointerType==='touch'){
      dedos.set(e.pointerId,[e.clientX,e.clientY]);
      if(dedos.size>=2){   // dos dedos: se descarta el trazo del primero y se desplaza
        if(actual){const i=trazos.indexOf(actual.t);if(i>=0)trazos.splice(i,1);actual=null;prediccion=null;componer()}
        pan={c:centroDedos(),el:desplazable(),t0:performance.now(),mov:0};return;
      }
    }
    if(pan)return;
    const herr=esBorrador(e)?'borrar':estado.herr;
    actual={id:e.pointerId,t:{herr,color:estado.color,ancho:estado.grosor,pen:e.pointerType==='pen',puntos:[pos(e)]}};
    trazos.push(actual.t);rehacer.length=0;prediccion=null;pedirCuadro();
  }
  function mover(e){
    if(e.pointerType==='pen')verLapiz(e);
    if(e.pointerType==='touch'&&dedos.has(e.pointerId)){
      dedos.set(e.pointerId,[e.clientX,e.clientY]);
      if(pan&&dedos.size>=2){e.preventDefault();const c=centroDedos();pan.mov+=Math.hypot(pan.c[0]-c[0],pan.c[1]-c[1]);pan.el.scrollBy(pan.c[0]-c[0],pan.c[1]-c[1]);pan.c=c;return}
    }
    if(!actual||e.pointerId!==actual.id)return;
    e.preventDefault();
    const b=caja(),evs=e.getCoalescedEvents?.()||[];
    for(const x of evs.length?evs:[e])actual.t.puntos.push(pos(x,b));
    const pr=e.getPredictedEvents?.()||[];prediccion=pr.length?pos(pr[pr.length-1],b):null;
    pedirCuadro();
  }
  function arriba(e){
    if(e.pointerType==='touch'){dedos.delete(e.pointerId);if(pan){if(!dedos.size){const toque=performance.now()-pan.t0<320&&pan.mov<12;pan=null;if(toque)deshacer()}return}}
    if(!actual||e.pointerId!==actual.id)return;
    const t=actual.t;actual=null;prediccion=null;
    if(cuadro){cancelAnimationFrame(cuadro);cuadro=0}
    preparar(hctx,esc);pintar(hctx,t);componer();alCambiar(trazos);
  }
  function deshacer(){if(trazos.length){rehacer.push(trazos.pop());redibujar();alCambiar(trazos)}}
  const sinMenu=e=>e.preventDefault();
  cv.addEventListener('pointerdown',abajo);cv.addEventListener('pointermove',mover);
  cv.addEventListener('pointerup',arriba);cv.addEventListener('pointercancel',arriba);cv.addEventListener('pointerover',verLapiz);
  cv.addEventListener('contextmenu',sinMenu);cv.addEventListener('selectstart',sinMenu);
  // si el tema cambia (claro ↔ oscuro), la tinta y el papel cambian con él
  const mq=matchMedia('(prefers-color-scheme: dark)'),alTema=()=>redibujar();mq.addEventListener?.('change',alTema);
  return {
    herramienta(h){estado.herr=h},color(c){estado.color=c;estado.herr='lapiz'},grosor(g){estado.grosor=g},
    deshacer,
    rehacer(){if(rehacer.length){trazos.push(rehacer.pop());redibujar();alCambiar(trazos)}},
    limpiar(){if(!trazos.length)return;rehacer.length=0;trazos.splice(0);redibujar();alCambiar(trazos)},
    get usado(){return trazos.length>0},get puedeDeshacer(){return trazos.length>0},get puedeRehacer(){return rehacer.length>0},
    get trazos(){return trazos},get tamano(){return {ancho,alto}},
    redibujar,
    // PNG (para guardar en el cuaderno: papel blanco y tinta oscura aunque se haya dibujado en modo oscuro)
    aBlob({papel='#ffffff',tintaPapel='#1f2430'}={}){
      const c=document.createElement('canvas');c.width=Math.round(ancho*dpr);c.height=Math.round(alto*dpr);const x=c.getContext('2d');
      x.fillStyle=papel;x.fillRect(0,0,c.width,c.height);preparar(x,dpr);
      for(const t of trazos)pintar(x,t,{papel,tn:tintaPapel});
      return new Promise((res,rej)=>c.toBlob(b=>b?res({blob:b,ancho:c.width,alto:c.height}):rej(new Error('No se pudo guardar el dibujo.')),'image/png'));
    },
    destruir(){ro.disconnect();mq.removeEventListener?.('change',alTema);if(cuadro)cancelAnimationFrame(cuadro)}
  };
}
// Colores del papel según el tema (el borrador sigue el modo oscuro; los dibujos del cuaderno son siempre de papel blanco)
export const papelTema=()=>css('--surface')||'#ffffff',tintaTema=()=>css('--ink')||'#1f2430';
