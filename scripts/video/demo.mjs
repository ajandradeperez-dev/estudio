/* Perfil de demostración para los videos (PROMPT-VIDEO): «Alex», racha de 12 días, XP inventada y notas de ejemplo.
   Nada real: se inyecta en un contexto limpio de Playwright (localStorage e IndexedDB), nunca se sincroniza (no hay
   sesión de Supabase) y la clave de IA es un texto de relleno que solo ve la IA simulada (las peticiones a Gemini se
   responden aquí, sin red). */
// fecha local (como la app): con toISOString, de noche en México ya sería «mañana» y la racha saldría en 11
const dia=n=>{const d=new Date();d.setDate(d.getDate()-n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};

export function progresoDemo(){
  const dias={};
  for(let i=0;i<12;i++)dias[dia(i)]={ej:20+(i*7)%11,seg:900+(i*137)%600,xp:180+(i*53)%90,ok:true,habla:{frases:i%3?12:0,seg:i%3?240:0,turnos:i%4?5:0,conv:i%4?5:0}};
  const hab=(ids,dom)=>Object.fromEntries(ids.map((id,i)=>[id,{dominada:i<dom,mejor:i<dom?100:70,intentos:3,via:'practica',ult:[1,1,1,1,0,1,1,1,1,1],dias:[dia(3),dia(1)],rating:3,sesiones:3}]));
  return {v:11,meta:{tipo:'ejercicios',cantidad:20},dias,mejorRacha:12,
    materias:{
      matematicas:{xp:1460,lecciones:hab(['ecuaciones-lineales','ecuaciones-cuadraticas','polinomios','factorizacion','fracciones'],4),ubicacion:null,visitadas:['algebra-basica'],extra:{}},
      ingles:{xp:820,lecciones:hab(['to-be','presente-simple','can'],3),ubicacion:null,visitadas:[],extra:{}},
      ciberseguridad:{xp:340,lecciones:hab(['osi','ipv4'],1),ubicacion:null,visitadas:[],extra:{}},
      python:{xp:260,lecciones:{},ubicacion:null,visitadas:[],extra:{}}},
    repaso:{'matematicas/g/ecuaciones-lineales/2':{rep:2,int:3,ef:2.5,proxima:dia(0),fallos:1},'ingles/l/can/3':{rep:1,int:1,ef:2.4,proxima:dia(0),fallos:1},
      'matematicas/g/ecuaciones-cuadraticas/3':{rep:1,int:1,ef:2.3,proxima:dia(0),fallos:2}},
    dominados:3,notas:{},tarjetas:{},basicos:{},refuerzos:{},estrellas:{},ultimo:{ruta:'estudio/matematicas/algebra-basica',materia:'matematicas'},frases:{},historial:[]};
}
export const USUARIO={bienvenida:true,nombre:'Alex',materias:['matematicas','ingles']};
// Notas de ejemplo del cuaderno (IndexedDB 'ciberlab-notas')
export const NOTAS=[
  {titulo:'Fórmula general',cuerpo:'Para **ax² + bx + c = 0**:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$\n\n- Si b² − 4ac < 0 no hay soluciones reales\n🃏 ¿Qué es el discriminante? | b² − 4ac',materia:'matematicas',tema:'algebra-basica',etiquetas:['examen']},
  {titulo:'Phrasal verbs del trabajo',cuerpo:'- **set up** a meeting → organizar\n- **follow up** → dar seguimiento\n- **look into** → investigar',materia:'ingles',tema:null,etiquetas:[]},
  {titulo:'Modelo OSI en una frase',cuerpo:'Física, Enlace, Red, Transporte, Sesión, Presentación, Aplicación.\n\n- [x] Repasar puertos\n- [ ] Hacer el simulacro',materia:'ciberseguridad',tema:null,etiquetas:[],fijada:true}
];
// Clave de relleno: solo existe para que la app muestre los botones ✨; nunca se ve en pantalla ni sale de este navegador
export const CLAVE_RELLENO=['AI','za','-demo-sin-uso'].join('');

/* Respuestas de la IA simulada (de buena calidad, fijas). Se eligen por el mensaje de sistema de cada petición. */
export function respuestaIA(cuerpo){
  const sis=cuerpo.systemInstruction?.parts?.[0]?.text||'',txt=JSON.stringify(cuerpo.contents||'');
  if(/Sugiere 3 respuestas/.test(sis))return {opciones:[{en:'I would like a coffee, please.',es:'Quisiera un café, por favor.'},{en:'Can I see the menu?',es:'¿Puedo ver el menú?'}]};
  if(/Traduce al español/.test(sis))return '¿Qué te gustaría pedir?';
  if(/reporte final/.test(sis))return {fortalezas:['Respondes con frases completas','Buen vocabulario de comida'],errores_frecuentes:[{error:'I want coffee',correcto:'I would like a coffee',explicacion:'«Would like» suena más amable.'}],frases_para_practicar:[{en:'Could I have the bill, please?',es:'¿Me trae la cuenta, por favor?'}],nivel_estimado:'A2'};
  if(/speaking examiner/.test(sis)&&/Decide your next turn/.test(txt))return {dice:'That sounds great. Why do you like it?',accion:'seguimiento',pregunta:1};
  return {respuesta:'Nice choice! Would you like it hot or iced?',correcciones:[{dije:'I want coffee',correcto:'I would like a coffee',explicacion:'Con «would like» suena más amable.',tipo:'naturalidad'}],
    frase_mejorada:'I would like a coffee, please.',pista:'Puedes decir: Hot, please.',nueva_palabra:{en:'iced',es:'con hielo'}};
}
