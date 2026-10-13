/* Evaluador aproximado de pronunciación. Web Speech no da puntaje fonético, así que se compara
   la frase objetivo con lo que entendió el reconocedor (y sus alternativas), palabra por palabra.
   Sin DOM: se puede probar con Node. Los sonidos (diccionario de errores) los pasa cada materia. */

const CONTRACCIONES={"i'm":'i am',"you're":'you are',"we're":'we are',"they're":'they are',"he's":'he is',"she's":'she is',"it's":'it is',
  "that's":'that is',"there's":'there is',"what's":'what is',"where's":'where is',"who's":'who is',"how's":'how is',"let's":'let us',
  "isn't":'is not',"aren't":'are not',"wasn't":'was not',"weren't":'were not',"don't":'do not',"doesn't":'does not',"didn't":'did not',
  "can't":'can not',"cannot":'can not',"couldn't":'could not',"won't":'will not',"wouldn't":'would not',"shouldn't":'should not',
  "haven't":'have not',"hasn't":'has not',"hadn't":'had not',"i've":'i have',"you've":'you have',"we've":'we have',"they've":'they have',
  "i'll":'i will',"you'll":'you will',"he'll":'he will',"she'll":'she will',"we'll":'we will',"they'll":'they will',"it'll":'it will',
  "i'd":'i would',"you'd":'you would',"we'd":'we would',"they'd":'they would',"gonna":'going to',"wanna":'want to',"ok":'okay'};
const NUMEROS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
// Palabras que suenan igual: si el reconocedor escribe la otra, la pronunciación fue correcta
const HOMOFONOS=[['to','too','two'],['for','four'],['there','their',"they're"],['right','write'],['know','no'],['hear','here'],['see','sea'],
  ['by','buy','bye'],['one','won'],['week','weak'],['meet','meat'],['new','knew'],['eight','ate'],['hour','our'],['its',"it's"],['your',"you're"],['wear','where'],['i','eye']];
const homofonos=(a,b)=>HOMOFONOS.some(g=>g.includes(a)&&g.includes(b));

// Texto → palabras normalizadas, cada una con el índice de la palabra original (para mostrar la frase tal cual)
export function palabras(texto){
  const orig=String(texto).trim().split(/\s+/).filter(Boolean),norm=[];
  orig.forEach((w,i)=>{
    let t=w.toLowerCase().replace(/[’‘`´]/g,"'").replace(/[^a-z0-9'\-]/g,'').replace(/^'+|'+$/g,'');
    if(!t)return;
    t=CONTRACCIONES[t]||t;
    for(const p of t.split(/[\s-]+/)){
      const n=/^\d+$/.test(p)&&+p<=20?NUMEROS[+p]:p;
      if(n)norm.push({w:n,i});
    }
  });
  return {orig,norm};
}
export const normalizar=texto=>palabras(texto).norm.map(x=>x.w).join(' ');

// Distancia de edición entre dos cadenas (caracteres)
export function distancia(a,b){
  const d=Array.from({length:a.length+1},(_,i)=>[i]);
  for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[a.length][b.length];
}
const parecidas=(a,b)=>a!==b&&distancia(a,b)<=(Math.max(a.length,b.length)<=4?1:2);

// Alineación palabra a palabra (Levenshtein con retroceso): para cada palabra objetivo, qué se oyó en su lugar
function alinear(obj,oido){
  const n=obj.length,m=oido.length,costo=(a,b)=>a===b||homofonos(a,b)?0:parecidas(a,b)?0.4:1;
  const d=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=1;i<=n;i++)d[i][0]=i;
  for(let j=1;j<=m;j++)d[0][j]=j*0.6;
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+0.6,d[i-1][j-1]+costo(obj[i-1],oido[j-1]));
  const pares=new Array(n).fill(null),extra=[];let i=n,j=m;
  while(i>0||j>0){
    if(i>0&&j>0&&Math.abs(d[i][j]-(d[i-1][j-1]+costo(obj[i-1],oido[j-1])))<1e-9){pares[i-1]=oido[j-1];i--;j--}
    else if(i>0&&Math.abs(d[i][j]-(d[i-1][j]+1))<1e-9){pares[i-1]=null;i--}
    else{extra.unshift(oido[j-1]);j--}
  }
  return {pares,extra};
}

/* Evalúa una frase. alternativas: [{transcripcion, confianza}] del reconocedor; se queda con la que mejor puntúa.
   Devuelve {puntaje 0–100, transcripcion, palabras:[{texto, estado:'ok'|'parecida'|'mal', oido}], extra, detecciones:[{sonido, palabra, oido}],
             sonidos:{id:[aciertos, intentos]}} */
export function evaluar(objetivo,alternativas,{sonidos=[]}={}){
  const {orig,norm}=palabras(objetivo),obj=norm.map(x=>x.w);
  let mejor=null;
  for(const alt of (alternativas||[]).filter(a=>a&&typeof a.transcripcion==='string')){
    const oido=palabras(alt.transcripcion).norm.map(x=>x.w),{pares,extra}=alinear(obj,oido);
    const estados=obj.map((w,k)=>{const h=pares[k];return h===w||(h&&homofonos(w,h))?'ok':h&&parecidas(w,h)?'parecida':'mal'});
    // Un error típico de hispanohablantes no es ruido del reconocedor: esa palabra cuenta como mal aunque se parezca
    const detecciones=[];
    obj.forEach((w,k)=>{if(estados[k]==='ok')return;
      for(const s of sonidos)if(s.detecta(w,pares[k])){estados[k]='mal';if(!detecciones.some(x=>x.sonido===s.id))detecciones.push({sonido:s.id,palabra:w,oido:pares[k]})}});
    const base=obj.length?estados.reduce((s,e)=>s+(e==='ok'?1:e==='parecida'?0.5:0),0)/obj.length:0;
    const conf=alt.confianza>0?0.85+0.15*Math.min(1,alt.confianza):1;
    const puntaje=Math.max(0,Math.min(100,Math.round(100*(base-Math.min(0.2,0.05*extra.length))*conf)));
    if(!mejor||puntaje>mejor.puntaje)mejor={puntaje,transcripcion:alt.transcripcion,pares,estados,extra,detecciones};
  }
  if(!mejor)mejor={puntaje:0,transcripcion:'',pares:obj.map(()=>null),estados:obj.map(()=>'mal'),extra:[],detecciones:[]};
  // Estado de cada palabra original: el peor de sus partes (I'm = i + am)
  const rango={ok:0,parecida:1,mal:2},porOrig=orig.map(t=>({texto:t,estado:'ok',oido:[]}));
  norm.forEach((x,k)=>{const o=porOrig[x.i];if(rango[mejor.estados[k]]>rango[o.estado])o.estado=mejor.estados[k];if(mejor.pares[k])o.oido.push(mejor.pares[k])});
  // Estadísticas por sonido: de cada palabra que tiene el sonido, si salió bien
  const stats={};
  obj.forEach((w,k)=>{for(const s of sonidos)if(s.contiene(w)){stats[s.id]=stats[s.id]||[0,0];stats[s.id][1]++;if(mejor.estados[k]==='ok')stats[s.id][0]++}});
  return {puntaje:mejor.puntaje,transcripcion:mejor.transcripcion,palabras:porOrig.filter(p=>p.texto.replace(/[^\p{L}\p{N}]/gu,'')).map(p=>({texto:p.texto,estado:p.estado,oido:p.oido.join(' ')})),
    extra:mejor.extra,detecciones:mejor.detecciones,sonidos:stats};
}

/* Respuesta libre de un turno: primero los errores típicos (en cualquier alternativa del reconocedor),
   después los patrones aceptados. Devuelve {ok, error: explicación|null, dicho: la transcripción usada}. */
export function evaluarRespuesta(alternativas,{acepta,errores={}}){
  const alts=(alternativas||[]).map(a=>typeof a==='string'?a:a.transcripcion).filter(Boolean);
  for(const dicho of alts)if(encaja(dicho,acepta)){
    const err=Object.entries(errores).find(([p])=>encaja(dicho,[p]));
    if(!err)return {ok:true,error:null,dicho};
  }
  for(const dicho of alts){const err=Object.entries(errores).find(([p])=>encaja(dicho,[p]));if(err)return {ok:false,error:err[1],dicho}}
  return {ok:false,error:null,dicho:alts[0]||''};
}

/* Respuesta libre (diálogos): ¿lo que dijo encaja con alguno de los patrones aceptados?
   Patrones en inglés con * como comodín de una o más palabras: "my name is *", "i am from *".
   Un patrón que empieza con = exige la frase completa ("=yes" no encaja con "yes please");
   con ^ tiene que estar al principio ("^is delicious *" no encaja con "yes it is delicious"). */
export function encaja(dicho,patrones){
  const t=' '+normalizar(dicho)+' ';
  return patrones.some(p=>{
    if(p.startsWith('='))return t.trim()===normalizar(p.slice(1));
    const inicio=p.startsWith('^');
    const partes=normalizar((inicio?p.slice(1):p).replace(/\*/g,' ESTRELLA ')).split(' ').map(w=>w==='estrella'?'(?:\\S+ )*?\\S+':w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    return new RegExp((inicio?'^ ':' ')+partes.join(' ')+' ').test(t);
  });
}
