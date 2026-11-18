/* Práctica por nivel MCER (P3b): lo que se suma a las unidades de Hablar en cada nivel.
   Por nivel (a1.js … b2.js):
     lecturas    ≥ 6 textos graduados (60–220 palabras) con ≥ 4 preguntas escritas de comprensión
     escuchas    ≥ 6 audios (el texto se lee con la voz del teléfono; 40–160 palabras) con ≥ 3 preguntas
     vocabulario ≥ 400 palabras o expresiones por temas, cada una con su traducción y un ejemplo (con audio)
     escritura   ≥ 3 tareas guiadas (mensaje, correo, opinión) con su rúbrica
   Los diálogos guiados del nivel (≥ 8) viven en hablar/dialogos.js con su campo nivel.
   Sin DOM: también lo lee npm run revisar.
   El repaso guarda 'n/<id>/<pregunta>' (lecturas y escuchas) y 'v/<nivel>/<tema>/<palabra>' (vocabulario): agrega
   preguntas, temas y palabras AL FINAL de cada lista y no cambies los ids. */
import A1 from './a1.js';
import A2 from './a2.js';
import B1 from './b1.js';
import B2 from './b2.js';

export const NIVELES={A1,A2,B1,B2};
export const MINIMOS={lecturas:6,escuchas:6,vocabulario:400,escritura:3,dialogos:8};

export {q,crit} from './base.js';
// Vocabulario: un renglón por palabra «en | es | ejemplo»
export const palabrasDe=t=>(t.lista||[]).length?t.lista:String(t.palabras||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const [en,es,ej]=l.split('|').map(x=>x.trim());return {en,es,ej}});
export const totalPalabras=n=>(NIVELES[n]?.vocabulario||[]).reduce((s,t)=>s+palabrasDe(t).length,0);
export const contarPalabras=t=>String(t||'').trim().split(/\s+/).filter(Boolean).length;
// Todas las lecturas y escuchas, por id
export const textoPorId=id=>{for(const [n,d] of Object.entries(NIVELES))for(const tipo of ['lecturas','escuchas']){const x=d[tipo].find(y=>y.id===id);if(x)return {...x,nivel:n,tipo}}return null};

/* ---------- escritura guiada con rúbrica ----------
   Cada criterio se comprueba solo (sin IA): una expresión regular que debe aparecer (re) o no aparecer (no), o la
   cantidad de palabras. Con IA configurada se puede pedir además una revisión con la misma rúbrica (vistas.js). */
export function revisarEscrito(tarea,texto){
  const n=contarPalabras(texto),t=String(texto||'');
  const res=[{texto:`Entre ${tarea.min} y ${tarea.max} palabras`,ok:n>=tarea.min&&n<=tarea.max,ayuda:n<tarea.min?`Llevas ${n}: te faltan ${tarea.min-n}.`:`Llevas ${n}: recorta ${n-tarea.max}.`}];
  for(const c of tarea.criterios){const hay=new RegExp(c.re,'im').test(t);res.push({texto:c.texto,ok:c.no?!hay:hay,ayuda:c.ayuda})}
  return {criterios:res,puntos:res.filter(x=>x.ok).length,total:res.length,palabras:n};
}
