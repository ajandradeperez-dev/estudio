/* Temas de la materia, en orden (cada uno es la carpeta temas/<id>/ con sus lecciones).
   proximas: títulos de lecciones que aún no existen (se ven bloqueadas como "Próximamente").
   El id del tema va en la URL: no lo cambies después de publicarlo. Lo usan la app y npm run revisar. */
export default [
  {id:'algebra-basica',titulo:'Álgebra básica',icono:'🧮',descripcion:'Expresiones, ecuaciones lineales y sistemas 2×2.'},
  {id:'algebra-lineal',titulo:'Álgebra lineal',icono:'📐',descripcion:'Vectores, matrices, sistemas y transformaciones.',
   proximas:['Matrices y operaciones','Sistemas de ecuaciones (Gauss)','Determinantes e inversa','Transformaciones lineales, valores y vectores propios']},
  {id:'calculo-diferencial',titulo:'Cálculo diferencial',icono:'📈',descripcion:'Límites, derivadas, reglas de derivación y aplicaciones.',
   proximas:['Derivadas: la pendiente en un punto','Reglas de derivación','Aplicaciones: máximos y mínimos']},
  {id:'calculo-integral',titulo:'Cálculo integral',icono:'∫',descripcion:'Antiderivadas, integral definida, sustitución, por partes y áreas.',
   proximas:['Integral definida','Integración por sustitución','Integración por partes','Áreas bajo la curva']}
];
