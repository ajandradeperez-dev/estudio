/* Diálogo guiado (sin API): el personaje habla, el alumno responde hablando (o escribiendo).
   Corrección "recast + pista": 1.er fallo → pista en español (y el porqué si es un error típico);
   2.º fallo → respuesta modelo + regla, y el turno entra al repaso.
   Modo jefe: sin traducción y hay que acertar el 80 % de los turnos para pasar. */
import {$,esc} from '../../../utilidades.js';
import {soporte,hablar,htmlMic,htmlOir,escucharConBoton} from '../../../nucleo/voz.js';
import {evaluarRespuesta} from '../../../nucleo/pronunciacion.js';
import {registrarEjercicio,registrarHabla,cambiarExtra} from '../../../nucleo/progreso.js';
import {barra} from '../../../nucleo/ui.js';
import {premiarTurno,htmlPremio,cerrarCombo,terminarConversacion} from './juego.js';

export const META_JEFE=0.8;

export function vistaDialogo(d,{jefe=false,volver='ingles/hablar',alTerminar}={}){
  let st;
  const nuevo=()=>({t:-1,intento:1,fase:'inicio',log:[],res:[],pistas:0,traduccion:false,escribir:!soporte.escuchar,decir:false,premio:null,error:null,fin:null});
  const turno=()=>d.turnos[st.t];

  function avanzar(){
    st.t++;st.intento=1;st.error=null;st.premio=null;
    if(st.t>=d.turnos.length){terminar();return}
    st.fase='turno';st.log.push({rol:'pj',texto:turno().dice,es:turno().es});st.decir=true;
  }
  function responder(alternativas,hablado,seg){
    const tu=turno(),r=evaluarRespuesta(alternativas,tu);
    if(hablado)registrarHabla({frases:1,turnos:1,seg:seg||0});
    st.log.push({rol:'yo',texto:r.dicho,ok:r.ok});
    if(r.ok){
      st.premio=premiarTurno(st.intento,hablado);
      registrarEjercicio({materia:'ingles',correcto:true,xp:0,repasar:false});
      st.res.push({ok:true,intentos:st.intento,dicho:r.dicho});st.fase='bien';return;
    }
    if(st.intento===1){st.intento=2;st.pistas++;st.error=r.error;st.fase='pista';return}
    cerrarCombo();
    registrarEjercicio({materia:'ingles',ref:`ingles/d/${d.id}/${st.t}`,correcto:false});
    st.res.push({ok:false,intentos:2,dicho:r.dicho});st.error=r.error;st.fase='fallo';
  }
  function terminar(){
    const ok=st.res.filter(r=>r.ok).length,n=d.turnos.length,pasa=ok/n>=META_JEFE,sinPistas=st.pistas===0&&ok===n;
    st.fase='fin';st.fin={ok,n,pasa,sinPistas};
    cambiarExtra('ingles',e=>{e.dialogos=e.dialogos||{};const p=e.dialogos[d.id]||{mejor:0,veces:0};
      e.dialogos[d.id]={mejor:Math.max(p.mejor,ok/n),veces:p.veces+1,jefe:p.jefe||(jefe&&pasa)}});
    terminarConversacion({turnos:ok,sinPistas,jefe,pasa});
    alTerminar?.(st.fin);
  }

  const burbuja=(m,k)=>m.rol==='pj'
    ?`<div class="burbuja pj"><span class="quien">${esc(d.personaje)}</span><span lang="en">${esc(m.texto)}</span>${htmlOir(m.texto)}${!jefe&&(st.traduccion||k<st.log.length-1)?`<span class="nota">${esc(m.es)}</span>`:''}</div>`
    :`<div class="burbuja yo ${m.ok?'ok':'mal'}"><span class="quien">Tú</span><span lang="en">${esc(m.texto)||'…'}</span></div>`;

  function htmlTurno(){
    const tu=turno();
    if(st.fase==='bien')return `<div class="result"><span class="allow">¡Bien!</span> <span class="nota">Así también se dice: <span lang="en">${esc(tu.modelo)}</span></span>${st.premio?htmlPremio(st.premio):''}</div>
<div class="row"><button class="btn" id="dl-sig">${st.t+1<d.turnos.length?'Siguiente':'Terminar'}</button></div>`;
    if(st.fase==='fallo')return `<div class="result"><span class="deny">Así se dice:</span> <b lang="en">${esc(tu.modelo)}</b> ${htmlOir(tu.modelo)}
${st.error?`<div class="fb-linea"><b>Por qué:</b> ${esc(st.error)}</div>`:''}<div class="fb-linea"><b>Regla:</b> ${tu.regla}</div><div class="fb-linea nota">Esta frase vuelve en Repasar hoy.</div></div>
<div class="row"><button class="btn" id="dl-sig">${st.t+1<d.turnos.length?'Siguiente':'Terminar'}</button></div>`;
    return `<div class="tu-turno"><b>Tu turno:</b> ${tu.tarea}${!jefe&&!st.traduccion?' <button class="enlace" id="dl-trad" type="button">Ver traducción</button>':''}</div>
${st.fase==='pista'?`<div class="result pista">${st.error?`<div><b>Casi.</b> ${esc(st.error)}</div>`:'<div><b>No te entendí del todo.</b></div>'}<div><b>Pista:</b> ${tu.pista}</div></div>`:''}
${!st.escribir?`${htmlMic('dl-mic',st.fase==='pista'?'Toca e inténtalo otra vez':'Toca y responde')}<div class="row centro"><button class="btn ghost btn-chico" id="dl-escribir" type="button">Prefiero escribir</button></div>`
  :`<form class="row" id="ej-form"><label for="dl-resp">Tu respuesta en inglés<input id="dl-resp" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en"></label><button class="btn" id="dl-ok">Enviar</button></form>${soporte.escuchar?'':'<p class="ej-pista">Tu navegador no reconoce voz (usa Chrome en Android para hablar): por ahora responde escribiendo.</p>'}`}`;
  }

  function htmlFin(){
    const f=st.fin,bien=st.res.map((r,k)=>({...r,k})).filter(r=>r.ok),mal=st.res.map((r,k)=>({...r,k})).filter(r=>!r.ok);
    return `<div class="card"><h3>${jefe?(f.pasa?'🏆 ¡Venciste al jefe!':'Casi: el jefe sigue en pie'):'Conversación terminada'}</h3>
<p class="prog-v">${f.ok} <small>de ${f.n} turnos bien${jefe?` · necesitas ${Math.ceil(f.n*META_JEFE)}`:''}${f.sinPistas?' · ¡sin pistas!':''}</small></p>${barra(f.ok,f.n)}
${bien.length?`<h4>Lo que dijiste bien</h4><ul class="lista-frases">${bien.map(r=>`<li lang="en">${esc(r.dicho)}</li>`).join('')}</ul>`:''}
${mal.length?`<h4>Para practicar (ya están en Repasar hoy)</h4><ul class="lista-frases">${mal.map(r=>`<li><span lang="en">${esc(d.turnos[r.k].modelo)}</span> ${htmlOir(d.turnos[r.k].modelo)}<span class="nota">${d.turnos[r.k].regla}</span></li>`).join('')}</ul>`:''}
<div class="row"><button class="btn" id="dl-otra">${jefe&&!f.pasa?'Intentar de nuevo':'Repetir'}</button><button class="btn ghost" data-go="${volver}">Volver</button></div></div>`;
  }

  return {
    titulo:`${jefe?'Jefe: ':''}${d.titulo}`,
    alEntrar(){st=nuevo()},
    vista(){
      const cab=`<p class="miga"><button class="enlace" data-go="${volver}">Hablar</button> › ${jefe?'Jefe de unidad':'Diálogo guiado'} · ${d.nivel}</p>
<h1>${jefe?'🏆 ':''}${d.titulo}</h1><p class="lead">${d.escena}${jefe?' Sin traducción: demuestra lo que sabes.':''}</p>`;
      if(st.fase==='inicio')return `${cab}<div class="card"><p>Vas a hablar con <b>${esc(d.personaje)}</b>: ${d.turnos.length} turnos. Escucha lo que dice y responde en voz alta. Hay varias respuestas válidas.</p>
<div class="row"><button class="btn" id="dl-empezar">Empezar</button></div></div>`;
      if(st.fase==='fin')return `${cab}<div class="chat">${st.log.map(burbuja).join('')}</div>${htmlFin()}`;
      return `${cab}<p class="progress">Turno ${st.t+1} de ${d.turnos.length}</p>${barra(st.t,d.turnos.length)}
<div class="chat">${st.log.map(burbuja).join('')}</div><div class="card turno-actual">${htmlTurno()}</div>`;
    },
    alMostrar(){
      if(st.decir){st.decir=false;hablar(turno().dice)}
      document.querySelector('.chat')?.lastElementChild?.scrollIntoView({block:'nearest'});
    },
    async alClic(t,ir,repintar){
      if(t.id==='dl-empezar'||t.id==='dl-otra'){if(t.id==='dl-otra')st=nuevo();avanzar();repintar();return true}
      if(t.id==='dl-sig'){avanzar();repintar();return true}
      if(t.id==='dl-trad'){st.traduccion=true;repintar();return true}
      if(t.id==='dl-escribir'){st.escribir=true;repintar();$('#dl-resp')?.focus();return true}
      if(t.id==='dl-ok'){const v=$('#dl-resp').value.trim();if(!v)return true;responder([v],false);repintar();return true}
      if(t.id==='dl-mic'){
        let res;
        try{res=await escucharConBoton(t)}catch(e){const est=$('#dl-mic-estado');if(est)est.textContent=e.message;return true}
        if(!res)return true;
        responder(res.alternativas,true,res.segundos);repintar();return true;
      }
    }
  };
}
