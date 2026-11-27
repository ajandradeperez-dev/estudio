/* 🧭 Mi análisis · datos de ejemplo (PROMPT-MI-ANALISIS, parte 5). Fijos: se muestran con la franja «Datos de ejemplo: no
   es tu progreso» y son también la prueba (npm run analisis los compara con numpy). */
export const METRICAS=['acierto','nivel','sesiones','días','días sin practicar','fallos'];
export const EJEMPLO_HABILIDADES=[
  ['Gauss-Jordan','Matemáticas',0.90,4.2,8,6,2,0],
  ['Determinantes','Matemáticas',0.80,3.8,6,5,4,1],
  ['Núcleo (kernel) e imagen','Matemáticas',0.50,2.4,3,2,9,3],
  ['Valores y vectores propios','Matemáticas',0.40,2.0,2,2,12,2],
  ['Límites','Matemáticas',0.85,4.0,7,6,3,1],
  ['Regla de la cadena','Matemáticas',0.70,3.2,5,4,6,2],
  ['Integración por partes','Matemáticas',0.30,1.6,2,1,15,4],
  ['Present perfect','Inglés',0.95,4.6,9,8,1,0],
  ['Phrasal verbs','Inglés',0.60,2.8,4,3,20,2],
  ['Subredes','Ciberseguridad',0.90,4.4,10,7,5,0],
  ['Firewall','Ciberseguridad',0.75,3.5,5,4,18,1],
  ['Productos notables','Matemáticas',1.00,5.0,6,5,25,0]
].map(([nombre,materia,...x])=>({nombre,materia,x}));
export const EJEMPLO_SERIE={t:[0,2,3,5,8,9,12,14,15,18,21,22,25,28],y:[0,1,1,2,3,3,4,5,5,6,7,7,8,9],examen:40,meta:14,materia:'Álgebra lineal'};
