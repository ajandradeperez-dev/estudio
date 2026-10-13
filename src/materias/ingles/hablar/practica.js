/* Sesión de pronunciación reutilizable (sonidos, frases útiles, unidades).
   Ítems: {tipo:'elegir', opciones:[a,b], correcta, sonido?}  escucha y elige (input, no va al repaso)
          {tipo:'repetir', en, es?, ref}                      di la frase; pasa con ≥ 80 sin haber usado "lento"
   Hasta 3 intentos por frase (se queda el mejor). Shadowing: la app dice la frase y empieza a escucharte justo después. */
import {$,esc} from '../../../utilidades.js';
import {soporte,hablar,htmlMic,htmlOir,htmlFraseEvaluada,escucharConBoton} from '../../../nucleo/voz.js';
import {evaluar} from '../../../nucleo/pronunciacion.js';
import {registrarEjercicio,registrarHabla,registrarSonidos} from '../../../nucleo/progreso.js';
import {META_PRONUNCIACION} from '../../../nucleo/ejercicios.js';
import {barra} from '../../../nucleo/ui.js';
import {htmlCierre,xpHoy} from '../../../nucleo/cierre.js';
import {SONIDOS,sonido} from '../errores-pronunciacion.js';
import {premiarFrase,htmlPremio,cerrarCombo} from './juego.js';

const MAX_INTENTOS=3;

export function sesionPronunciacion({titulo,cabecera='',volver,items:crearItems,alTerminar}){
  let items=[],i=0,st=null,resultados=[],xp0=0;
  const nuevoEstado=()=>({intentos:0,mejor:null,lento:false,respondido:null,premio:null});
  const item=()=>items[i];

  function htmlResultado(){
    if(!st.mejor)return '';
    const m=st.mejor,ok=m.puntaje>=META_PRONUNCIACION&&!st.lento,det=m.detecciones.map(d=>{const s=sonido(d.sonido);return s?`<li><b>${s.nombre}:</b> ${d.oido?`se entendió «${esc(d.oido)}» en vez de «${esc(d.palabra)}»`:`no se entendió «${esc(d.palabra)}»`}. ${s.causa} <b>Tip:</b> ${s.tip}</li>`:''}).join('');
    return `${htmlFraseEvaluada(m)}<div class="puntaje ${ok?'ok':m.puntaje>=META_PRONUNCIACION?'casi':'bajo'}"><b>${m.puntaje}</b>/100 ${ok?'· ¡Pasaste!':st.lento&&m.puntaje>=META_PRONUNCIACION?'· Bien, pero usaste "lento": inténtalo a velocidad normal':`· necesitas ${META_PRONUNCIACION}`}</div>
${det?`<ul class="detecciones">${det}</ul>`:''}${st.premio?htmlPremio(st.premio):''}
<p class="progress">Intento ${st.intentos} de ${MAX_INTENTOS}${m.transcripcion?` · se entendió: «${esc(m.transcripcion)}»`:''}</p>`;
  }

  function htmlItem(){
    const x=item(),n=items.length;
    const cab=`<p class="progress">${i+1} de ${n} · ${x.tipo==='elegir'?'Escucha y elige':'Repite'}</p>${barra(i,n)}`;
    if(x.tipo==='elegir'){
      const s=x.sonido&&sonido(x.sonido);
      return `${cab}<p class="ej-preg">¿Qué palabra escuchas?</p>
<div class="row centro"><button class="btn" data-decir="${esc(x.opciones[x.correcta])}">🔊 Escuchar</button><button class="btn ghost" data-decir="${esc(x.opciones[x.correcta])}" data-lento="1">🐢 Lento</button></div>
<div class="opts opts-grandes" id="hp-ops">${x.opciones.map((o,k)=>`<button data-elige="${k}" lang="en" ${st.respondido!=null?'disabled':''} class="${st.respondido==null?'':k===x.correcta?'right':k===st.respondido?'wrong':''}">${esc(o)}</button>`).join('')}</div>
${st.respondido!=null?`<div class="result">${st.respondido===x.correcta?'<span class="allow">¡Bien!</span>':`<span class="deny">Era «${esc(x.opciones[x.correcta])}».</span>`}${s?` ${s.tip}`:''}</div>`:''}
<div class="row" style="margin-top:12px">${st.respondido!=null?'<button class="btn" id="hp-sig">Siguiente</button>':''}</div>`;
    }
    const pasada=st.mejor&&st.mejor.puntaje>=META_PRONUNCIACION&&!st.lento;
    return `${cab}<p class="frase-objetivo" lang="en">${esc(x.en)}</p>${x.es?`<p class="nota">${x.es}</p>`:''}
<div class="row centro">${htmlOir(x.en)}${soporte.escuchar&&soporte.hablar?'<button class="btn ghost btn-chico" id="hp-sombra" type="button">🔁 Shadowing</button>':''}</div>
${soporte.escuchar?(st.intentos<MAX_INTENTOS&&!pasada?htmlMic('hp-mic',st.intentos?'Toca y vuelve a intentarlo':'Toca y repite la frase'):'')
  :`<form class="row" id="ej-form"><label for="hp-resp">Escribe lo que escuchas<input id="hp-resp" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en"></label><button class="btn" id="hp-ok">Comprobar</button></form><p class="ej-pista">Tu navegador no reconoce voz (usa Chrome en Android para hablar): por ahora practica escuchando y escribiendo.</p>`}
<div id="hp-res" aria-live="polite">${htmlResultado()}</div>
<div class="row" style="margin-top:12px">${st.intentos?`<button class="btn${pasada||st.intentos>=MAX_INTENTOS?'':' ghost'}" id="hp-sig">Siguiente</button>`:'<button class="btn ghost btn-chico" id="hp-sig">Saltar</button>'}</div>`;
  }

  function htmlFin(){
    const rep=resultados.filter(r=>r.tipo==='repetir'),ok=rep.filter(r=>r.ok).length,el=resultados.filter(r=>r.tipo==='elegir'),elOk=el.filter(r=>r.ok).length;
    const xp=resultados.reduce((s,r)=>s+(r.xp||0),0);
    const cuenta={};resultados.forEach(r=>(r.detecciones||[]).forEach(d=>cuenta[d]=(cuenta[d]||0)+1));
    const dificiles=Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([id])=>sonido(id)).filter(Boolean);
    return `<div class="card"><h3>Sesión terminada</h3>
<p class="prog-v">${ok} <small>de ${rep.length} frases con ${META_PRONUNCIACION}+${el.length?` · ${elOk} de ${el.length} al escuchar`:''} · +${xp} XP</small></p>${barra(ok,rep.length||1)}
${dificiles.length?`<p><b>Para practicar:</b> ${dificiles.map(s=>`<button class="enlace" data-go="estudio/ingles/hablar/sonido/${s.id}">${s.nombre}</button>`).join(', ')}</p>`:''}
${rep.length-ok?`<p class="nota">Las ${rep.length-ok} frases que no pasaron ya están en <strong>Repasar hoy</strong>.</p>`:''}
${alTerminar?alTerminar(resultados):''}
${htmlCierre({xp:xpHoy()-xp0,aprendido:dificiles.length?dificiles.map(s=>`<b>${s.nombre}:</b> ${s.tip}`):[ok?`Dijiste ${ok} frases con buena pronunciación.`:''],excluir:location.hash.slice(1)})}
<div class="row" style="margin-top:12px"><button class="btn ghost" id="hp-otra">Practicar otra vez</button><button class="btn ghost" data-go="${volver}">Volver</button></div></div>`;
  }

  async function intentar(boton,alternativas,hablado,segundos){
    const x=item(),ev=evaluar(x.en,alternativas,{sonidos:SONIDOS});
    st.intentos++;
    if(hablado){registrarHabla({frases:1,seg:segundos||0});registrarSonidos('ingles',ev.sonidos)}
    if(!st.mejor||ev.puntaje>st.mejor.puntaje)st.mejor=ev;
    if(ev.puntaje>=META_PRONUNCIACION&&!st.lento&&hablado)st.premio=premiarFrase(ev.puntaje);
  }
  function cerrarItem(){
    const x=item();
    if(x.tipo==='repetir'){
      const ok=!!(st.mejor&&st.mejor.puntaje>=META_PRONUNCIACION&&!st.lento);
      const xp=st.premio?.xp||0;
      // XP de habla ya sumada en premiarFrase; aquí cuenta el ejercicio (meta diaria) y, si no pasó, va al repaso
      registrarEjercicio({materia:'ingles',ref:x.ref,correcto:ok,xp:0,repasar:!!x.ref});
      if(!ok)cerrarCombo();
      resultados.push({tipo:'repetir',ok,puntaje:st.mejor?.puntaje||0,xp,detecciones:(st.mejor?.detecciones||[]).map(d=>d.sonido),ref:x.ref});
    }
  }

  return {
    titulo,
    alEntrar(){items=crearItems();i=0;resultados=[];st=nuevoEstado();xp0=xpHoy()},
    vista:()=>`${cabecera}<div class="card hablar-item" id="hp">${i<items.length?htmlItem():''}</div>${i>=items.length?htmlFin():''}`,
    async alClic(t,ir,repintar){
      if(t.id==='hp-otra'){this.alEntrar();repintar();return true}
      if(i>=items.length)return;
      const x=item();
      // Solo cuenta el botón 🐢 de la frase (no tocar una palabra suelta) y solo antes de pasar
      if(t.dataset.lento&&t.closest('.oir')&&x.tipo==='repetir'){if(!(st.mejor&&st.mejor.puntaje>=META_PRONUNCIACION&&!st.lento))st.lento=true;return true}
      if(t.id==='hp-sig'){cerrarItem();i++;st=nuevoEstado();repintar();return true}
      if(x.tipo==='elegir'&&t.dataset.elige!==undefined&&st.respondido==null){
        st.respondido=+t.dataset.elige;const ok=st.respondido===x.correcta;
        registrarEjercicio({materia:'ingles',correcto:ok,xp:ok?5:0,repasar:false});
        resultados.push({tipo:'elegir',ok,xp:ok?5:0});
        repintar();return true;
      }
      if(t.id==='hp-ok'){const v=$('#hp-resp').value.trim();if(!v)return true;await intentar(t,[{transcripcion:v,confianza:1}],false);st.intentos=MAX_INTENTOS;repintar();return true}
      if(t.id==='hp-mic'||t.id==='hp-sombra'){
        const mic=$('#hp-mic');if(!mic)return true;
        if(t.id==='hp-sombra'){await hablar(x.en)} // shadowing: escuchar y repetir justo después
        let res;
        try{res=await escucharConBoton(mic)}catch(e){const est=$('#hp-mic-estado');if(est)est.textContent=e.message;return true}
        if(!res)return true;
        await intentar(mic,res.alternativas,true,res.segundos);
        repintar();return true;
      }
    }
  };
}

// Ítems "escucha y elige" a partir de pares mínimos: se dice una palabra al azar del par
export const itemsElegir=(pares,n,sonidoId)=>pares.slice(0,n).map(p=>({tipo:'elegir',opciones:[...p],correcta:Math.random()<0.5?0:1,sonido:sonidoId}));
