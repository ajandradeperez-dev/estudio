/* Generadores de Inglés con bancos de palabras (A1–A2): conjugación (present simple y continuous, past simple,
   present perfect), artículos, plurales irregulares, preposiciones, ordenar palabras, traducir y frases hechas.
   Se aceptan varias respuestas válidas (contracciones, mayúsculas, puntuación). Cada pregunta trae la frase completa
   (frase) para poder practicarla en voz alta. */
import {igualTexto,normalTexto} from './verificar.js';
import {CONTENIDO} from '../../materias/ingles/hablar/contenido.js';
import {paso,final,marca} from './pasos.js';

const en=t=>`<span lang="en">${t}</span>`;
// Pasos de gramática: sujeto y tiempo → regla → aplicar → contraste con el error típico de hispanohablantes
const pasosEn=({suj,tiempo,regla,aplicar,res,bien,mal,por})=>[
  paso('Mira el sujeto y el tiempo',`Sujeto: <b>${en(suj)}</b> · ${tiempo}`,'En inglés la forma del verbo depende de quién hace la acción y de cuándo pasa.'),
  paso('Recuerda la regla',regla,'Es la misma para todos los verbos de este tiempo.'),
  paso('Aplícala',aplicar,'Sustituye en la regla con este sujeto y este verbo.'),
  final('Compara con el error típico',`✓ ${en(bien)}<br>✗ ${en(mal)}`,por,res,{ojo:por})];

// base, 3.ª persona, -ing, pasado, participio, complementos [inglés, español]
const V={
  work:['works','working','worked','worked',[['in an office','en una oficina'],['from home','desde casa'],['at a bank','en un banco']]],
  live:['lives','living','lived','lived',[['in Madrid','en Madrid'],['near the park','cerca del parque']]],
  play:['plays','playing','played','played',[['soccer','fútbol'],['the guitar','la guitarra'],['video games','videojuegos']]],
  study:['studies','studying','studied','studied',[['English','inglés'],['at night','de noche'],['math','matemáticas']]],
  watch:['watches','watching','watched','watched',[['TV','la tele'],['movies','películas'],['the news','las noticias']]],
  go:['goes','going','went','gone',[['to work by bus','al trabajo en autobús'],['to the gym','al gimnasio']]],
  have:['has','having','had','had',[['a dog','un perro'],['two brothers','dos hermanos']]],
  eat:['eats','eating','ate','eaten',[['pizza','pizza'],['vegetables','verduras']]],
  write:['writes','writing','wrote','written',[['emails','correos'],['reports','informes']]],
  read:['reads','reading','read','read',[['the news','las noticias'],['books','libros']]],
  drink:['drinks','drinking','drank','drunk',[['coffee','café'],['water','agua']]],
  run:['runs','running','ran','run',[['in the park','en el parque'],['every morning','todas las mañanas']]],
  swim:['swims','swimming','swam','swum',[['in the sea','en el mar'],['on Saturdays','los sábados']]],
  make:['makes','making','made','made',[['dinner','la cena'],['coffee','café']]],
  buy:['buys','buying','bought','bought',[['bread','pan'],['new shoes','zapatos nuevos']]],
  see:['sees','seeing','saw','seen',[['my friends','a mis amigos'],['the doctor','al médico']]],
  speak:['speaks','speaking','spoke','spoken',[['Spanish','español'],['English at work','inglés en el trabajo']]],
  fix:['fixes','fixing','fixed','fixed',[['computers','computadoras'],['the printer','la impresora']]],
  send:['sends','sending','sent','sent',[['messages','mensajes'],['the report','el informe']]],
  stop:['stops','stopping','stopped','stopped',[['at the corner','en la esquina']]],
  travel:['travels','traveling','traveled','traveled',[['to Mexico','a México'],['by train','en tren']]]
};
const REGULARES=['work','live','play','visit','watch','study','stop','travel','fix'].filter(v=>V[v]);
const IRREGULARES=['go','have','eat','write','read','drink','run','swim','make','buy','see','speak','send'];
const SUJ=[['I','yo',0],['You','tú',1],['He','él',2],['She','ella',2],['We','nosotros',3],['They','ellos',4],['My brother','mi hermano',2],['Maria','María',2],['The students','los estudiantes',4]];
const tercera=s=>s[2]===2;
const be=s=>s[2]===0?'am':tercera(s)?'is':'are';
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1),min=s=>s==='I'?s:s.charAt(0).toLowerCase()+s.slice(1);
const conLang=x=>({lang:'en',...x});
// pregunta de completar un hueco con el verbo entre paréntesis
function hueco({antes,pista,despues,acepta,frase,regla,errores=[],ayuda,pasos}){
  return conLang({enunciado:`Completa: <span lang="en"><b>${antes} ___ ${despues}</b></span> <span class="nota">(${pista})</span>`,respuesta:acepta[0],verificar:e=>igualTexto(e,acepta),frase,regla,errores,pista:ayuda,clave:`${antes}|${pista}|${despues}`,pasos});
}
const malo=(valor,por)=>({valor,por,si:e=>igualTexto(e,[valor])});

const presenteSimple={
  titulo:'Present simple',
  alternativa:'Piensa que el inglés casi no cambia el verbo: <i>I work, you work, we work, they work</i>. Solo hay <b>una excepción</b>: he, she, it (una persona o cosa que no eres tú ni yo) le agrega una -s: <i>she works</i>. Para negar o preguntar aparece un ayudante, do/does, y como el ayudante ya lleva la -s, el verbo se queda sin ella.',
  explicacion:'Con he, she, it (y nombres en singular) el verbo lleva -s (works, goes, studies, has). Negativo: don\'t / doesn\'t + verbo base. Pregunta: Do / Does + sujeto + verbo base.',
  generar(n,rng){
    const R='Present simple: I/you/we/they + verbo base; he/she/it + verbo con -s (-es, -ies; have → has). Negativo y pregunta con do/does, y el verbo vuelve a la forma base.';
    const v=rng.elegir(n<=1?REGULARES:Object.keys(V)),[s3,,,,comp]=V[v],[c]=rng.elegir(comp),s=n<=1?rng.elegir(SUJ.filter(tercera)):rng.elegir(SUJ);
    const tipo=n<=2?'af':n===3?'neg':n===4?'preg':rng.elegir(['af','neg','preg']);
    if(tipo==='af'){const f=tercera(s)?s3:v;return hueco({antes:s[0],pista:v,despues:c+'.',acepta:[f],frase:`${s[0]} ${f} ${c}.`,regla:R,ayuda:tercera(s)?'Es tercera persona.':'No es tercera persona.',
      pasos:pasosEn({suj:s[0],tiempo:'present simple (hábito o rutina)',regla:tercera(s)?'he / she / it → verbo + <b>s</b>':'I / you / we / they → verbo <b>base</b> (sin -s)',aplicar:`${en(v)} → ${marca(f)}`,res:f,bien:`${s[0]} ${f} ${c}.`,
        mal:`${s[0]} ${tercera(s)?v:s3} ${c}.`,por:tercera(s)?'En español la terminación (trabaj<b>a</b>) ya dice quién es; en inglés hay que acordarse de la -s.':'La -s es solo para he / she / it.'}),
      errores:tercera(s)?[malo(v,`Con ${min(s[0])} el verbo lleva -s: ${s3}.`)]:[malo(s3,`Con ${min(s[0])} el verbo va sin -s: ${v}.`)]})}
    const aux=tercera(s)?'does':'do';
    if(tipo==='neg')return hueco({antes:s[0],pista:`not / ${v}`,despues:c+'.',acepta:[`${aux} not ${v}`,`${aux}n't ${v}`],frase:`${s[0]} ${aux}n't ${v} ${c}.`,regla:R,ayuda:`Usa ${aux}n't.`,
      pasos:pasosEn({suj:s[0],tiempo:'present simple negativo',regla:`${tercera(s)?'he / she / it → <b>doesn\'t</b>':'I / you / we / they → <b>don\'t</b>'} + verbo base`,aplicar:`${marca(aux+"n't")} + ${en(v)}`,res:`${aux} not ${v}`,
        bien:`${s[0]} ${aux}n't ${v} ${c}.`,mal:`${s[0]} no ${tercera(s)?s3:v} ${c}.`,por:'En español basta "no" antes del verbo; en inglés se niega con don\'t / doesn\'t, y el verbo queda sin -s.'}),
      errores:[malo(`${aux}n't ${s3}`,`Después de ${aux}n't el verbo va en forma base: ${v}.`),...(tercera(s)?[malo(`don't ${v}`,`Con ${min(s[0])} es doesn't.`)]:[malo(`doesn't ${v}`,`Con ${min(s[0])} es don't.`)])]});
    const q=`${cap(aux)} ${min(s[0])} ${v} ${c}?`,af=`${s[0]} ${tercera(s)?s3:v} ${c}.`;
    return conLang({enunciado:`Escribe la pregunta: <span lang="en"><b>${af}</b></span>`,respuesta:q,verificar:e=>igualTexto(e,[q]),frase:q,regla:R,pista:`Empieza con ${cap(aux)}.`,clave:af,
      pasos:pasosEn({suj:s[0],tiempo:'present simple, pregunta',regla:'<b>Do / Does</b> + sujeto + verbo base + ?',aplicar:`${marca(cap(aux))} + ${en(min(s[0]))} + ${en(v)} …`,res:q,bien:q,mal:`${s[0]} ${tercera(s)?s3:v} ${c}?`,por:'En español basta la entonación; en inglés la pregunta necesita Do / Does al principio.'}),
      errores:[{si:e=>normalTexto(e).includes(normalTexto(`${aux} ${min(s[0])} ${s3}`))&&s3!==v,por:`En la pregunta el verbo vuelve a la forma base: ${aux} ${min(s[0])} ${v}.`},{si:e=>normalTexto(e).startsWith(tercera(s)?'do ':'does '),por:`Con ${min(s[0])} la pregunta empieza con ${cap(aux)}.`}]});
  }
};

const ING_ESPECIAL=['run','swim','stop','make','write','travel','have'];
const presenteContinuo={
  titulo:'Present continuous',
  alternativa:'Es exactamente el "estoy + -ando/-iendo" del español: <i>estoy trabajando</i> = <b>I am working</b>. El "estar" es am/is/are y el -ando/-iendo es -ing. Úsalo para lo que pasa justo ahora.',
  explicacion:'Algo que pasa ahora: am / is / are + verbo con -ing (I am working, she is reading). Ojo con la ortografía: run → running, make → making.',
  generar(n,rng){
    const R='Present continuous: am/is/are + verbo-ing. Si termina en -e se quita (making); consonante-vocal-consonante dobla la última (running, swimming, stopping).';
    const v=rng.elegir(n===3?ING_ESPECIAL:Object.keys(V)),[s3,ing,,,comp]=V[v],[c]=rng.elegir(comp),s=n===1?rng.elegir(SUJ.filter(tercera)):rng.elegir(SUJ),b=be(s);
    const tipo=n<=3?'af':n===4?'neg':rng.elegir(['af','neg','preg']);
    const malIng=v.endsWith('e')&&!v.endsWith('ee')?`${v}ing`:`${v}ing`;
    if(tipo==='af')return hueco({antes:s[0],pista:v,despues:`${c} now.`,acepta:[`${b} ${ing}`],frase:`${s[0]} ${b} ${ing} ${c} now.`,regla:R,ayuda:`Usa ${b} + -ing.`,
      pasos:pasosEn({suj:s[0],tiempo:'present continuous (ahora mismo)',regla:'<b>am / is / are</b> + verbo-<b>ing</b>',aplicar:`${marca(b)} + ${en(ing)}`,res:`${b} ${ing}`,bien:`${s[0]} ${b} ${ing} ${c} now.`,mal:`${s[0]} ${tercera(s)?s3:v} ${c} now.`,por:'Para algo que pasa ahora se usa am / is / are + -ing (como "estoy trabajando"), no el presente simple.'}),
      errores:[malo(ing,`Falta el verbo to be: ${b} ${ing}.`),...(malIng!==ing?[malo(`${b} ${malIng}`,`Ortografía: ${ing}.`)]:[]),...['am','is','are'].filter(x=>x!==b).map(x=>malo(`${x} ${ing}`,`Con ${min(s[0])} va ${b}.`))]});
    if(tipo==='neg')return hueco({antes:s[0],pista:`not / ${v}`,despues:`${c} now.`,acepta:[`${b} not ${ing}`,b==='am'?`'m not ${ing}`:`${b}n't ${ing}`],frase:`${s[0]} ${b} not ${ing} ${c} now.`,regla:R,ayuda:`${b} not + -ing.`,
      pasos:pasosEn({suj:s[0],tiempo:'present continuous negativo',regla:'am / is / are + <b>not</b> + verbo-ing',aplicar:`${en(b)} ${marca('not')} ${en(ing)}`,res:`${b} not ${ing}`,bien:`${s[0]} ${b} not ${ing} ${c} now.`,mal:`${s[0]} don't ${ing} ${c} now.`,por:'El continuo se niega con am / is / are not; don\'t es del presente simple.'}),
      errores:[malo(`don't ${ing}`,'El continuo se niega con am/is/are not, no con don\'t.'),malo(`${b} not ${v}`,`Falta el -ing: ${ing}.`)]});
    const q=`${cap(b)} ${min(s[0])} ${ing} ${c} now?`;
    return conLang({enunciado:`Escribe la pregunta: <span lang="en"><b>${s[0]} ${b} ${ing} ${c} now.</b></span>`,respuesta:q,verificar:e=>igualTexto(e,[q]),frase:q,regla:R,pista:`Empieza con ${cap(b)}.`,clave:q,
      pasos:pasosEn({suj:s[0],tiempo:'present continuous, pregunta',regla:'<b>Am / Is / Are</b> + sujeto + verbo-ing + ?',aplicar:`${marca(cap(b))} + ${en(min(s[0]))} + ${en(ing)} …`,res:q,bien:q,mal:`${s[0]} ${b} ${ing} ${c} now?`,por:'En la pregunta am / is / are va antes del sujeto.'}),
      errores:[{si:e=>normalTexto(e).startsWith('do'),por:'El continuo pregunta con am/is/are delante del sujeto, no con do.'}]});
  }
};

const pasadoSimple={
  titulo:'Past simple',
  alternativa:'En pasado el inglés es más fácil que el español: <b>la misma forma para todos</b> (I worked, she worked, they worked). Los regulares agregan -ed; los irregulares hay que aprenderlos como vocabulario (go → went). Para negar o preguntar, el ayudante did ya dice "pasado", así que el verbo vuelve a su forma normal.',
  explicacion:'Regulares: -ed (worked, studied, stopped). Irregulares se aprenden (go → went, buy → bought). Negativo y pregunta con did + verbo BASE.',
  generar(n,rng){
    const R='Past simple: regulares con -ed (study → studied, stop → stopped); irregulares de memoria (go → went). Con did / didn\'t el verbo va en forma base.';
    const v=rng.elegir(n<=2?REGULARES:IRREGULARES),[,,past,,comp]=V[v],[c]=rng.elegir(comp),s=rng.elegir(SUJ),t=rng.elegir(['yesterday','last week','last year']);
    const tipo=n<=3?'af':n===4?'neg':rng.elegir(['af','neg','preg']);
    if(tipo==='af')return hueco({antes:s[0],pista:v,despues:`${c} ${t}.`,acepta:[past],frase:`${s[0]} ${past} ${c} ${t}.`,regla:R,ayuda:IRREGULARES.includes(v)?'Es irregular.':'Es regular: -ed.',
      pasos:pasosEn({suj:s[0],tiempo:`past simple (${t})`,regla:IRREGULARES.includes(v)?`${en(v)} es <b>irregular</b>: su pasado se aprende de memoria`:'Regular: verbo + <b>-ed</b> (igual para todas las personas)',aplicar:`${en(v)} → ${marca(past)}`,res:past,bien:`${s[0]} ${past} ${c} ${t}.`,
        mal:`${s[0]} ${IRREGULARES.includes(v)?v+'ed':V[v][0]} ${c} ${t}.`,por:IRREGULARES.includes(v)?`${v} es irregular: no lleva -ed.`:'Con yesterday / last… el verbo va en pasado, no en presente.'}),
      errores:[malo(`${v}ed`,`${v} es irregular: ${past}.`),malo(v,`Es pasado: ${past}.`),malo(V[v][0],`Eso es presente; en pasado: ${past}.`)].filter(e=>e.valor!==past)});
    if(tipo==='neg')return hueco({antes:s[0],pista:`not / ${v}`,despues:`${c} ${t}.`,acepta:[`did not ${v}`,`didn't ${v}`],frase:`${s[0]} didn't ${v} ${c} ${t}.`,regla:R,ayuda:'didn\'t + verbo base.',
      pasos:pasosEn({suj:s[0],tiempo:`past simple negativo (${t})`,regla:'<b>didn\'t</b> + verbo base (para todas las personas)',aplicar:`${marca("didn't")} + ${en(v)}`,res:`did not ${v}`,bien:`${s[0]} didn't ${v} ${c} ${t}.`,mal:`${s[0]} didn't ${past} ${c} ${t}.`,por:'Did ya dice que es pasado: el verbo vuelve a la forma base.'}),
      errores:[malo(`didn't ${past}`,`Después de didn't va la forma base: ${v}.`),malo(`don't ${v}`,'Es pasado: didn\'t.')].filter(e=>normalTexto(e.valor)!==normalTexto(`didn't ${v}`))});
    const q=`Did ${min(s[0])} ${v} ${c} ${t}?`;
    return conLang({enunciado:`Escribe la pregunta: <span lang="en"><b>${s[0]} ${past} ${c} ${t}.</b></span>`,respuesta:q,verificar:e=>igualTexto(e,[q]),frase:q,regla:R,pista:'Empieza con Did.',clave:q,
      pasos:pasosEn({suj:s[0],tiempo:'past simple, pregunta',regla:'<b>Did</b> + sujeto + verbo base + ?',aplicar:`${marca('Did')} + ${en(min(s[0]))} + ${en(v)} …`,res:q,bien:q,mal:`Did ${min(s[0])} ${past} ${c} ${t}?`,por:'Con did el verbo vuelve a la forma base.'}),
      errores:[{si:e=>past!==v&&normalTexto(e).includes(normalTexto(`${min(s[0])} ${past}`)),por:`Con did el verbo vuelve a la forma base: ${v}.`}]});
  }
};

const presentePerfecto={
  titulo:'Present perfect',
  alternativa:'Se parece al "he trabajado" del español: <b>have/has</b> = "he/ha" y el participio = "trabajado, visto, escrito". Se usa para experiencias ("¿alguna vez has…?") o algo que empezó antes y sigue. Con he/she/it es has.',
  explicacion:'have / has + participio (worked, seen, written): experiencias o algo que empezó antes y sigue. Con he/she/it, has.',
  generar(n,rng){
    const R='Present perfect: have/has + participio. Regulares como el pasado (worked); irregulares: see → seen, write → written, go → gone (been = "he estado").';
    const v=rng.elegir(n<=1?REGULARES:IRREGULARES),[,,,pp,comp]=V[v],[c]=rng.elegir(comp),s=rng.elegir(SUJ),h=tercera(s)?'has':'have';
    const tipo=n<=2?'af':n===3?'neg':rng.elegir(['af','neg','preg']);
    if(tipo==='af')return hueco({antes:s[0],pista:v,despues:`${c} ${rng.elegir(['before','many times','this week'])}.`,acepta:[`${h} ${pp}`,`${s[0]==='I'||!tercera(s)?"'ve":"'s"} ${pp}`],frase:`${s[0]} ${h} ${pp} ${c}.`,regla:R,ayuda:`${h} + participio.`,
      pasos:pasosEn({suj:s[0],tiempo:'present perfect (experiencia o algo que sigue)',regla:`${tercera(s)?'he / she / it → <b>has</b>':'I / you / we / they → <b>have</b>'} + participio`,aplicar:`${marca(h)} + ${en(pp)}`,res:`${h} ${pp}`,bien:`${s[0]} ${h} ${pp} ${c}.`,
        mal:V[v][2]!==pp?`${s[0]} ${h} ${V[v][2]} ${c}.`:`${s[0]} ${tercera(s)?'have':'has'} ${pp} ${c}.`,por:V[v][2]!==pp?`Después de ${h} va el participio (${pp}), no el pasado (${V[v][2]}).`:`Con ${min(s[0])} es ${h}.`}),
      errores:[malo(`${h} ${V[v][2]}`,`El participio de ${v} es ${pp}, no ${V[v][2]}.`),malo(`${tercera(s)?'have':'has'} ${pp}`,`Con ${min(s[0])} va ${h}.`),malo(pp,`Falta ${h}.`)].filter(e=>normalTexto(e.valor)!==normalTexto(`${h} ${pp}`))});
    if(tipo==='neg')return hueco({antes:s[0],pista:`not / ${v}`,despues:`${c} yet.`,acepta:[`${h} not ${pp}`,`${h}n't ${pp}`],frase:`${s[0]} ${h}n't ${pp} ${c} yet.`,regla:R,ayuda:`${h}n't + participio.`,
      pasos:pasosEn({suj:s[0],tiempo:'present perfect negativo (con yet)',regla:`<b>${h}n't</b> + participio`,aplicar:`${marca(h+"n't")} + ${en(pp)}`,res:`${h} not ${pp}`,bien:`${s[0]} ${h}n't ${pp} ${c} yet.`,mal:`${s[0]} didn't ${v} ${c} yet.`,por:'Con yet se usa present perfect: haven\'t / hasn\'t + participio, no didn\'t.'}),
      errores:[malo(`didn't ${v}`,'Eso es pasado simple; aquí es present perfect: haven\'t / hasn\'t + participio.')]});
    const q=`${cap(h)} ${min(s[0])} ever ${pp} ${c}?`;
    return conLang({enunciado:`Escribe la pregunta con <i>ever</i>: <span lang="en"><b>${s[0]} ${h} ${pp} ${c}.</b></span>`,respuesta:q,verificar:e=>igualTexto(e,[q]),frase:q,regla:R,pista:`Empieza con ${cap(h)}.`,clave:q,errores:[],
      pasos:pasosEn({suj:s[0],tiempo:'present perfect, pregunta',regla:'<b>Have / Has</b> + sujeto + ever + participio + ?',aplicar:`${marca(cap(h))} + ${en(min(s[0]))} + ever + ${en(pp)} …`,res:q,bien:q,mal:`${s[0]} ${h} ever ${pp} ${c}?`,por:'En la pregunta have / has va antes del sujeto.'})});
  }
};

// Artículos: a / an / the / nada (—)
const ART=[
  [1,'I have ___ dog.','a','dog empieza con sonido de consonante.'],[1,'My father is ___ doctor.','a','Profesiones con a/an.'],[1,'She has ___ big house.','a','big empieza con consonante.'],[1,'He wants ___ new car.','a','new empieza con consonante.'],
  [1,'I eat ___ apple every day.','an','apple empieza con sonido de vocal.'],[1,'She is ___ engineer.','an','engineer empieza con vocal.'],[1,'We need ___ umbrella.','an','umbrella empieza con vocal.'],[1,'It is ___ old book.','an','old empieza con vocal.'],
  [2,'It takes ___ hour.','an','hour se pronuncia sin h: sonido de vocal.'],[2,'She is ___ university student.','a','university suena "yu": sonido de consonante.'],[2,'He is ___ honest man.','an','honest se pronuncia sin h.'],[2,'It is ___ European company.','a','European suena "yu".'],[2,'I saw ___ elephant.','an','elephant empieza con vocal.'],[2,'He has ___ one-year contract.','a','one suena "wan".'],
  [3,'___ sun is very hot today.','the','Hay uno solo: the sun.'],[3,'Can you close ___ door, please?','the','Los dos saben qué puerta.'],[3,'She plays ___ piano.','the','Instrumentos: play the piano.'],[3,'I live in ___ United States.','the','Países con "States", "Kingdom": the.'],[3,'___ moon is bright tonight.','the','Hay una sola luna.'],[3,'I bought a shirt. ___ shirt is blue.','the','Ya se mencionó: the.'],
  [4,'I like ___ music.','—','En general (sustantivo incontable): sin artículo.'],[4,'She plays ___ soccer.','—','Deportes sin artículo.'],[4,'They drink ___ coffee in the morning.','—','Incontable en general: sin artículo.'],[4,'___ dogs are friendly.','—','Plural en general: sin artículo.'],[4,'He goes to work by ___ bus.','—','by + transporte, sin artículo.'],[4,'I have breakfast at ___ seven.','—','Las horas no llevan artículo.']
];
const NADA=['—','-','–','nada','ninguno','ningun','0','x','no','sin articulo','none'];
const articulos={
  titulo:'Artículos: a, an, the',
  alternativa:'<b>a/an</b> = "un/una" (cualquiera); <b>the</b> = "el/la" (uno concreto que los dos conocen). La diferencia entre a y an es solo de <b>sonido</b>: an cuando la siguiente palabra suena a vocal (an hour: la h no suena). Y a diferencia del español, para hablar en general no se pone artículo: <i>I like music</i>.',
  explicacion:'a ante sonido de consonante, an ante sonido de vocal (an hour, a university). the cuando algo es único o ya se sabe cuál. Sin artículo para cosas en general.',
  generar(n,rng){
    const R='a/an: uno cualquiera (an ante SONIDO de vocal). the: uno concreto o único. Nada: plurales o incontables en general, deportes, comidas y horas.';
    const [,f,a,por]=rng.elegir(ART.filter(x=>x[0]<=Math.min(4,n)));
    const acepta=a==='—'?NADA:[a];
    return conLang({enunciado:`Completa con <b>a</b>, <b>an</b>, <b>the</b> o <b>—</b> (nada): <span lang="en"><b>${f}</b></span>`,respuesta:a,verificar:e=>acepta.includes(normalTexto(e)||'-')||igualTexto(e,acepta),
      frase:f.replace('___ ',a==='—'?'':`${a} `).replace(/^(\w)/,x=>x.toUpperCase()),regla:R,pista:'¿Uno cualquiera, uno concreto o en general?',explicacion:por,clave:f,
      errores:['a','an','the'].filter(x=>x!==a).map(x=>malo(x,por)).concat(a!=='—'?[{valor:'—',si:e=>NADA.includes(normalTexto(e)),por}]:[]),
      pasos:[paso('Mira la palabra que sigue al hueco',en(f),'¿Es una cosa cualquiera, una concreta o algo en general? ¿Empieza con sonido de vocal?'),
        paso('Recuerda la regla',R,'Lo que cuenta es el SONIDO, no la letra (an hour, a university).'),
        final('Aplícala',`${marca(a==='—'?'— (nada)':a)}: ${por}`,a==='—'?'En español sí diríamos "me gusta LA música"; en inglés, para hablar en general, no va artículo.':'Elige según el caso.',a)]});
  }
};

// Plurales
const PL=[[1,'box','boxes'],[1,'bus','buses'],[1,'city','cities'],[1,'watch','watches'],[1,'baby','babies'],[1,'dish','dishes'],[1,'party','parties'],[1,'class','classes'],
  [2,'knife','knives'],[2,'leaf','leaves'],[2,'wife','wives'],[2,'wolf','wolves'],[2,'life','lives'],[2,'half','halves'],[2,'shelf','shelves'],
  [3,'child','children'],[3,'man','men'],[3,'woman','women'],[3,'tooth','teeth'],[3,'foot','feet'],[3,'mouse','mice'],[3,'person','people'],[3,'goose','geese'],
  [4,'sheep','sheep'],[4,'fish','fish'],[4,'deer','deer'],[4,'potato','potatoes'],[4,'tomato','tomatoes'],[4,'photo','photos'],[4,'piano','pianos'],[4,'series','series']];
const plurales={
  titulo:'Plurales irregulares',
  alternativa:'Casi siempre basta con -s, pero algunas palabras muy antiguas y muy usadas conservan plurales viejos: <i>man → men, child → children, tooth → teeth</i>. Apréndelos como pares, igual que en español aprendes "el agua / las aguas".',
  explicacion:'La mayoría lleva -s; -es tras s, x, ch, sh; consonante + y → -ies; -f/-fe → -ves; y hay irregulares (child → children, man → men, tooth → teeth).',
  generar(n,rng){
    const R='Plural: -s; -es tras s, x, ch, sh, o; consonante + y → -ies; f/fe → -ves; irregulares: men, women, children, teeth, feet, mice, people; iguales: sheep, fish, deer.';
    const [,s,p]=rng.elegir(PL.filter(x=>n>=5||x[0]<=n)),num=rng.entero(2,9);
    const frase=`There are ${['two','three','four','five','six','seven','eight','nine'][num-2]} ${p} here.`;
    return conLang({enunciado:n>=4?`Completa: <span lang="en"><b>There are ${['two','three','four','five','six','seven','eight','nine'][num-2]} ___ here.</b></span> <span class="nota">(${s})</span>`:`¿Cuál es el plural de <b lang="en">${s}</b>?`,
      respuesta:p,verificar:e=>igualTexto(e,[p]),frase,regla:R,pista:'¿Termina en -y, -f, -s…? ¿Es irregular?',clave:`${s}${n>=4?num:''}`,
      errores:[malo(`${s}s`,`${s} hace ${p}.`),malo(`${s}es`,`${s} hace ${p}.`)].filter(e=>e.valor!==p),
      pasos:[paso('Mira cómo termina la palabra',en(s),'La terminación decide la regla: -y, -f/-fe, -s/-x/-ch/-sh… o si es irregular.'),
        paso('Recuerda la regla',R,'Los irregulares se aprenden como pares.'),
        final('Aplícala',`${en(s)} → ${marca(p)}`,p===`${s}s`?'Aquí basta con -s.':`No es simplemente ${s}s.`,p,p!==`${s}s`?{ojo:`Error típico: "${s}s".`}:{})]});
  }
};

// Preposiciones de tiempo y lugar: in / on / at
const PREP=[[1,'on','Monday','Días: on.'],[1,'on','Friday','Días: on.'],[1,'in','July','Meses: in.'],[1,'in','2020','Años: in.'],[1,'in','summer','Estaciones: in.'],[1,'on','my birthday','Fechas y días especiales: on.'],
  [2,'at','7 o\'clock','Horas: at.'],[2,'at','night','at night (pero in the morning).'],[2,'in','the morning','in the morning / afternoon / evening.'],[2,'at','noon','Momentos exactos: at.'],[2,'on','July 4th','Fechas: on.'],[2,'at','midnight','Momentos exactos: at.'],
  [3,'in','London','Ciudades y países: in.'],[3,'on','the table','Sobre una superficie: on.'],[3,'at','the bus stop','Un punto concreto: at.'],[3,'in','the box','Dentro de algo: in.'],[3,'at','home','at home / at work.'],[3,'on','the wall','En una superficie vertical: on.'],
  [4,'on','the second floor','Pisos: on.'],[4,'in','the car','Coche: in (no puedes ir de pie).'],[4,'on','the bus','Autobús, tren, avión: on.'],[4,'at','work','at work.'],[4,'in','bed','in bed.'],[4,'at','the door','Junto a un punto: at.']];
const FRASE_P={1:'I have a meeting',2:'We have lunch',3:'My keys are',4:'She is'};
const preposiciones={
  titulo:'Preposiciones: in, on, at',
  alternativa:'Piensa en una pirámide de lo grande a lo pequeño. <b>in</b> para lo más grande (meses, años, países, ciudades), <b>on</b> para lo mediano (días, fechas, superficies), <b>at</b> para lo más exacto (una hora, un punto concreto).',
  explicacion:'Tiempo: at + hora, on + día o fecha, in + mes, año, estación. Lugar: in dentro de un espacio, on sobre una superficie, at en un punto.',
  generar(n,rng){
    const R='Tiempo: at 7 o\'clock, on Monday / on July 4th, in July / in 2020 / in the morning. Lugar: in the box / in London, on the table / on the bus, at the bus stop / at home.';
    const [g,p,c,por]=rng.elegir(PREP.filter(x=>x[0]<=Math.min(4,n))),antes=g<=2?rng.elegir(['I have a meeting','We play soccer','The party is','My exam is']):rng.elegir(['My keys are','She is','We are','The cat is']);
    return conLang({enunciado:`Completa con <b>in</b>, <b>on</b> o <b>at</b>: <span lang="en"><b>${antes} ___ ${c}.</b></span>`,respuesta:p,verificar:e=>igualTexto(e,[p]),frase:`${antes} ${p} ${c}.`,
      regla:R,pista:g<=2?'¿Hora, día o mes?':'¿Dentro, sobre o en un punto?',explicacion:por,clave:`${antes}|${c}`,errores:['in','on','at'].filter(x=>x!==p).map(x=>malo(x,por)),
      pasos:[paso(g<=2?'Es una expresión de tiempo':'Es una expresión de lugar',en(c),g<=2?'¿Hora exacta, día o fecha, o mes / año / estación?':'¿Dentro de algo, sobre una superficie o en un punto?'),
        paso('Recuerda la regla',R,'De lo más grande (in) a lo más exacto (at).'),
        final('Aplícala',`${marca(p)} ${en(c)}: ${por}`,'En español todo es "en"; en inglés hay que elegir entre tres.',p)]});
  }
};

// Ordenar palabras: frases generadas con el banco de verbos
const ADV=['always','usually','often','never','sometimes'];
const ordenar={
  titulo:'Orden de las palabras',
  alternativa:'El inglés es más rígido que el español: casi siempre <b>quién + hace qué + a qué</b>. "Siempre", "nunca" y similares van justo antes del verbo. Y en las preguntas, el ayudante (do, does, did) se pone delante.',
  explicacion:'Orden básico: sujeto + verbo + complemento. Los adverbios de frecuencia van antes del verbo (She often works…). En preguntas, el auxiliar va primero.',
  generar(n,rng){
    const R='Sujeto + verbo + complemento. Adverbios de frecuencia antes del verbo principal (después de to be). Preguntas: auxiliar + sujeto + verbo.';
    const v=rng.elegir(Object.keys(V)),[s3,,past,,comp]=V[v],[c]=rng.elegir(comp),s=rng.elegir(SUJ),t3=tercera(s);
    let frase;
    if(n<=1)frase=`${s[0]} ${t3?s3:v} ${c}`;
    else if(n===2)frase=`${s[0]} ${rng.elegir(ADV)} ${t3?s3:v} ${c}`;
    else if(n===3)frase=`${s[0]} ${t3?'does':'do'} not ${v} ${c}`;
    else if(n===4)frase=`${t3?'Does':'Do'} ${min(s[0])} ${v} ${c}`;
    else frase=rng.prob(.5)?`Did ${min(s[0])} ${v} ${c} yesterday`:`${s[0]} ${past} ${c} last week`;
    const piezas=frase.split(' '),fin=frase+(n===4||frase.startsWith('Did')?'?':'.');
    let barajadas;do barajadas=rng.barajar(piezas);while(barajadas.join(' ')===piezas.join(' ')&&piezas.length>2);
    const preg=fin.endsWith('?');
    return conLang({tipo:'ordenar',enunciado:'Ordena la frase',piezas:barajadas,respuesta:fin,verificar:e=>normalTexto(e)===normalTexto(fin),frase:fin,regla:R,pista:'Empieza por el sujeto (o por el auxiliar si es pregunta).',clave:fin,
      pasos:[paso(preg?'Es pregunta: el auxiliar va primero':'Empieza por el sujeto',preg?en(fin.split(' ')[0]):en(s[0]),preg?'En inglés la pregunta empieza con Do / Does / Did.':'El inglés casi siempre pone primero quién hace la acción.'),
        paso('Después, el verbo y el complemento','Sujeto + (adverbio) + verbo + complemento',n===2?'Los adverbios como always / never van justo antes del verbo.':'Quién + hace qué + a qué / dónde.',n===2?{ojo:'En español "trabaja siempre" se oye bien; en inglés es "always works".'}:{}),
        final('Frase completa',en(fin),'Léela en voz alta para comprobar que suena natural.',fin)]});
  }
};

// Traducir frases cortas (español → inglés)
const ES={work:['trabajo','trabajas','trabaja','trabajamos','trabajan'],live:['vivo','vives','vive','vivimos','viven'],play:['juego','juegas','juega','jugamos','juegan'],study:['estudio','estudias','estudia','estudiamos','estudian'],
  watch:['miro','miras','mira','miramos','miran'],have:['tengo','tienes','tiene','tenemos','tienen'],eat:['como','comes','come','comemos','comen'],drink:['bebo','bebes','bebe','bebemos','beben'],speak:['hablo','hablas','habla','hablamos','hablan'],read:['leo','lees','lee','leemos','leen']};
const traducir={
  titulo:'Traducir frases cortas',
  alternativa:'No traduzcas palabra por palabra: primero pregúntate <b>quién</b> (siempre hay que escribirlo en inglés), <b>cuándo</b> (qué tiempo) y si es afirmación, negación o pregunta. Después arma la frase con la estructura inglesa.',
  explicacion:'Piensa en la estructura inglesa: sujeto siempre presente (I, she…), -s con he/she, y do/does para negar o preguntar.',
  generar(n,rng){
    const R='En inglés el sujeto no se omite; he/she llevan -s; para negar o preguntar se usa do/does + verbo base.';
    const v=rng.elegir(Object.keys(ES)),[s3,,,,comp]=V[v],[cEn,cEs]=rng.elegir(comp);
    const suj=n<=1?rng.elegir(SUJ.filter(x=>[0,1,3,4].includes(x[2]))):rng.elegir(SUJ.filter(x=>['I','You','He','She','We','They'].includes(x[0]))),k=suj[2],t3=k===2;
    const esSuj=k===0||k===1||k===3?'':`${cap(suj[1])} `;
    const tipo=n<=2?'af':n===3?'neg':n===4?'preg':rng.elegir(['af','neg','preg']);
    const vEs=ES[v][k],sujEn=suj[0];
    let es,en,alt=[];
    if(tipo==='af'){es=`${esSuj}${esSuj?vEs:cap(vEs)} ${cEs}.`;en=`${sujEn} ${t3?s3:v} ${cEn}.`}
    else if(tipo==='neg'){es=`${esSuj}no ${vEs} ${cEs}.`.replace(/^no/,'No');en=`${sujEn} ${t3?"doesn't":"don't"} ${v} ${cEn}.`}
    else{es=`¿${esSuj?esSuj.trim()+' ':''}${esSuj?vEs:cap(vEs)} ${cEs}?`;en=`${t3?'Does':'Do'} ${min(sujEn)} ${v} ${cEn}?`}
    if(v==='have'&&tipo==='af'&&t3)alt.push(`${sujEn} has got ${cEn}.`);
    if(k===1)alt.push(en.replace(/\byou\b/i,m=>m[0]==='Y'?'You':'you'));
    const mal=tipo==='af'?(t3?`${sujEn} ${v} ${cEn}.`:`${cap(v)} ${cEn}.`):tipo==='neg'?`${sujEn} no ${v} ${cEn}.`:`${sujEn} ${t3?s3:v} ${cEn}?`;
    const porMal=tipo==='af'?(t3?`Con ${min(sujEn)} el verbo lleva -s.`:'En español el sujeto se puede omitir ("Trabajo…"); en inglés siempre se escribe.'):tipo==='neg'?'En inglés no se niega con "no" antes del verbo: don\'t / doesn\'t.':'La pregunta necesita Do / Does al principio.';
    return conLang({enunciado:`Traduce al inglés: <b>${es}</b>`,respuesta:en,
      pasos:pasosEn({suj:sujEn,tiempo:`present simple${tipo==='neg'?' negativo':tipo==='preg'?', pregunta':''}`,regla:tipo==='af'?(t3?'he / she → verbo + <b>s</b>':'sujeto + verbo base'):tipo==='neg'?'sujeto + <b>don\'t / doesn\'t</b> + verbo base':'<b>Do / Does</b> + sujeto + verbo base + ?',
        aplicar:marca(en),res:en,bien:en,mal,por:porMal}),verificar:e=>igualTexto(e,[en,...alt]),frase:en,regla:R,pista:tipo==='af'?'Sujeto + verbo + complemento.':tipo==='neg'?'don\'t / doesn\'t + verbo base.':'Do / Does + sujeto + verbo base.',clave:es,
      errores:[...(t3&&tipo==='af'?[malo(`${sujEn} ${v} ${cEn}`,`Con ${min(sujEn)} el verbo lleva -s: ${s3}.`)]:[]),{si:e=>tipo!=='af'&&normalTexto(e).includes(normalTexto(s3))&&s3!==v,por:'Con do/does el verbo va en forma base (sin -s).'},
        {si:e=>!new RegExp(`\\b${min(sujEn)}\\b`).test(normalTexto(e)),por:`En inglés hay que escribir el sujeto (${min(sujEn)}).`}]});
  }
};

// Frases hechas de las unidades de Hablar
const pasosChunk=(ch,como,res)=>[paso('Piensa en la situación',ch.uso,'Las frases hechas se recuerdan por el momento en que se usan.'),
  paso('No traduzcas palabra por palabra',`${ch.es} → ${en(ch.en)}`,'Los nativos dicen el bloque completo; traducido literal suena raro.'),
  final('La frase',como,'Repítela en voz alta como un bloque.',res)];
const CHUNKS=Object.values(CONTENIDO).flatMap(u=>u.chunks);
const chunks={
  titulo:'Frases hechas (chunks)',
  alternativa:'Las frases hechas son como canciones: se aprenden <b>enteras</b>, no se arman pieza por pieza. Repítelas en voz alta en la situación en que se usan y te saldrán solas.',
  explicacion:'Los nativos usan bloques que se aprenden enteros. Completa la palabra que falta o escribe la frase completa.',
  generar(n,rng){
    const R='Las frases hechas se aprenden como un bloque: memoriza la frase entera y en qué situación se usa.';
    const ch=rng.elegir(CHUNKS),palabras=ch.en.replace(/[.?!]$/,'').split(' ');
    if(n<=2&&palabras.length>2){const i=rng.entero(0,palabras.length-1),w=palabras[i].replace(/[,]/g,'');const con=palabras.map((p,j)=>j===i?'___':p).join(' ');
      return conLang({enunciado:`Completa la frase hecha (${ch.es}): <span lang="en"><b>${con}${/[?!.]$/.test(ch.en)?ch.en.slice(-1):''}</b></span>`,respuesta:w,verificar:e=>igualTexto(e,[w]),frase:ch.en,regla:R,pista:ch.uso,clave:ch.en+i,
        pasos:pasosChunk(ch,`${en(ch.en.replace(w,'<mark class="cambio">'+w+'</mark>'))}`,w)})}
    return conLang({enunciado:`¿Cómo se dice en inglés? <b>${ch.es}</b> <span class="nota">(${ch.uso})</span>`,respuesta:ch.en,verificar:e=>igualTexto(e,[ch.en]),frase:ch.en,regla:R,pista:`Empieza con «${palabras[0]}».`,clave:ch.en,
      pasos:pasosChunk(ch,en(ch.en),ch.en)});
  }
};

export default {'en/presente-simple':presenteSimple,'en/presente-continuo':presenteContinuo,'en/pasado-simple':pasadoSimple,'en/presente-perfecto':presentePerfecto,
  'en/articulos':articulos,'en/plurales':plurales,'en/preposiciones':preposiciones,'en/ordenar':ordenar,'en/traducir':traducir,'en/chunks':chunks};
