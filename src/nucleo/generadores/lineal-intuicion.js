/* Álgebra lineal para quien la ve por primera vez (PROMPT-ALGEBRA-PULIR, parte 3): la mini-lección de cada habilidad
   muestra, además de la idea, una INTUICIÓN VISUAL (SVG, se adapta al modo oscuro) y «¿Para qué sirve?». El ejemplo
   numérico chico es el ejemplo resuelto de nivel 1 que ya arma la mini-lección. Sin DOM. */
import {planoVectores} from './diagramas.js';

const r1=x=>Math.round(x*10)/10;
const svg=(cuerpo,etiqueta)=>`<svg class="diagrama" viewBox="0 0 260 260" role="img" aria-label="${etiqueta}"><line class="eje" x1="10" y1="130" x2="250" y2="130"/><line class="eje" x1="130" y1="10" x2="130" y2="250"/>${cuerpo}</svg>`;
const P=([x,y],S=22)=>[r1(130+x*S),r1(130-y*S)];
const linea=(a,b,cls,S)=>{const [x1,y1]=P(a,S),[x2,y2]=P(b,S);return `<line class="vec ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`};
const texto=(p,t,S)=>{const [x,y]=P(p,S);return `<text x="${x}" y="${y}">${t}</text>`};
const punto=(p,cls,S)=>{const [x,y]=P(p,S);return `<circle class="punta ${cls}" cx="${x}" cy="${y}" r="5"/>`};
// dos rectas que se cortan: la solución de un sistema 2×2 es el punto común
const dosRectas=svg(linea([-5,5.5],[5,-4.5],'v0')+linea([-5,-3],[5,4.5],'v1')+punto([1,1.5],'v2')+texto([1.3,2.6],'solución'),'Dos rectas que se cortan en un punto: la solución del sistema');
// el cuadrado unitario y su imagen por A: el área cambia por |det A|
const cuadrado=(A,S=26)=>{const q=[[0,0],[1,0],[1,1],[0,1]],im=q.map(([x,y])=>[A[0][0]*x+A[0][1]*y,A[1][0]*x+A[1][1]*y]);
  const poli=(ps,cls)=>`<polygon class="vec ${cls}" fill-opacity=".15" points="${ps.map(p=>P(p,S).join(',')).join(' ')}"/>`;
  return svg(poli(q,'v0')+poli(im,'v1')+texto([0.2,-0.6],'1',S)+texto([im[2][0]-0.4,im[2][1]+0.5],'área = |det A|',S),'El cuadrado de área 1 y su imagen: un paralelogramo de área |det A|')};
// vector propio: A no lo saca de su recta
const propio=svg(`<line class="eje" stroke-dasharray="4 4" x1="20" y1="240" x2="240" y2="20"/>`+linea([0,0],[2,2],'v0')+texto([2.3,1.6],'v')+linea([0,0],[4,4],'v1')+texto([1.6,4.9],'Av = 2v')+linea([0,0],[2,-1],'v2')+linea([0,0],[1,-3.5],'v3')+texto([1.2,-3.8],'Aw (gira)'),'Un vector propio v se queda en su recta: Av = 2v; otro vector w sí gira');
// proyección ortogonal: la sombra de b sobre la recta de u
const proyeccion=svg(`<line class="eje" stroke-dasharray="4 4" x1="20" y1="185" x2="240" y2="75"/>`+linea([0,0],[2,4],'v0')+texto([2.1,4.2],'b')+linea([0,0],[3.2,1.6],'v1')+texto([3.3,1.1],'proyección')+linea([2,4],[3.2,1.6],'v2'),'La proyección de b sobre la recta: el punto más cercano; lo que sobra es perpendicular');
// puntos y la recta que pasa «lo más cerca posible»
const nube=svg([[-4,-2.6],[-2,-1.2],[0,0.8],[2,0.9],[4,3.1]].map(p=>punto(p,'v0')).join('')+linea([-5,-3],[5,3],'v1')+texto([1.5,3.5],'recta de mínimos cuadrados'),'Puntos que no están alineados y la recta que pasa lo más cerca de todos');
// cambio de base: la misma flecha medida con otra cuadrícula
const otraBase=svg([-4,-2,0,2,4].map(k=>linea([k-4,-2],[k+4,2],'eje')).join('')+linea([0,0],[2,1],'v0')+texto([2,1.4],'b₁')+linea([0,0],[-1,1],'v1')+texto([-1.6,1.4],'b₂')+linea([0,0],[1,2],'v2')+texto([1.1,2.4],'w = b₁ + b₂'),'El mismo vector w con otros ejes: sus coordenadas cambian');
// matriz como «máquina»: (1,0) y (0,1) se van a las columnas
const columnas=planoVectores([{v:[1,0],nombre:'e₁'},{v:[0,1],nombre:'e₂'},{v:[2,1],nombre:'T(e₁)'},{v:[-1,2],nombre:'T(e₂)'}]);
// forma cuadrática: elipse girada y sus ejes principales
const elipse=svg(`<ellipse class="vec v0" fill-opacity=".12" cx="130" cy="130" rx="90" ry="45" transform="rotate(-30 130 130)"/>`+`<line class="vec v1" x1="52" y1="175" x2="208" y2="85"/><line class="vec v2" x1="107" y1="91" x2="153" y2="169"/>`+`<text x="200" y="80">eje 1</text><text x="150" y="190">eje 2</text>`,'Una elipse inclinada y sus ejes principales (los vectores propios, perpendiculares)');
// escalonar: ceros debajo de la diagonal
const escalon=`<svg class="diagrama" viewBox="0 0 260 150" role="img" aria-label="Una matriz escalonada: ceros debajo de los pivotes">${[[0,0],[1,0],[2,0],[3,0],[1,1],[2,1],[3,1],[2,2],[3,2]].map(([j,i])=>`<rect class="vec v${j===i?1:0}" fill-opacity="${j===i?'.35':'.1'}" x="${30+j*50}" y="${15+i*42}" width="44" height="36" rx="6"/>`).join('')}${[[0,1],[0,2],[1,2]].map(([j,i])=>`<text x="${46+j*50}" y="${39+i*42}">0</text>`).join('')}</svg>`;

const I=(paraQue,intuicion,pie)=>({paraQue,intuicion,pie});
export const INTUICION={
  'al/gauss':I('Resolver sistemas de cualquier tamaño: mezclas, dietas, circuitos, tráfico. Es el método que usan las computadoras.',dosRectas,'Cada ecuación de un sistema 2×2 es una recta: la solución es donde se cortan. Gauss encuentra ese punto con cuentas, sin dibujar.'),
  'al/gauss-jordan':I('Leer de un vistazo si un sistema tiene una solución, ninguna o infinitas, y calcular inversas.',escalon,'Escalonar es dejar ceros debajo de cada pivote; Gauss-Jordan también deja ceros arriba y unos en los pivotes.'),
  'al/matriz-producto':I('Encadenar transformaciones (girar y luego escalar), calcular costos de varios productos a la vez, gráficos de videojuegos.',columnas,'Una matriz es una «máquina» que mueve vectores; multiplicar matrices es poner una máquina después de otra.'),
  'al/inversa':I('Deshacer una transformación y resolver muchos sistemas con la misma matriz (por ejemplo, descifrar mensajes).',cuadrado([[2,1],[1,1]]),'Si A deforma el cuadrado, A⁻¹ lo regresa a su forma. Si el área se vuelve 0 (det A = 0), ya no se puede regresar: no hay inversa.'),
  'al/lu':I('Resolver muchos sistemas con la misma matriz sin repetir toda la eliminación: así lo hacen los programas de ingeniería.',escalon,'U es la matriz ya escalonada; L guarda «cuánto restaste» de cada renglón para llegar ahí.'),
  'al/determinante':I('Saber si un sistema tiene solución única, calcular áreas y volúmenes, y decidir si una matriz tiene inversa.',cuadrado([[2,1],[0,1.5]]),'El determinante es el factor por el que A multiplica las áreas: el cuadrado de área 1 se vuelve un paralelogramo de área |det A|.'),
  'al/cramer':I('Despejar una sola incógnita sin resolver todo el sistema; útil en sistemas chicos y en fórmulas de circuitos.',dosRectas,'Cada incógnita es un cociente de dos áreas (determinantes): la del sistema y la que resulta al cambiar una columna por los resultados.'),
  'al/vector-magnitud':I('Distancias en mapas y en el espacio, velocidad de un objeto, longitud de un desplazamiento.',planoVectores([{v:[3,4],nombre:'v'}]),'La magnitud es el largo de la flecha: por Pitágoras, √(3² + 4²) = 5.'),
  'al/vector-operaciones':I('Combinar desplazamientos y fuerzas: dos empujones juntos dan un empujón resultante.',planoVectores([{v:[3,1],nombre:'u'},{v:[1,2],nombre:'v',desde:[3,1]},{v:[4,3],nombre:'u + v'}]),'Sumar vectores es poner uno a continuación del otro (punta con cola).'),
  'al/producto-punto':I('Saber si dos direcciones son perpendiculares, calcular trabajo (fuerza por desplazamiento) y similitud entre datos.',planoVectores([{v:[3,1],nombre:'u'},{v:[-1,3],nombre:'v'}]),'Si el producto punto da 0, las flechas forman 90°: aquí (3)(−1) + (1)(3) = 0.'),
  'al/angulo':I('Medir qué tan parecidas son dos direcciones: en física, en gráficos 3D y en buscadores (similitud del coseno).',planoVectores([{v:[4,0],nombre:'u'},{v:[2,2],nombre:'v'}]),'El coseno del ángulo es el producto punto dividido entre los dos largos.'),
  'al/producto-cruz':I('Encontrar una dirección perpendicular a dos, el torque de una llave y el área de un paralelogramo en 3D.',planoVectores([{v:[3,0],nombre:'u'},{v:[1,2],nombre:'v'}]),'u × v es perpendicular a u y a v (sale de la hoja) y su largo es el área del paralelogramo que forman.'),
  'al/rectas-planos':I('Describir trayectorias y superficies en 3D: aviones, robots, modelado 3D.',planoVectores([{v:[1,2],nombre:'dirección',desde:[1,0]},{v:[1,0],nombre:'P₀'}]),'Una recta es «un punto y una dirección»: P = P₀ + t·d.'),
  'al/combinacion-lineal':I('Saber qué se puede «armar» con unos ingredientes: colores con rojo, verde y azul; mezclas con materias primas.',planoVectores([{v:[2,0],nombre:'u'},{v:[1,2],nombre:'v'},{v:[3,2],nombre:'u + v'}]),'Con dos flechas que no son paralelas se llega a cualquier punto del plano: el espacio que generan es todo ℝ².'),
  'al/independencia':I('Detectar información repetida: si un dato se obtiene de otros, sobra (encuestas, sensores, columnas de una tabla).',planoVectores([{v:[2,1],nombre:'u'},{v:[4,2],nombre:'2u'}]),'Dos vectores sobre la misma recta son dependientes: uno es múltiplo del otro y no aporta una dirección nueva.'),
  'al/base-dimension':I('Elegir el mínimo de «ingredientes» que describen todo: coordenadas, canales de color, variables de un modelo.',planoVectores([{v:[1,0],nombre:'e₁'},{v:[0,1],nombre:'e₂'}]),'Una base son las direcciones mínimas para llegar a todo; cuántas son es la dimensión.'),
  'al/cambio-base':I('Medir con los ejes que convienen: cuadrículas inclinadas en videojuegos, ejes de una pieza en ingeniería.',otraBase,'El vector es el mismo; lo que cambia es la cuadrícula con la que lo mides.'),
  'al/rango':I('Contar cuánta información distinta hay en una tabla y saber si un sistema tiene solución.',escalon,'El rango es el número de pivotes al escalonar: los renglones que de verdad aportan algo.'),
  'al/transformaciones':I('Rotar, escalar y reflejar imágenes y figuras: gráficos de computadora y animación.',columnas,'Basta saber a dónde van (1, 0) y (0, 1): eso decide a dónde va todo lo demás.'),
  'al/matriz-transformacion':I('Pasar de una descripción con palabras («rota 90° y amplía») a una matriz que la computadora puede usar.',columnas,'Las columnas de la matriz son T(e₁) y T(e₂): las flechas a donde la transformación manda los ejes.'),
  'al/nucleo-imagen':I('Saber qué se pierde (núcleo) y qué se puede alcanzar (imagen) con una transformación: compresión de datos y sistemas.',planoVectores([{v:[2,-1],nombre:'núcleo'},{v:[1,2],nombre:'imagen'}]),'El núcleo son los vectores que la transformación aplasta hasta el 0; la imagen, todo lo que puede producir.'),
  'al/valores-propios':I('Encontrar las direcciones «naturales» de un sistema: vibraciones, crecimiento de poblaciones, el PageRank de Google.',propio,'Un vector propio no cambia de dirección al aplicar A: solo se estira o se encoge por λ.'),
  'al/diagonalizacion':I('Calcular potencias Aⁿ rápido: poblaciones a largo plazo, cadenas de Markov, sistemas dinámicos.',propio,'En la base de vectores propios, A solo estira cada eje: es una matriz diagonal.'),
  'al/gram-schmidt':I('Construir ejes perpendiculares a partir de cualquier base: gráficos 3D, señales y mínimos cuadrados.',proyeccion,'Le quitas a cada vector su sombra sobre los anteriores: lo que queda es perpendicular.'),
  'al/minimos-cuadrados':I('Ajustar una recta o un modelo a datos con errores: pronósticos de ventas, calibrar sensores, regresión.',nube,'Si los puntos no están en una recta, buscas la que pasa más cerca de todos: la que hace más chica la suma de los errores al cuadrado.'),
  'al/diagonalizacion-ortogonal':I('Encontrar los ejes principales de una elipse o de unos datos (análisis de componentes principales), y saber si una energía siempre es positiva.',elipse,'Una matriz simétrica estira en direcciones perpendiculares: girando a esos ejes desaparece el término xy.')
};
