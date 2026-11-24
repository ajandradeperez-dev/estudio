/* Guion de los videos (PROMPT-VIDEO): de aquí salen la voz, los subtítulos, los títulos y lo que se graba.
   Cada escena: {id, titulo (texto grande en pantalla), voz (lo que se dice y se subtitula), ruta (pantalla inicial),
   antes(h) (se prepara sin grabar), accion(h, {horizontal}) (se graba), ia (muestra «IA (demo)»), tarjeta (sin grabar:
   solo un título animado), capitulo (tutorial)}. Las acciones usan los ayudantes de grabar.mjs (h.tocar, h.escribir…). */

const EJERCICIO='estudio/matematicas/algebra-basica/l/ecuaciones-cuadraticas';
// Llega a la primera pregunta de la práctica (salta la mini-lección y los ejemplos resueltos)
async function aPregunta(h){
  const {p}=h;
  if(await p.locator('#hab-empezar').count()){await p.locator('#hab-empezar').click();await h.esperar(600)}
  if(await p.locator('#mini-saltar').count())await p.locator('#mini-saltar').click();
  // hasta una pregunta escrita con pistas (las de opción solo introducen)
  for(let k=0;k<12&&!(await p.locator('#ses-pista').count());k++){
    if(await p.locator('#ses-continuar').count())await p.locator('#ses-continuar').click();
    else if(await p.locator('.opcion').count()){await p.keyboard.press('1');await h.esperar(150);await p.keyboard.press('Enter')}
    else if(await p.locator('#ses-resp').count()){await p.locator('#ses-resp').pressSequentially('1');await p.keyboard.press('Enter')}
    else await p.keyboard.press('Enter');
    await h.esperar(350)}
  await h.esperar(300);
}
// Dibuja un plano y una parábola en el dibujo del cuaderno (con el dedo, trazo a trazo)
async function parabola(h,{cx=200,cy=430,s=26}={}){
  await h.trazo([[cx-150,cy],[cx-60,cy+1],[cx+40,cy],[cx+150,cy+1]],{ms:18});
  await h.trazo([[cx,cy+70],[cx+1,cy-60],[cx,cy-200]],{ms:22});
  const pts=[];for(let x=-3.2;x<=3.2;x+=.2)pts.push([cx+x*s*1.6,cy+8-(x*x)*s*.62]);
  await h.trazo(pts,{ms:16});
}

export const ESCENAS={
  promo:[
    {id:'01-gancho',tarjeta:'gancho',titulo:'¿Estudias mucho y avanzas poco?',voz:'¿Estudias mucho y avanzas poco?'},
    {id:'02-aprender',dur:5,titulo:'Todo en una app',voz:'Matemáticas, inglés, programación y más. Todo en una app.',ruta:'',
      async accion(h){await h.esperar(500);await h.tocar('[data-go="estudio"]',{pausa:1300});await h.bajar(300);await h.ir('');await h.tocar('[data-go="cursos"]',{pausa:1300})}},
    {id:'03-pistas',dur:5.5,titulo:'Te enseña, no solo te califica',voz:'Si te atoras, te guía paso a paso.',ruta:EJERCICIO,antes:aPregunta,
      async accion(h){await h.esperar(400);await h.tocar('#ses-pista',{pausa:1500});await h.tocar('#ses-pista',{pausa:1800});await h.bajar(300)}},
    {id:'04-ingles-ia',dur:5.5,titulo:'Habla inglés con IA',ia:true,voz:'Practica inglés en voz alta con tu tutor.',ruta:'estudio/ingles/hablar/ia',
      async accion(h){await h.tocar('[data-nivel-charla="A2"]',{pausa:400});await h.tocar('[data-escenario="pedir-comida"]',{pausa:1800});
        await h.p.evaluate(()=>window.__oir.push('I want coffee'));await h.tocar('#ia-mic',{pausa:3400})}},
    {id:'05-cuaderno',dur:6,titulo:'Tus notas, a tu manera',voz:'Escribe fórmulas y dibuja en tu cuaderno.',ruta:'notas',
      async accion(h){await h.tocar('#nota-nueva-fab, #nota-nueva');await h.p.keyboard.type('La parábola',{delay:60});await h.p.keyboard.press('Enter');
        await h.p.keyboard.type('Su ecuación es $y = x^2 + 1$',{delay:55});await h.esperar(900);
        await h.tocar('[data-fmt="imagen"]',{pausa:400});await h.tocar('.modal [data-r="dibujo"]',{pausa:700});await h.tocar('.modal [data-pl="cuadricula"]',{pausa:700});
        await parabola(h);await h.esperar(600)}},
    {id:'06-racha',dur:4,titulo:'Estudia un poco cada día',voz:'Cumple tu meta del día y mira crecer tu racha.',ruta:'perfil',
      async accion(h){await h.esperar(600);await h.bajar(350);await h.tocar('#nav [data-go="logros"]',{pausa:1500})}},
    {id:'07-cierre',tarjeta:'cierre',titulo:'Estudia más. Estudia mejor. Estudia +',voz:'Estudia más. Estudia mejor. Gratis.'}
  ],
  tutorial:[
    {id:'00-titulo',tarjeta:'titulo',titulo:'Cómo usar Estudio+',voz:'Te enseño a usar Estudio más en menos de tres minutos.'},
    {id:'01-instalar',capitulo:'1 · Instálala',voz:'Descárgala gratis en Android o agrégala a tu pantalla de inicio. Desde Perfil, en Acerca de, ves la versión y el enlace para invitar.',ruta:'acerca',
      antes:async h=>{await h.p.evaluate(()=>{const q=document.querySelector('.qr');if(q)scrollTo(0,q.getBoundingClientRect().top+scrollY-260)});await h.esperar(400)},
      async accion(h){await h.esperar(900);await h.bajar(160,4);await h.esperar(900)}},
    {id:'02-cuenta',capitulo:'2 · Tu cuenta',voz:'Con una cuenta, tu progreso y tus notas se sincronizan entre tu teléfono y tu laptop.',ruta:'cuenta',
      async accion(h){await h.esperar(500);await h.escribir('input[type="email"]','alex@ejemplo.com');await h.esperar(600)}},
    {id:'03-ejercicio',capitulo:'3 · Tu primer ejercicio',voz:'Elige una materia y practica. Si te atoras, pide una pista: primero la idea, luego el primer paso, y al final la solución completa. Y si no sabes ni por dónde empezar, la app te lo explica con un ejemplo.',ruta:EJERCICIO,antes:aPregunta,
      async accion(h){await h.esperar(500);await h.tocar('#ses-pista',{pausa:1300});await h.tocar('#ses-pista',{pausa:1500});
        await h.tocar('#ses-pista',{pausa:1200});await h.bajar(400);
        const resp=await h.p.evaluate(()=>{const l=[...document.querySelectorAll('.hoja-linea')].find(e=>/Respuesta/.test(e.textContent));return l?l.textContent.replace(/^.*Respuesta:\s*/,'').trim():null});
        if(resp){await h.subir();await h.escribir('#ses-resp',resp);await h.tocar('#ses-comprobar',{pausa:1600})}}},
    {id:'04-repasar',capitulo:'4 · Repasa y cuida tu racha',voz:'En Repasar vuelven los ejercicios justo antes de que los olvides. Cumple tu meta diaria y tu racha crece.',ruta:'repaso',
      async accion(h){await h.esperar(900);await h.bajar(300);await h.tocar('#nav [data-go="perfil"]',{pausa:1200})}},
    {id:'05-mias',capitulo:'5 · Tus materias de la escuela',voz:'En Mis materias pegas tu temario y la fecha del examen, y la app te arma un plan día por día. Si tienes una foto del temario, la inteligencia artificial la lee por ti.',ruta:'mias/nueva',
      async accion(h){await h.escribir('#mp-nombre','Física');await h.tocar('#mp-sig',{pausa:700});
        await h.escribir('#mp-texto','Unidad 1. Cinemática\n1.1 Velocidad\n1.2 Aceleración\nUnidad 2. Dinámica\n2.1 Leyes de Newton',{retraso:28});await h.esperar(800);await h.bajar(350)}},
    {id:'06-ingles',capitulo:'6 · Inglés',voz:'En inglés practicas hablando, lees y escuchas por nivel, haces simulacros y una prueba de nivel.',ruta:'estudio/ingles/hablar',
      async accion(h){await h.esperar(600);await h.bajar(500);await h.ir('estudio/ingles/hablar/nivel/A2');await h.esperar(700);await h.bajar(400);
        await h.ir('estudio/ingles/simulacros');await h.esperar(900);await h.bajar(400)}},
    {id:'07-cuaderno',capitulo:'7 · Tu cuaderno',voz:'En el cuaderno escribes con fórmulas, dibujas con el dedo o con el lápiz, y conviertes una foto de tus apuntes en una nota. Todo se guarda solo.',ruta:'notas',
      async accion(h){await h.esperar(500);await h.tocarTexto('Fórmula general',{pausa:1400});await h.tocar('[data-fmt="imagen"]',{pausa:400});await h.tocar('.modal [data-r="dibujo"]',{pausa:700});
        await h.tocar('.modal [data-pl="cuadricula"]',{pausa:600});await parabola(h,{cy:400});await h.esperar(500)}},
    {id:'08-lectura',capitulo:'8 · Lectura',voz:'La biblioteca tiene libros libres en inglés y en español, con filtros por idioma y nivel.',ruta:'estudio/lectura',
      async accion(h){await h.esperar(700);await h.tocarTexto('Inglés',{pausa:900});await h.bajar(500)}},
    {id:'09-ia',capitulo:'9 · IA gratis con Gemini',sinClave:true,voz:'Para la inteligencia artificial, crea tu clave gratis de Gemini y pégala aquí. Se guarda solo en tu teléfono.',ruta:'ajustes-ia',
      async accion(h){await h.esperar(800);await h.apuntar('#ia-clave');await h.esperar(600);await h.bajar(450)}},
    {id:'10-cierre',tarjeta:'cierre-tutorial',titulo:'Invita a tus amigos',voz:'Invita a tus amigos con el código QR. Y muy pronto: Electrónica.'}
  ]
};
