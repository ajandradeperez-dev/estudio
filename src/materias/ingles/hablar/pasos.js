/* Pasos de una unidad que no son lecciones ni diálogos:
   escucha (input comprensible): audio primero, preguntas escritas después; el texto se ve al final.
   fluidez: 4-3-2 (contar lo mismo en 60, 45 y 30 s) y ronda rápida de frases de la unidad (60 s). */
import {$,esc} from '../../../utilidades.js';
import {soporte,htmlOir,escuchar,detenerEscucha,htmlMic} from '../../../nucleo/voz.js';
import {evaluar} from '../../../nucleo/pronunciacion.js';
import {deBanco,META_PRONUNCIACION} from '../../../nucleo/ejercicios.js';
import {crearSesion} from '../../../nucleo/sesion.js';
import {registrarEjercicio,registrarHabla,cambiarExtra} from '../../../nucleo/progreso.js';
import {barra} from '../../../nucleo/ui.js';
import {htmlCierre,xpHoy} from '../../../nucleo/cierre.js';
import {SONIDOS} from '../errores-pronunciacion.js';
import {premiarFrase,cerrarCombo} from './juego.js';
import {CONTENIDO} from './contenido.js';

const RAIZ='estudio/ingles/hablar';
// Marca un paso de la unidad como hecho (escucha, chunks, fluidez)
export function marcarPaso(unidadId,paso){cambiarExtra('ingles',e=>{e.unidades=e.unidades||{};e.unidades[unidadId]={...(e.unidades[unidadId]||{}),[paso]:true}})}
const cab=(u,titulo)=>`<p class="miga"><button class="enlace" data-go="${RAIZ}/u/${u.id}">${esc(u.titulo)}</button> › ${titulo}</p>`;

/* ---------- escucha ---------- */
// Primero se escucha el audio (las veces que quieras); luego, una pregunta por pantalla con el audio a mano. El texto se ve al final.
export function vistaEscucha(u){
  const e=CONTENIDO[u.id].escucha,n=e.preguntas.length;
  let fase='inicio',ses=null;
  function empezar(){
    const fallos=[];
    ses=crearSesion({
      titulo:`Escucha: ${e.titulo}`,tono:'estudio',salir:`${RAIZ}/u/${u.id}`,sinPistas:true,
      total:()=>n,
      siguiente:st=>st.i<n?{...deBanco(e.preguntas[st.i]),oir:soporte.hablar?e.texto:'',k:st.i}:null,
      responder(p,r){
        if(!r.correcto)fallos.push(p.regla);
        registrarEjercicio({materia:'ingles',ref:`ingles/e/${u.id}/${p.k}`,correcto:r.correcto});
        return {xp:r.correcto?10:0,nota:r.correcto?'':'Volverá en Repasar.'};
      },
      fin(st){
        const pasa=st.ok/n>=0.8;if(pasa)marcarPaso(u.id,'escucha');
        return `<span class="fin-icono" aria-hidden="true">${pasa?'🎧':'🔁'}</span><h1>${pasa?'¡Entendiste el audio!':'Vuelve a escucharlo'}</h1>
<p class="nota">${st.ok} de ${n} respuestas bien${pasa?'':' · necesitas el 80 %'}</p>
<details class="transcripcion" open><summary>Texto del audio</summary><p lang="en">${esc(e.texto)}</p>${htmlOir(e.texto)}</details>
<button class="btn ancho" id="es-otra">Repetir</button>
${htmlCierre({xp:st.xp,aprendido:fallos.length?fallos:e.preguntas.slice(0,2).map(q=>q.regla),excluir:location.hash.slice(1)})}`;
      }
    });
    ses.alEntrar();fase='sesion';
  }
  return {
    titulo:`Escucha: ${e.titulo}`,
    get inmersiva(){return fase==='sesion'},
    alEntrar(){fase='inicio';ses=null},
    alSalir(){ses?.alSalir?.()},
    vista(){
      if(fase==='sesion')return ses.vista();
      const audio=soporte.hablar?`<div class="card escucha-audio"><p class="nota">Escúchalo primero a velocidad normal; usa 🐢 si hace falta.</p><div class="row centro">${htmlOir(e.texto)}</div></div>`
        :`<div class="card"><p class="nota">Tu navegador no puede leer en voz alta: lee el texto.</p><p lang="en">${esc(e.texto)}</p></div>`;
      return `${cab(u,'Escucha')}<h1>🎧 ${e.titulo}</h1>${audio}<div style="margin-top:20px"><button class="btn ancho" id="es-empezar">Responder ${n} preguntas</button></div>`;
    },
    alMostrar(){if(fase==='sesion')ses.alMostrar()},
    async alClic(t,ir,repintar){
      if(t.id==='es-empezar'||t.id==='es-otra'){empezar();repintar();return true}
      if(fase==='sesion')return ses.alClic(t,ir,repintar);
    }
  };
}

/* ---------- fluidez: 4-3-2 y ronda rápida ---------- */
const DURACIONES=()=>window.__duracionesFluidez||[60,45,30];   // __duracionesFluidez solo lo usan las pruebas
const RAPIDA=()=>window.__duracionRapida||60;
const contarPalabras=t=>String(t).trim().split(/\s+/).filter(Boolean).length;

export function vistaFluidez(u){
  const c=CONTENIDO[u.id];
  let st;
  const nuevo=()=>({fase:'inicio',ronda:0,rondas:[],corriendo:false,xp0:xpHoy(),rapida:null,error:null});
  const tiempo=s=>`0:${String(Math.max(0,s)).padStart(2,'0')}`.replace(/^0:(\d\d)$/,(m,x)=>+x>=60?'1:00':m);

  // Escucha en bucle hasta que se acabe el tiempo; cada frase reconocida suma palabras
  async function grabar(segundos,alFrase){
    const fin=Date.now()+segundos*1000;st.corriendo=true;
    const reloj=setInterval(()=>{const el=$('#fl-tiempo');if(el)el.textContent=tiempo(Math.ceil((fin-Date.now())/1000));if(Date.now()>=fin){st.corriendo=false;detenerEscucha()}},250);
    try{
      while(st.corriendo&&Date.now()<fin){
        let r;
        try{r=await escuchar({maxSegundos:Math.max(1,Math.ceil((fin-Date.now())/1000))})}
        catch(e){if(e.codigo==='no-speech'||e.codigo==='aborted')continue;st.error=e.message;break}
        if(Date.now()>fin+500)break;
        registrarHabla({frases:1,seg:r.segundos});
        alFrase(r);
      }
    }finally{clearInterval(reloj);st.corriendo=false}
  }

  function htmlRondas(){
    return st.rondas.length&&soporte.escuchar?`<table class="tabla-fluidez"><tr><th>Ronda</th><th>Palabras</th><th>Por minuto</th></tr>${st.rondas.map((r,k)=>`<tr><td>${DURACIONES()[k]} s</td><td>${r.palabras}</td><td><b>${r.ppm}</b></td></tr>`).join('')}</table>`:'';
  }

  return {
    titulo:`Fluidez: ${c.fluidez.tema}`,
    alEntrar(){st=nuevo()},
    vista(){
      const d=DURACIONES(),guia=`<ul class="guia">${c.fluidez.guia.map(g=>`<li>${g}</li>`).join('')}</ul>`;
      const top=`${cab(u,'Fluidez')}<h1>⚡ ${c.fluidez.tema}</h1>`;
      if(st.fase==='inicio')return `${top}<div class="card"><p><b>4-3-2:</b> cuenta lo mismo tres veces, cada vez con menos tiempo (${d.join(', ')} s). Repetir con prisa vuelve automático lo que ya sabes.</p>${guia}
${soporte.escuchar?'':`<p class="nota">Tu navegador no reconoce voz: usa el temporizador y habla en voz alta (sin evaluación).</p>`}
<div class="row"><button class="btn" id="fl-empezar">Empezar ronda 1 (${d[0]} s)</button></div></div>`;
      if(st.fase==='ronda')return `${top}<div class="card fluidez-ronda"><p class="progress">Ronda ${st.ronda+1} de 3</p>${guia}
<div class="reloj" id="fl-tiempo" aria-live="off">${tiempo(d[st.ronda])}</div>
<div class="mic-zona"><span class="mic escuchando" aria-hidden="true"><span class="mic-ondas"></span></span><div class="mic-estado" id="fl-estado">${soporte.escuchar?'Habla sin parar… <b id="fl-palabras">0</b> palabras':'Habla en voz alta sin parar hasta que acabe el tiempo'}</div></div>
<div class="row centro"><button class="btn ghost btn-chico" id="fl-parar">Terminar ronda</button></div></div>`;
      if(st.fase==='entre')return `${top}<div class="card">${htmlRondas()}${st.error?`<p class="deny">${esc(st.error)}</p>`:''}
<p>Ahora cuéntalo <b>otra vez</b>, igual de completo pero en ${d[st.ronda]} segundos.</p><div class="row"><button class="btn" id="fl-empezar">Empezar ronda ${st.ronda+1} (${d[st.ronda]} s)</button></div></div>`;
      if(st.fase==='rapida'){const ch=c.chunks[st.rapida.i%c.chunks.length];
        return `${top}<div class="card"><p class="progress">Ronda rápida · ${st.rapida.ok} frases bien</p><div class="reloj" id="fl-tiempo">${tiempo(RAPIDA())}</div>
<p class="frase-objetivo" lang="en" id="fl-frase">${esc(ch.en)}</p><p class="nota" style="text-align:center">${ch.es}</p>
<div class="mic-zona"><span class="mic escuchando" aria-hidden="true"><span class="mic-ondas"></span></span><div class="mic-estado">Di cada frase: si sale bien (${META_PRONUNCIACION}+), pasa a la siguiente</div></div></div>`}
      const r=st.rondas,mejora=soporte.escuchar&&r.length===3&&r[2].ppm>r[0].ppm;
      return `${top}<div class="card"><h3>${mejora?'⚡ ¡Más fluido en cada ronda!':'Rondas terminadas'}</h3>${htmlRondas()}
${st.rapida?`<p><b>Ronda rápida:</b> ${st.rapida.ok} frases en ${RAPIDA()} s.</p>`:soporte.escuchar?`<div class="row"><button class="btn ghost" id="fl-rapida">Ronda rápida de frases (${RAPIDA()} s)</button></div>`:''}
${htmlCierre({xp:xpHoy()-st.xp0,aprendido:[mejora?`Pasaste de ${r[0].ppm} a ${r[2].ppm} palabras por minuto contando lo mismo.`:'Repetir lo mismo con menos tiempo entrena la fluidez.'],excluir:location.hash.slice(1)})}
<div class="row" style="margin-top:12px"><button class="btn ghost" id="fl-otra">Repetir 4-3-2</button><button class="btn ghost" data-go="${RAIZ}/u/${u.id}">Volver a la unidad</button></div></div>`;
    },
    async alClic(t,ir,repintar){
      if(t.id==='fl-otra'){st=nuevo();repintar();return true}
      if(t.id==='fl-parar'){st.corriendo=false;detenerEscucha();return true}
      if(t.id==='fl-empezar'){
        const dur=DURACIONES()[st.ronda];st.fase='ronda';st.error=null;repintar();
        let palabras=0;const inicio=Date.now();
        if(soporte.escuchar)await grabar(dur,r=>{palabras+=contarPalabras(r.transcripcion);const el=$('#fl-palabras');if(el)el.textContent=palabras});
        else{st.corriendo=true;await new Promise(res=>{const fin=Date.now()+dur*1000,iv=setInterval(()=>{const el=$('#fl-tiempo');if(el)el.textContent=tiempo(Math.ceil((fin-Date.now())/1000));if(Date.now()>=fin||!st.corriendo){clearInterval(iv);st.corriendo=false;res()}},250)})}
        const seg=Math.max(1,Math.min(dur,(Date.now()-inicio)/1000));
        st.rondas.push({palabras,ppm:Math.round(palabras/seg*60)});
        st.ronda++;
        if(st.ronda>=3){st.fase='fin';marcarPaso(u.id,'fluidez')}else st.fase='entre';
        repintar();return true;
      }
      if(t.id==='fl-rapida'){
        st.rapida={i:0,ok:0};st.fase='rapida';repintar();
        await grabar(RAPIDA(),r=>{
          const ch=c.chunks[st.rapida.i%c.chunks.length],ev=evaluar(ch.en,r.alternativas,{sonidos:SONIDOS});
          if(ev.puntaje>=META_PRONUNCIACION){st.rapida.ok++;st.rapida.i++;premiarFrase(ev.puntaje);
            const sig=c.chunks[st.rapida.i%c.chunks.length],el=$('#fl-frase');if(el)el.textContent=sig.en;}
          else cerrarCombo();
        });
        st.fase='fin';repintar();return true;
      }
    }
  };
}
