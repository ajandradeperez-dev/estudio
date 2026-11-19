/* 🎯 Prueba de nivel de Inglés (adaptativa, 15–20 min). Empieza en A2 y sube o baja: dos aciertos seguidos suben un
   nivel, dos fallos seguidos lo bajan. Alterna uso del idioma (generadores del nivel), lectura y escucha (textos de la
   práctica por nivel). Sin pistas ni corrección hasta el final. El nivel estimado es el más alto con ≥ 60 % de aciertos
   en al menos 3 preguntas. Al final: fortalezas y debilidades por habilidad, «Ajustar mi punto de partida» (marca como
   sabido lo de niveles inferiores, sin borrar nada) y la parte de habla opcional (la de un simulacro de ese nivel).
   Se puede repetir cada 14 días; el historial (extra.pruebaNivel) muestra la evolución. */
import {esc} from '../../../utilidades.js';
import {soporte} from '../../../nucleo/voz.js';
import {crearSesion} from '../../../nucleo/sesion.js';
import {deBanco} from '../../../nucleo/ejercicios.js';
import {crear} from '../../../nucleo/generadores/index.js';
import {registrarEjercicio,cambiarExtra,progreso,datosMateria,hoy,sumarDias,marcarSabidas} from '../../../nucleo/progreso.js';
import {barra} from '../../../nucleo/ui.js';
import {NIVELES as PRACTICA} from '../nivel/datos.js';
import {SIMULACROS,siguienteNivel,estimar,habilidadesDebajo} from './motor.js';

const RAIZ='estudio/ingles/simulacros';
export const PREGUNTAS=18,DIAS_ENTRE=14;
const HABILIDADES=['uso','lectura','escucha'];
const NOMBRE={uso:'Uso del idioma',lectura:'Lectura',escucha:'Escucha'};
const GEN={A1:['en/to-be','en/presente-simple','en/there-is','en/can','en/posesivos','en/preposiciones'],A2:['en/pasado-simple','en/futuro','en/comparativos','en/contables','en/should'],
  B1:['en/presente-perfecto','en/condicionales','en/pasiva','en/modales','en/relativas','en/gerundio-infinitivo'],B2:['en/condicional-3','en/reported-speech','en/pasiva-avanzada','en/deduccion','en/wish','en/collocations']};
const elegir=a=>a[Math.floor(Math.random()*a.length)];
const historialPrueba=()=>datosMateria(progreso(),'ingles').extra.pruebaNivel||[];
export const proximaPrueba=()=>{const u=historialPrueba().at(-1);return u?sumarDias(u.fecha,DIAS_ENTRE):hoy()};
const puedeHacerla=()=>window.__sinEsperaPrueba||proximaPrueba()<=hoy();

// Una pregunta del nivel y la habilidad pedidos
export function preguntaNivel(nivel,hab,usadas=new Set()){
  if(hab==='uso'){const id=elegir(GEN[nivel]),p=crear(id,3);return p&&{...p,nivelPrueba:nivel,hab,lang:'en',materia:'ingles',tolera:false,etiqueta:`🎯 Prueba de nivel · ${NOMBRE.uso}`}}
  const tipo=hab==='lectura'?'lecturas':'escuchas',ts=PRACTICA[nivel]?.[tipo]||[];
  const pool=ts.flatMap(t=>t.preguntas.map((q,i)=>({t,q,k:`${t.id}.${i}`}))).filter(x=>!usadas.has(x.k));
  if(!pool.length)return preguntaNivel(nivel,'uso',usadas);
  const {t,q,k}=elegir(pool);usadas.add(k);
  const base=deBanco(q,{materia:'ingles'});
  // en la escucha el texto no se ve (solo el audio); si el navegador no puede leer en voz alta, se muestra
  const verTexto=hab==='lectura'||!soporte.hablar;
  return {...base,enunciado:verTexto?`<pre class="sim-texto" lang="en">${esc(t.texto)}</pre>${base.enunciado}`:base.enunciado,oir:hab==='escucha'&&soporte.hablar?t.texto:undefined,
    lang:'en',tolera:false,nivelPrueba:nivel,hab,etiqueta:`🎯 Prueba de nivel · ${NOMBRE[hab]}`};
}
export const htmlPruebaNivel=()=>{const h=historialPrueba(),u=h.at(-1);
  return `<button class="card click destacado" data-go="${RAIZ}/prueba-nivel"><span class="destacado-titulo">🎯 Prueba de nivel (15–20 min)</span><span class="nota">${u?`Tu último resultado: <b>${u.nivel}</b> (${u.fecha}).`:'Adaptativa: empieza en A2 y sube o baja según tus respuestas.'}</span></button>`};

export function vistaPruebaNivel(){
  let ses=null,nivel='A2',usadas=new Set();
  function empezar(){
    nivel='A2';usadas=new Set();
    ses=crearSesion({titulo:'Prueba de nivel',tono:'estudio',salir:`${RAIZ}/prueba-nivel`,sinPistas:true,sinFeedback:true,materia:'ingles',
      total:()=>PREGUNTAS,
      siguiente(st){if(st.i>=PREGUNTAS)return null;nivel=siguienteNivel(nivel,st.historial);return preguntaNivel(nivel,HABILIDADES[st.i%3],usadas)},
      responder(p,r){registrarEjercicio({materia:'ingles',correcto:r.correcto,repasar:false,xp:r.correcto?5:0});return {}},
      fin(st){
        const e=estimar(st.historial);
        if(!st.guardado){st.guardado=true;cambiarExtra('ingles',x=>{x.pruebaNivel=[...(x.pruebaNivel||[]),{fecha:hoy(),nivel:e.nivel,total:e.total,hab:Object.fromEntries(Object.entries(e.hab).map(([k,[a,t]])=>[k,t?a/t:0]))}].slice(-30)})}
        const hab=Object.entries(e.hab).map(([k,[a,t]])=>[k,t?a/t:0]).sort((a,b)=>b[1]-a[1]);
        const debajo=habilidadesDebajo(e.nivel),hs=historialPrueba(),sim=SIMULACROS.find(s=>s.nivel===e.nivel&&s.habla);
        return `<span class="fin-icono" aria-hidden="true">🎯</span><h1>Tu nivel estimado: ${e.nivel}</h1><p class="nota">${Math.round(e.total*100)} % de aciertos · no es un examen oficial, es una guía para saber por dónde seguir.</p>
<div class="card" style="text-align:left;width:100%">${hab.map(([k,v])=>`<div class="mp-prep"><span>${NOMBRE[k]}</span>${barra(Math.round(v*100),100)}<span class="nota">${Math.round(v*100)} %</span></div>`).join('')}
${hab.length?`<p style="margin-bottom:0">💪 Tu fuerte: <b>${NOMBRE[hab[0][0]].toLowerCase()}</b> · 🎯 A reforzar: <b>${NOMBRE[hab.at(-1)[0]].toLowerCase()}</b>.</p>`:''}</div>
${debajo.length?`<button class="btn ancho area" id="pn-ajustar">Ajustar mi punto de partida a ${e.nivel}</button><p class="nota">Marca como sabidas las habilidades de los niveles anteriores que todavía no dominas (${debajo.length} en total). No se borra nada de lo que ya practicaste.</p>`:''}
${sim?`<button class="btn ghost ancho" data-go="${RAIZ}/${sim.id}">🗣️ Probar también tu habla (opcional)</button>`:''}
${hs.length>1?`<p class="nota">Tu evolución: ${hs.slice(-6).map(x=>`${x.fecha} ${x.nivel}`).join(' → ')}</p>`:''}
<button class="btn ghost ancho" data-go="${RAIZ}">Volver a Simulacros</button>`;
      }});
    ses.alEntrar();
  }
  return {titulo:'Prueba de nivel',get inmersiva(){return !!ses},alEntrar(){ses=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const hs=historialPrueba(),u=hs.at(-1);
      return `<div class="area-estudio"><p class="miga"><button class="enlace" data-go="${RAIZ}">Simulacros</button> › Prueba de nivel</p><h1>🎯 Prueba de nivel</h1>
<p class="intro">${PREGUNTAS} preguntas (15–20 minutos) de uso del idioma, lectura y escucha. Empieza en A2: si aciertas sube, si fallas baja. No verás si acertaste hasta el final.</p>
${u?`<div class="card"><p style="margin:0">Último resultado: <b>${u.nivel}</b> (${u.fecha}).${hs.length>1?` Evolución: ${hs.slice(-6).map(x=>x.nivel).join(' → ')}.`:''}</p></div>`:''}
${puedeHacerla()?`<button class="btn ancho area" id="pn-empezar">Empezar la prueba</button>`:`<p class="aviso-linea">Puedes repetirla cada ${DIAS_ENTRE} días para ver tu evolución. La próxima: <b>${proximaPrueba()}</b>. Mientras tanto, practica con los simulacros.</p>`}</div>`},
    alMostrar(){ses?.alMostrar()},
    async alClic(t,ir,repintar){
      if(t.id==='pn-ajustar'){const e=estimar(ses.estado().historial),n=marcarSabidas('ingles',habilidadesDebajo(e.nivel));t.disabled=true;t.textContent=`✅ Listo: ${n.length} ${n.length===1?'habilidad marcada':'habilidades marcadas'} como sabidas`;return true}
      if(ses)return ses.alClic(t,ir,repintar);
      if(t.id==='pn-empezar'){empezar();repintar();window.scrollTo(0,0);return true}
    }};
}
