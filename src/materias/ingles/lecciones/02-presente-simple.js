const R1='Con he/she/it el verbo lleva -s; -es tras -sh, -ch, -x, -o; consonante + y → -ies.';
const R2='Negativo y pregunta: do/does + verbo base. Con he/she/it se usa does y el verbo va sin -s.';

export default {
  titulo:'Presente simple',nivel:'A1',
  resumen:'Rutinas y hechos: I work, she works, do / does.',
  explicacion:[
    'Usa el presente simple para <b>rutinas</b> y <b>hechos</b>: <i>I work, she works</i>.',
    'Con <b>he/she/it</b> el verbo lleva <b>-s</b>; <b>-es</b> tras -sh, -ch, -x, -o (<i>watches, goes</i>); consonante + y cambia a <b>-ies</b> (<i>studies</i>).',
    'Negativo y pregunta con <b>do/does</b> + verbo base: <i>She doesn’t work. Do you work?</i> La -s pasa a does, no al verbo.'
  ],
  ejemplos:[
    ['I live in Lima.','Vivo en Lima.'],
    ['He watches TV every night.','watch → watches'],
    ['Does she speak English?','does + verbo base (speak, no speaks)']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'My brother ___ in a bank.',opciones:['work','works','working'],correcta:1,
     porque:{0:'My brother = he: el verbo necesita -s.',2:'working necesita is delante (presente continuo).'},regla:R1},
    {tipo:'completar',pregunta:'Completa: She ___ (study) English every day.',respuestas:['studies'],pista:'consonante + y',
     errores:{studys:'Consonante + y cambia a -ies.',study:'Con she el verbo lleva -s.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: He ___ (watch) the news at night.',respuestas:['watches'],
     errores:{watchs:'Tras -ch se añade -es.',watch:'Con he el verbo lleva -s/-es.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe en negativo: She likes coffee.',respuestas:["She doesn't like coffee","She does not like coffee"],
     errores:{"She doesn't likes coffee":'Con does el verbo vuelve a su forma base: like.',"She don't like coffee":'Con she se usa doesn’t.'},regla:R2},
    {tipo:'completar',pregunta:'Convierte en pregunta: You live near here.',respuestas:['Do you live near here?'],
     errores:{'You live near here?':'Falta el auxiliar: Do you live…?','Does you live near here?':'Con you se usa do.'},regla:R2}
  ],[
    {tipo:'opcion',pregunta:'The shop ___ at 9 a.m.',opciones:['open','opens','opening'],correcta:1,
     porque:{0:'The shop = it: necesita -s.',2:'opening necesita is delante.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: My kids ___ (go) to school by bus.',respuestas:['go'],
     errores:{goes:'My kids es plural (they): el verbo va sin -s.'},regla:R1},
    {tipo:'completar',pregunta:'Completa: It ___ (rain) a lot in April.',respuestas:['rains'],
     errores:{rain:'it lleva -s.'},regla:R1},
    {tipo:'completar',pregunta:'Escribe en negativo: They work on Sundays.',respuestas:["They don't work on Sundays","They do not work on Sundays"],
     errores:{"They doesn't work on Sundays":'They es plural: don’t.'},regla:R2},
    {tipo:'completar',pregunta:'Traduce: ¿Tu madre habla inglés?',respuestas:['Does your mother speak English?','Does your mom speak English?','Does your mum speak English?'],
     errores:{'Does your mother speaks English?':'Después de does, verbo base: speak.','Do your mother speak English?':'your mother = she: does.'},regla:R2}
  ]]
};
