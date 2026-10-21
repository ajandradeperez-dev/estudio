/* Curso de Python · unidades 10–13: errores y excepciones (try/except), archivos (en el sistema de archivos simulado de
   Pyodide) y módulos, clases y objetos, y proyectos pequeños (calculadora, adivinar, agenda, calificaciones).
   Generadores 'pyc/…' por plantillas; cada pregunta lleva `py` (npm run python). Sin DOM. */
import {crearGen} from './extensiones/base.js';
import {predice,completa,encuentraError,ordenar,pyNum,pyLista,pyBool} from './python-base.js';
import {NIV} from './python-1.js';

const NOMBRES=['Ana','Luis','Marta','Pedro','Sofía','Diego','Valeria','Iván'];
const lista=(rng,k,a=1,b=20)=>Array.from({length:k},()=>rng.entero(a,b));
const sum=v=>v.reduce((s,x)=>s+x,0);

/* ---------- 10 · Excepciones ---------- */
const tryExcept=crearGen({titulo:'try / except',
  explicacion:'Cuando algo puede fallar (convertir un texto, dividir entre cero, abrir un archivo), envuélvelo en <code>try:</code> y atrapa el error con <code>except TipoDeError:</code>. Si ocurre ese error, Python salta al bloque except en vez de detener el programa. <code>else:</code> corre si no hubo error y <code>finally:</code> corre siempre.',
  alternativa:'try es «intenta esto»; except es el colchón por si te caes. Sin colchón, el programa se detiene con el mensaje de error.',
  referencia:'PCEP 4.4 – Excepciones: try, except, else, finally · OpenStax Python cap. 11',regla:'try ejecuta; si hay un error del tipo indicado salta a su except; else si no hubo error; finally siempre.',
  pista:'¿Qué línea del try falla? Desde ahí salta al except.',
  tarjetas:[['¿Qué pasa con las líneas del try después de la que falla?','No se ejecutan: salta al except.'],['int("hola")','ValueError'],['10 / 0','ZeroDivisionError'],['finally','Se ejecuta siempre, haya error o no.']],
  plantillas:{
    b1:{prof:'basico',f:(n,rng)=>{const a=rng.entero(5,50);return predice({codigo:`try:\n    print(${a} / 0)\nexcept ZeroDivisionError:\n    print("no se puede")`,salida:'no se puede',
      traza:[['Dividir entre 0 falla','ZeroDivisionError','El try se interrumpe.'],['Salta al except','imprime «no se puede»','El programa sigue.']],
      errores:[['0','Dividir entre cero es un error, no da 0.'],['ZeroDivisionError','El except lo atrapa: se ve su mensaje.'],[`${a}`,'Se intenta dividir entre 0.']]})}},
    b2:{prof:'basico',f:(n,rng)=>{const w=rng.elegir(['doce','3.5','abc','10']);const ok=/^\d+$/.test(w);return predice({codigo:`try:\n    n = int("${w}")\n    print("ok", n)\nexcept ValueError:\n    print("no es un entero")`,salida:ok?`ok ${w}`:'no es un entero',
      traza:[['¿int() puede leerlo?',`int("${w}") → ${ok?w:'ValueError'}`,'int solo acepta enteros escritos con dígitos.']],
      errores:[[ok?'no es un entero':`ok ${w}`,ok?'"'+w+'" sí es un entero.':'int() no puede convertir "'+w+'".'],['ValueError','El except atrapa el error.']]})}},
    p1:{prof:'procedimiento',f:(n,rng)=>{const a=rng.entero(2,9);return predice({codigo:`try:\n    print("A")\n    x = ${a} / 0\n    print("B")\nexcept ZeroDivisionError:\n    print("C")\nfinally:\n    print("D")`,salida:'A\nC\nD',
      traza:[['Se ejecuta hasta la línea que falla','A','Luego la división falla.'],['B no se ejecuta','salta al except → C','Lo que sigue en el try se salta.'],['finally siempre','D','Haya error o no.']],
      errores:[['A B C D','Después del error, B ya no se ejecuta.'],['A C','finally siempre se ejecuta.'],['C D','A se imprime antes del error.']]})}},
    p2:{prof:'procedimiento',f:(n,rng)=>{const v=['5','x','8','2.5','3'];const s=v.filter(x=>/^\d+$/.test(x)).reduce((a,b)=>a+ +b,0);return predice({codigo:`total = 0\nfor t in ${pyLista(v)}:\n    try:\n        total += int(t)\n    except ValueError:\n        print("salto", t)\nprint(total)`,salida:`salto x\nsalto 2.5\n${s}`,
      traza:[['Cada elemento por separado','5 ✓, x ✗, 8 ✓, 2.5 ✗, 3 ✓','int("2.5") también falla.'],['Suma de los válidos',`5 + 8 + 3 = ${s}`,'El try está dentro del for: sigue con el siguiente.']],
      errores:[[`salto x ${s+2}`,'int("2.5") da ValueError: tampoco se suma.'],[`salto x salto 2.5 ${s+2.5}`,'Los que fallan no se suman.'],['ValueError','Se atrapa dentro del for.']]})}},
    a1:{prof:'aplicacion',f:(n,rng)=>{const a=rng.entero(10,99),b=rng.elegir([0,rng.entero(1,9)]);return completa({codigo:`a = ${a}\nb = ${b}\ntry:\n    print(a / b)\nexcept ___:\n    print("Divisor inválido")`,respuestas:['ZeroDivisionError'],salida:b?pyNum(a/b,true):'Divisor inválido',
      enun:'Completa el tipo de error que hay que atrapar si el divisor puede ser cero.',
      traza:[['Dividir entre 0 da','ZeroDivisionError','Ese es el que se atrapa.']],
      errores:[['ValueError','ValueError es para conversiones inválidas.'],['ZeroError','El nombre completo es ZeroDivisionError.'],['TypeError','No hay mezcla de tipos.']]})}},
    a2:{prof:'aplicacion',f:(n,rng)=>{const e=rng.elegir(['veinte','25']);return ordenar({lineas:['try:','    edad = int(entrada)','    print("Edad:", edad)','except ValueError:','    print("Escribe la edad con números")'],salida:/^\d+$/.test(e)?`Edad: ${e}`:'Escribe la edad con números',
      enun:`Con <code>entrada = "${e}"</code>, ordena el bloque que convierte la edad y avisa si no es un número.`,
      traza:[['try primero, con lo que puede fallar adentro','int(entrada) puede dar ValueError','La conversión va dentro del try.'],['except al final','su mensaje con sangría','Atrapa el ValueError.']]})}}
  },niveles:NIV});
// La prueba de «ordenar» necesita la variable entrada
const conPreparacion=(g,pl,prep)=>({...g,generar(n,rng){const p=g.generar(n,rng);if(p.plantilla===pl&&p.py)p.py={...p.py,codigo:prep(p)+p.py.codigo};return p}});

const tiposError=crearGen({titulo:'Tipos de error',
  explicacion:'Cada error tiene nombre y te dice qué buscar: <code>ValueError</code> (valor inválido: <code>int("hola")</code>), <code>TypeError</code> (tipos que no se combinan: <code>"a" + 1</code>), <code>IndexError</code> (índice fuera de la lista), <code>KeyError</code> (clave que no está en el diccionario), <code>ZeroDivisionError</code>, <code>NameError</code>, <code>AttributeError</code> (método que no existe: <code>(5).upper()</code>) y <code>FileNotFoundError</code>.',
  alternativa:'El nombre del error es el diagnóstico: Index = te pasaste de la fila, Key = esa llave no abre nada, Type = mezclaste peras con manzanas.',
  referencia:'PCEP 4.4 – Jerarquía de excepciones comunes · OpenStax Python cap. 11',regla:'ValueError valor; TypeError tipos; IndexError índice; KeyError clave; ZeroDivisionError ÷0; NameError nombre; AttributeError método; FileNotFoundError archivo.',
  pista:'¿Qué operación hace la línea y qué podría estar fuera de lugar?',
  tarjetas:[['v = [1, 2]; v[5]','IndexError'],['d = {}; d["x"]','KeyError'],['(5).upper()','AttributeError'],['open("no_existe.txt")','FileNotFoundError']],
  plantillas:Object.fromEntries([
    ['b1','basico',(rng)=>{const v=lista(rng,3);return {codigo:`v = ${pyLista(v)}\nprint(v[3])`,tipo:'IndexError',arreglo:'print(v[2])',traza:[['La lista tiene 3 elementos','índices 0, 1 y 2','El 3 no existe.']]}}],
    ['b2','basico',(rng)=>{const nm=rng.elegir(NOMBRES);return {codigo:`edades = {"${nm}": 20}\nprint(edades["Zoe"])`,tipo:'KeyError',arreglo:'print(edades.get("Zoe", 0))',traza:[['La clave no está',`solo existe "${nm}"`,'Buscar una clave inexistente con [] da KeyError.']]}}],
    ['p1','procedimiento',(rng)=>{const a=rng.entero(1,9);return {codigo:`x = ${a}\nprint(x.upper())`,tipo:'AttributeError',arreglo:'print(str(x).upper())',traza:[['upper es un método de los textos',`x = ${a} es un entero`,'Un int no tiene upper.']]}}],
    ['p2','procedimiento',(rng)=>{const w=rng.elegir(['3,5','10 pesos','1e']);return {codigo:`precio = float("${w}")`,tipo:'ValueError',arreglo:'precio = float("3.5")',traza:[['float necesita un número bien escrito',`"${w}" no lo es`,'El tipo es correcto (texto) pero el valor no.']]}}],
    ['a1','aplicacion',(rng)=>{const n=rng.entero(1,9);return {codigo:`items = ${n}\nprint("Llevas " + items + " productos")`,tipo:'TypeError',arreglo:'print("Llevas " + str(items) + " productos")',traza:[['Texto + número','no se pueden pegar','Convierte con str().']]}}],
    ['a2','aplicacion',(rng)=>({codigo:'datos = open("ventas_2030.txt").read()',tipo:'FileNotFoundError',arreglo:'datos = ""',traza:[['El archivo no existe','ventas_2030.txt','open en modo lectura exige que el archivo exista.']]})]
  ].map(([k,prof,f])=>[k,{prof,f:(n,rng)=>{const x=f(rng);const otros=['ValueError','TypeError','IndexError','KeyError','AttributeError','NameError'].filter(t=>t!==x.tipo);
    return encuentraError({pregunta:'tipo',codigo:x.codigo,linea:x.codigo.split('\n').length,tipo:x.tipo,arreglo:x.arreglo,salidaArreglo:undefined,traza:x.traza,
      errores:otros.slice(0,3).map(t=>[t,`${t} es otro caso: aquí el problema es ${x.traza[0][1]}.`])})}}])),
  niveles:NIV});

/* ---------- 11 · Archivos y módulos ---------- */
const archivos=crearGen({titulo:'Archivos',
  explicacion:'Para leer y escribir archivos: <code>with open("notas.txt", "w") as f:</code> y <code>f.write("texto\\n")</code> (<b>w</b> crea o borra el archivo; <b>a</b> agrega al final; <b>r</b> lee, y es el modo por defecto). Para leer: <code>f.read()</code> todo, o <code>for linea in f:</code> línea por línea (cada una trae su <code>\\n</code>: usa <code>.strip()</code>). <code>with</code> cierra el archivo solo. Aquí se usa un sistema de archivos simulado dentro del navegador.',
  alternativa:'open es abrir un cuaderno: con "w" arrancas las hojas y escribes desde cero; con "a" sigues donde te quedaste; con "r" solo lees.',
  referencia:'PCAP 4.4 – Archivos (open, read, write, with) · OpenStax Python cap. 13',regla:'"w" escribe desde cero, "a" agrega, "r" lee; with cierra el archivo; las líneas leídas traen \\n (strip).',
  pista:'Sigue qué hay en el archivo después de cada open.',
  tarjetas:[['open("a.txt", "w")','Crea el archivo o lo deja vacío para escribir.'],['open("a.txt", "a")','Agrega al final sin borrar.'],['¿Para qué sirve with?','Cierra el archivo automáticamente.'],['Leer línea por línea sin el salto','for l in f: l.strip()']],
  plantillas:{
    b1:{prof:'basico',f:(n,rng)=>{const w=rng.elegir(['hola','datos','python','lista']);return predice({codigo:`with open("prueba.txt", "w") as f:\n    f.write("${w}")\n\nwith open("prueba.txt") as f:\n    print(f.read())`,salida:w,
      traza:[['Escribe en el archivo',`prueba.txt contiene "${w}"`,'"w" crea el archivo.'],['Lo lee',w,'Sin modo, open lee.']],
      errores:[['prueba.txt','Imprime el contenido, no el nombre.'],['FileNotFoundError','El archivo se creó en el primer with.']]})}},
    b2:{prof:'basico',f:(n,rng)=>{const a=rng.elegir(['uno','dos','tres']),b=rng.elegir(['cuatro','cinco','seis']);return predice({codigo:`with open("a.txt", "w") as f:\n    f.write("${a}\\n")\nwith open("a.txt", "w") as f:\n    f.write("${b}\\n")\nwith open("a.txt") as f:\n    print(f.read().strip())`,salida:b,
      traza:[['"w" borra lo anterior',`primero "${a}", luego se reemplaza por "${b}"`,'Cada "w" empieza de cero.']],
      errores:[[`${a} ${b}`,'"w" borra el contenido anterior; para agregar es "a".'],[a,'La segunda escritura lo reemplazó.']]})}},
    p1:{prof:'procedimiento',f:(n,rng)=>{const v=lista(rng,3,1,9);return predice({codigo:`with open("n.txt", "w") as f:\n    f.write("${v[0]}\\n")\nwith open("n.txt", "a") as f:\n    f.write("${v[1]}\\n")\n    f.write("${v[2]}\\n")\ntotal = 0\nwith open("n.txt") as f:\n    for linea in f:\n        total += int(linea)\nprint(total)`,salida:sum(v),
      traza:[['"a" agrega',`el archivo queda con ${v.join(', ')} (una por línea)`,'No borra lo anterior.'],['Suma línea por línea',`${v.join(' + ')} = ${sum(v)}`,'int() ignora el \\n del final.']],
      errores:[[v[1]+v[2],'"a" no borra el primer número.'],[v.join(''),'Se convierten a int y se suman.']]})}},
    p2:{prof:'procedimiento',f:(n,rng)=>{const nm=rng.barajar(NOMBRES).slice(0,3);return predice({codigo:`with open("lista.txt", "w") as f:\n    for nombre in ${pyLista(nm)}:\n        f.write(nombre + "\\n")\nwith open("lista.txt") as f:\n    lineas = f.readlines()\nprint(len(lineas), lineas[1].strip())`,salida:`3 ${nm[1]}`,
      traza:[['Una línea por nombre','3 líneas','Cada write agrega \\n.'],['readlines da una lista',`lineas[1] = "${nm[1]}\\n"`,'strip quita el salto.']],
      errores:[[`3 ${nm[0]}`,'lineas[1] es la segunda.'],[`1 ${nm[1]}`,'Hay una línea por nombre.']]})}},
    a1:{prof:'aplicacion',f:(n,rng)=>{const t=rng.elegir(['Compra pan','Pagar luz','Estudiar']);return completa({codigo:`with open("tareas.txt", "w") as f:\n    f.write("Llamar\\n")\nwith open("tareas.txt", "___") as f:\n    f.write("${t}\\n")\nwith open("tareas.txt") as f:\n    print(len(f.readlines()))`,respuestas:['a'],salida:2,
      enun:`Quieres agregar la tarea «${t}» sin borrar las que ya están. Completa el modo.`,
      traza:[['Agregar al final','modo "a"','Quedan 2 tareas.']],
      errores:[['w','"w" borraría la tarea anterior.'],['r','"r" es solo para leer.'],['x','Para agregar: "a".']]})}},
    a2:{prof:'aplicacion',f:(n,rng)=>{const v=lista(rng,4,50,100);return ordenar({lineas:['with open("notas.txt", "w") as f:',`    f.write("${v.join('\\n')}")`,'with open("notas.txt") as f:','    notas = [int(l) for l in f]','print(max(notas))'],salida:Math.max(...v),
      enun:'Ordena el programa que guarda unas calificaciones en un archivo, las vuelve a leer y muestra la más alta.',
      traza:[['Primero se escribe, luego se lee','el archivo debe existir antes de leerlo','Si no, FileNotFoundError.'],['Al final el resultado',`max = ${Math.max(...v)}`,'Ya con la lista leída.']]})}}
  },niveles:NIV});

const modulos=crearGen({titulo:'Módulos',
  explicacion:'Un <b>módulo</b> es un archivo con funciones listas para usar. <code>import math</code> y luego <code>math.sqrt(16)</code>; o <code>from math import sqrt</code> y usas <code>sqrt(16)</code> directo. Útiles: <code>math</code> (sqrt, floor, ceil, pi), <code>random</code> (randint, choice), <code>datetime</code> (fechas). Con <code>import math as m</code> le pones un alias.',
  alternativa:'import es pedir prestada una caja de herramientas: con «import math» traes la caja y nombras math.sqrt; con «from math import sqrt» sacas solo esa herramienta.',
  referencia:'PCEP 4.5 – Módulos e import · OpenStax Python cap. 7',regla:'import m → m.funcion(); from m import f → f(); import m as x → x.funcion(); math.floor baja, math.ceil sube.',
  pista:'¿Cómo se importó? Eso dice cómo se llama la función.',
  tarjetas:[['import math; raíz de 16','math.sqrt(16) → 4.0'],['math.floor(3.7) y math.ceil(3.2)','3 y 4'],['from math import pi','Ya puedes escribir pi sin math.']],
  plantillas:{
    b1:{prof:'basico',f:(n,rng)=>{const k=rng.entero(2,12);return predice({codigo:`import math\nprint(math.sqrt(${k*k}))`,salida:pyNum(k,true),
      traza:[['Raíz cuadrada',`√${k*k} = ${k}`,'sqrt devuelve float.']],
      errores:[[k,'math.sqrt devuelve un float: lleva .0.'],[k*k/2,'Es la raíz cuadrada.'],['NameError','Se importó math.']]})}},
    b2:{prof:'basico',f:(n,rng)=>{const x=rng.entero(2,9)+rng.entero(1,9)/10;return predice({codigo:`import math\nprint(math.floor(${x}))\nprint(math.ceil(${x}))`,salida:`${Math.floor(x)}\n${Math.ceil(x)}`,
      traza:[['floor baja al entero',Math.floor(x),'Hacia abajo.'],['ceil sube al entero',Math.ceil(x),'Hacia arriba.']],
      errores:[[`${Math.ceil(x)} ${Math.floor(x)}`,'floor es hacia abajo.'],[`${Math.round(x)} ${Math.round(x)}`,'No es redondear: uno baja y otro sube.']]})}},
    p1:{prof:'procedimiento',f:(n,rng)=>{const k=rng.entero(2,9);return encuentraError({pregunta:'tipo',codigo:`import math\nprint(sqrt(${k*k}))`,linea:2,tipo:'NameError',arreglo:`print(math.sqrt(${k*k}))`,salidaArreglo:pyNum(k,true),
      traza:[['Con import math, la función se llama math.sqrt','sqrt solo no existe','Para usar sqrt directo: from math import sqrt.']],
      errores:[['ImportError','El import sí funcionó.'],['AttributeError','El problema es el nombre sin math.'],['TypeError','No hay mezcla de tipos.']]})}},
    p2:{prof:'procedimiento',f:(n,rng)=>{const r=rng.entero(1,9);return predice({codigo:`from math import pi\nprint(round(pi * ${r} ** 2, 2))`,salida:String(Math.round(Math.PI*r*r*100)/100),
      traza:[['Área del círculo',`π × ${r}² = ${Math.PI*r*r}`,'** antes que *.'],['round a 2 decimales',`${Math.round(Math.PI*r*r*100)/100}`,'Redondea.']],
      errores:[[String(Math.round(Math.PI*r*2*100)/100),'** es potencia: r al cuadrado.'],['NameError','from math import pi lo trae directo.']]})}},
    a1:{prof:'aplicacion',f:(n,rng)=>{const al=rng.entero(41,190),r=Math.ceil(al/40);return completa({codigo:`___ math import ceil
alumnos = ${al}
autobuses = ceil(alumnos / 40)
print(autobuses)`,respuestas:['from'],salida:r,
      enun:`${al} alumnos van de excursión en autobuses de 40 lugares. Completa la primera línea para usar <code>ceil</code> sin escribir <code>math.</code> antes.`,
      traza:[['Traer una función suelta','from math import ceil','Así se usa ceil directo.'],['ceil redondea hacia arriba',`${al} / 40 = ${(al/40).toFixed(3)} → ${r} autobuses`,'No puede quedar nadie fuera.']],
      errores:[['import','«import math import ceil» no es válido: es from … import.'],['using','En Python es from.'],['include','En Python es from.']]})}},
    a2:{prof:'aplicacion',f:(n,rng)=>{const k=rng.entero(2,9);return completa({codigo:`import math ___ m\nprint(m.factorial(${k}))`,respuestas:['as'],salida:[1,1,2,6,24,120,720,5040,40320,362880][k],
      enun:'Completa para ponerle al módulo el alias <code>m</code>.',
      traza:[['Alias','import math as m',`m.factorial(${k}) = ${[1,1,2,6,24,120,720,5040,40320,362880][k]}`]],
      errores:[['=','El alias se pone con as.'],['like','En Python es as.'],['to','En Python es as.']]})}}
  },niveles:NIV});
/* ---------- 12 · Clases y objetos ---------- */
const clases=crearGen({titulo:'Clases y objetos',
  explicacion:'Una <b>clase</b> es un molde; un <b>objeto</b> es algo hecho con ese molde. <code>class Perro:</code> con <code>def __init__(self, nombre):</code> que guarda <code>self.nombre = nombre</code>. Crear un objeto: <code>p = Perro("Toby")</code>; sus datos se leen con punto: <code>p.nombre</code>. <code>self</code> es «este objeto»: cada uno guarda sus propios datos.',
  alternativa:'La clase es el plano de una casa; cada objeto es una casa construida con ese plano: todas tienen cocina, pero cada una pinta la suya de otro color.',
  referencia:'PCAP 3.1 – Clases, objetos, __init__ y self · OpenStax Python cap. 12',regla:'class define el molde; __init__ se ejecuta al crear el objeto; self.atributo guarda datos del objeto; objeto.atributo los lee.',
  pista:'Sigue qué guarda cada objeto en self.',
  tarjetas:[['¿Cuándo se ejecuta __init__?','Al crear el objeto: Clase(...).'],['¿Qué es self?','El objeto que se está usando.'],['Leer un atributo','objeto.atributo']],
  plantillas:{
    b1:{prof:'basico',f:(n,rng)=>{const nm=rng.elegir(['Toby','Luna','Max','Coco']),e=rng.entero(1,12);return predice({codigo:`class Perro:\n    def __init__(self, nombre, edad):\n        self.nombre = nombre\n        self.edad = edad\n\np = Perro("${nm}", ${e})\nprint(p.nombre, p.edad)`,salida:`${nm} ${e}`,
      traza:[['__init__ guarda los datos',`self.nombre = "${nm}", self.edad = ${e}`,'Al crear el objeto.'],['Se leen con punto',`p.nombre y p.edad`,'Cada objeto tiene los suyos.']],
      errores:[['nombre edad','Imprime los valores guardados.'],[`${e} ${nm}`,'Primero nombre.']]})}},
    b2:{prof:'basico',f:(n,rng)=>{const a=rng.entero(1,9),b=rng.entero(10,20);return predice({codigo:`class Caja:\n    def __init__(self, cantidad):\n        self.cantidad = cantidad\n\nc1 = Caja(${a})\nc2 = Caja(${b})\nc1.cantidad += 5\nprint(c1.cantidad, c2.cantidad)`,salida:`${a+5} ${b}`,
      traza:[['Cada objeto tiene su propio dato',`c1: ${a}, c2: ${b}`,'Son dos cajas distintas.'],['Solo cambia c1',`${a} + 5 = ${a+5}`,'c2 no se toca.']],
      errores:[[`${a+5} ${b+5}`,'Solo se modificó c1.'],[`${a} ${b}`,'c1.cantidad += 5 sí cambia c1.']]})}},
    p1:{prof:'procedimiento',f:(n,rng)=>{const a=rng.entero(2,9),b=rng.entero(2,9);return predice({codigo:`class Rect:\n    def __init__(self, base, altura):\n        self.base = base\n        self.altura = altura\n    def area(self):\n        return self.base * self.altura\n\nr = Rect(${a}, ${b})\nprint(r.area())`,salida:a*b,
      traza:[['El objeto guarda base y altura',`base = ${a}, altura = ${b}`,'En __init__.'],['El método usa sus datos',`${a} × ${b} = ${a*b}`,'self.base y self.altura.']],
      errores:[[a+b,'area multiplica.'],['None','area tiene return.']]})}},
    p2:{prof:'procedimiento',f:(n,rng)=>{return encuentraError({pregunta:'tipo',codigo:'class Gato:\n    def __init__(self, nombre):\n        self.nombre = nombre\n\ng = Gato()',linea:5,tipo:'TypeError',arreglo:'g = Gato("Michi")',salidaArreglo:undefined,
      traza:[['__init__ pide un nombre','Gato() no lo da','Faltan argumentos → TypeError.']],
      errores:[['NameError','Gato sí existe.'],['AttributeError','El objeto ni siquiera se creó.'],['ValueError','Falta un argumento: TypeError.']]})}},
    a1:{prof:'aplicacion',f:(n,rng)=>{const s=rng.entero(100,500);return completa({codigo:`class Cuenta:\n    def __init__(self, saldo):\n        ___ = saldo\n\nc = Cuenta(${s})\nprint(c.saldo)`,respuestas:['self.saldo'],salida:s,
      enun:'Completa para que cada cuenta guarde su propio saldo.',
      traza:[['Guardar en el objeto','self.saldo = saldo','Sin self, sería una variable local que se pierde.']],
      errores:[['saldo','Sería una variable local: c.saldo no existiría.'],['Cuenta.saldo','Sería de la clase, no de cada cuenta.'],['self','Falta el nombre del atributo.']]})}},
    a2:{prof:'aplicacion',f:(n,rng)=>{const nm=rng.elegir(NOMBRES),p=rng.entero(5,10);return ordenar({lineas:['class Alumno:','    def __init__(self, nombre, promedio):','        self.nombre = nombre','        self.promedio = promedio',`a = Alumno("${nm}", ${p})`,'print(a.nombre, a.promedio)'],salida:`${nm} ${p}`,
      enun:'Ordena para definir la clase Alumno, crear un alumno y mostrar sus datos.',
      traza:[['Primero la clase con su __init__','class → def __init__ → self.…','La sangría muestra qué va dentro de qué.'],['Después crear y usar el objeto','Alumno(...) y print','Fuera de la clase.']]})}}
  },niveles:NIV});

const metodos=crearGen({titulo:'Métodos y estado',
  explicacion:'Los <b>métodos</b> son funciones dentro de la clase; reciben <code>self</code> y pueden <b>cambiar el estado</b> del objeto: <code>def depositar(self, monto): self.saldo += monto</code>. Se llaman con punto: <code>c.depositar(50)</code>. <code>__str__</code> define cómo se ve el objeto en <code>print</code>. Una clase puede <b>heredar</b> de otra: <code>class Estudiante(Persona):</code> recibe sus métodos.',
  alternativa:'Los atributos son lo que el objeto «tiene»; los métodos, lo que «sabe hacer». depositar cambia lo que tiene.',
  referencia:'PCAP 3.2 – Métodos, __str__ y herencia · OpenStax Python cap. 12',regla:'Los métodos reciben self y pueden modificar self.atributos; __str__ devuelve el texto para print; la subclase hereda los métodos de la clase base.',
  pista:'Lleva el valor de cada atributo después de cada llamada.',
  tarjetas:[['¿Qué recibe siempre un método como primer parámetro?','self'],['¿Para qué sirve __str__?','Para decidir qué se ve al hacer print(objeto).'],['class B(A):','B hereda los métodos de A.']],
  plantillas:{
    b1:{prof:'basico',f:(n,rng)=>{const s=rng.entero(100,300),d=rng.entero(10,90);return predice({codigo:`class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n    def depositar(self, monto):\n        self.saldo += monto\n\nc = Cuenta(${s})\nc.depositar(${d})\nprint(c.saldo)`,salida:s+d,
      traza:[['Saldo inicial',s,'__init__.'],['depositar suma',`${s} + ${d} = ${s+d}`,'Cambia self.saldo.']],
      errores:[[s,'depositar cambió el saldo.'],[d,'Se suma al saldo, no lo reemplaza.']]})}},
    b2:{prof:'basico',f:(n,rng)=>{const nm=rng.elegir(['Lámpara','Silla','Mesa']),p=rng.entero(100,900);return predice({codigo:`class Producto:\n    def __init__(self, nombre, precio):\n        self.nombre = nombre\n        self.precio = precio\n    def __str__(self):\n        return f"{self.nombre}: ${'$'}{self.precio}"\n\nprint(Producto("${nm}", ${p}))`,salida:`${nm}: $${p}`,
      traza:[['print usa __str__',`f"{self.nombre}: $\{self.precio}"`,'Devuelve el texto.'],['Con los datos',`${nm}: $${p}`,'Se rellenan las llaves.']],
      errores:[[`<__main__.Producto object>`,'Con __str__, print muestra ese texto.'],[`${nm} ${p}`,'El formato lo decide __str__.']]})}},
    p1:{prof:'procedimiento',f:(n,rng)=>{const s=rng.entero(100,200),r=rng.entero(20,90),r2=rng.entero(150,300);const s1=s>=r?s-r:s,s2=s1>=r2?s1-r2:s1;return predice({codigo:`class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n    def retirar(self, monto):\n        if monto > self.saldo:\n            print("Fondos insuficientes")\n        else:\n            self.saldo -= monto\n\nc = Cuenta(${s})\nc.retirar(${r})\nc.retirar(${r2})\nprint(c.saldo)`,salida:[s2===s1&&r2>s1?'Fondos insuficientes':null,s2].filter(x=>x!==null).join('\n'),
      traza:[['Primer retiro',`${r} ≤ ${s} → saldo ${s-r}`,'Hay fondos.'],['Segundo retiro',`${r2} > ${s1}? ${pyBool(r2>s1)}`,r2>s1?'No alcanza: no se descuenta.':'Se descuenta.']],
      errores:[[s-r-r2,'El método revisa si alcanza antes de restar.'],[s,'El primer retiro sí se hizo.']]})}},
    p2:{prof:'procedimiento',f:(n,rng)=>{const nm=rng.elegir(NOMBRES);return predice({codigo:`class Persona:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def saludar(self):\n        return "Hola, soy " + self.nombre\n\nclass Estudiante(Persona):\n    def estudiar(self):\n        return self.nombre + " estudia"\n\ne = Estudiante("${nm}")\nprint(e.saludar())\nprint(e.estudiar())`,salida:`Hola, soy ${nm}\n${nm} estudia`,
      traza:[['Estudiante hereda de Persona','tiene __init__ y saludar','Sin escribirlos de nuevo.'],['Y agrega estudiar',`${nm} estudia`,'Los dos métodos funcionan.']],
      errores:[['AttributeError','saludar viene heredado de Persona.'],[`${nm} estudia`,'Faltó la primera línea.']]})}},
    a1:{prof:'aplicacion',f:(n,rng)=>{const v=lista(rng,3,1,5);return completa({codigo:`class Carrito:\n    def __init__(self):\n        self.items = []\n    def agregar(self, precio):\n        self.items.___(precio)\n    def total(self):\n        return sum(self.items)\n\nc = Carrito()\n${v.map(x=>`c.agregar(${x*10})`).join('\n')}\nprint(c.total())`,respuestas:['append'],salida:sum(v)*10,
      enun:'Completa el método que agrega un precio a la lista de productos del carrito.',
      traza:[['Agregar a una lista','self.items.append(precio)',`total = ${v.map(x=>x*10).join(' + ')} = ${sum(v)*10}`]],
      errores:[['add','Las listas usan append (add es de los conjuntos).'],['push','En Python es append.'],['insert','insert necesita la posición.']]})}},
    a2:{prof:'aplicacion',f:(n,rng)=>{const t=rng.entero(15,35);return completa({codigo:`class Termometro:\n    def __init__(self, c):\n        self.c = c\n    def fahrenheit(___):\n        return self.c * 9 / 5 + 32\n\nprint(Termometro(${t}).fahrenheit())`,respuestas:['self'],salida:pyNum(t*9/5+32,true),
      enun:'Completa el parámetro que necesita todo método para usar los datos del objeto.',
      traza:[['Los métodos reciben el objeto','def fahrenheit(self):','Así pueden leer self.c.']],
      errores:[['c','El método recibe el objeto: self.'],['','Sin self da TypeError al llamarlo.'],['this','En Python se usa self.']]})}}
  },niveles:NIV});

/* ---------- 13 · Proyectos ---------- */
const proyectos=crearGen({titulo:'Proyectos pequeños',
  explicacion:'Un proyecto junta todo: <b>datos</b> (variables, listas, diccionarios), <b>decisiones</b> (if), <b>repetición</b> (for, while) y <b>funciones</b>. Antes de programar, escribe en español los pasos (algoritmo); luego tradúcelos uno por uno. Aquí: una calculadora, un juego de adivinar, una agenda y el análisis de una lista de calificaciones.',
  alternativa:'Un proyecto es una receta completa: primero lista los ingredientes (datos), luego los pasos (algoritmo) y al final cocina (código), probando cada paso.',
  referencia:'PCEP 1–4 integrado · OpenStax Python cap. 14 (proyectos)',regla:'Divide el problema: datos → algoritmo en pasos → una función por tarea → prueba con casos pequeños.',
  pista:'Primero di en español qué hace cada parte.',
  tarjetas:[['Primer paso de un proyecto','Escribir el algoritmo en pasos, en español.'],['¿Para qué una función por tarea?','Para probar y reutilizar cada parte por separado.'],['Probar un programa','Con casos pequeños cuyo resultado conoces.']],
  plantillas:{
    b1:{prof:'basico',f:(n,rng)=>{const a=rng.entero(2,20),b=rng.entero(2,9),op=rng.elegir(['+','-','*']);const r=op==='+'?a+b:op==='-'?a-b:a*b;return predice({codigo:`def calcular(a, op, b):\n    if op == "+":\n        return a + b\n    elif op == "-":\n        return a - b\n    elif op == "*":\n        return a * b\n    return "operación no válida"\n\nprint(calcular(${a}, "${op}", ${b}))`,salida:r,
      enun:'Calculadora: ¿qué imprime?',traza:[['Busca la rama de "'+op+'"',`${a} ${op} ${b} = ${r}`,'Se ejecuta el return de esa rama.']],
      errores:[['operación no válida','"'+op+'" sí es una operación válida.'],[a+b===r?a*b:a+b,'Revisa qué operación pide.']]})}},
    b2:{prof:'basico',f:(n,rng)=>{const s=rng.entero(1,20),g=rng.entero(1,20);return predice({codigo:`secreto = ${s}\nintento = ${g}\nif intento < secreto:\n    print("más alto")\nelif intento > secreto:\n    print("más bajo")\nelse:\n    print("¡adivinaste!")`,salida:g<s?'más alto':g>s?'más bajo':'¡adivinaste!',
      enun:'Juego de adivinar: ¿qué imprime?',traza:[['Compara el intento con el secreto',`${g} vs ${s}`,g<s?'Es menor: hay que subir.':g>s?'Es mayor: hay que bajar.':'Son iguales.']],
      errores:[[g<s?'más bajo':'más alto','Si el intento es menor, el secreto es más alto.'],['¡adivinaste!',g===s?'—':'No son iguales.']]})}},
    p1:{prof:'procedimiento',f:(n,rng)=>{const v=lista(rng,6,40,100);const ap=v.filter(x=>x>=70).length,pr=sum(v)/v.length;return predice({codigo:`notas = ${pyLista(v)}\naprobados = [n for n in notas if n >= 70]\nprint(len(aprobados), max(notas), round(sum(notas) / len(notas), 1))`,salida:`${ap} ${Math.max(...v)} ${pyNum(Math.round(pr*10)/10,true)}`,
      enun:'Análisis de calificaciones: ¿qué imprime?',traza:[['Aprobados (≥ 70)',`${v.filter(x=>x>=70).join(', ')||'ninguno'} → ${ap}`,'La comprensión filtra.'],['Máximo y promedio',`${Math.max(...v)} y ${sum(v)}/${v.length} = ${pr.toFixed(3)}`,'round a 1 decimal.']],
      errores:[[`${v.length-ap} ${Math.max(...v)} ${pyNum(Math.round(pr*10)/10,true)}`,'Se cuentan los que tienen 70 o más.'],[`${ap} ${Math.min(...v)} ${pyNum(Math.round(pr*10)/10,true)}`,'max es la más alta.']]})}},
    p2:{prof:'procedimiento',f:(n,rng)=>{const nm=rng.barajar(NOMBRES).slice(0,3),t=nm.map(()=>String(rng.entero(10000000,99999999)));const b=rng.elegir([...nm,'Zoe']);return predice({codigo:`agenda = {${nm.map((x,i)=>`"${x}": "${t[i]}"`).join(', ')}}\n\ndef buscar(nombre):\n    return agenda.get(nombre, "no está")\n\nprint(buscar("${b}"))`,salida:nm.includes(b)?t[nm.indexOf(b)]:'no está',
      enun:'Agenda: ¿qué imprime?',traza:[['get busca la clave',`"${b}" ${nm.includes(b)?'está':'no está'}`,'Si no está, devuelve el valor por defecto.']],
      errores:[['KeyError','get no da error.'],[b,'Devuelve el teléfono, no el nombre.']]})}},
    a1:{prof:'aplicacion',f:(n,rng)=>{const v=lista(rng,5,50,100);return completa({codigo:`notas = ${pyLista(v)}\n\ndef promedio(lista):\n    return ___\n\nprint(promedio(notas))`,respuestas:['sum(lista) / len(lista)','sum(lista)/len(lista)'],salida:pyNum(sum(v)/v.length,true),
      enun:'Completa la función que devuelve el promedio de cualquier lista de calificaciones.',
      traza:[['Promedio = suma ÷ cantidad','sum(lista) / len(lista)',`${sum(v)} / ${v.length} = ${sum(v)/v.length}`],['Usa el parámetro','lista, no notas','Así sirve para cualquier lista.']],
      errores:[['sum(notas) / len(notas)','Funciona aquí, pero la función debe usar su parámetro (lista).'],['sum(lista) // len(lista)','// quitaría los decimales.'],['sum(lista)','Falta dividir entre la cantidad.']]})}},
    a2:{prof:'aplicacion',f:(n,rng)=>{const s=rng.entero(1,20);return ordenar({lineas:[`secreto = ${s}`,'intentos = 0',`for intento in [10, 5, ${s}]:`,'    intentos += 1','    if intento == secreto:','        print("Adivinaste en", intentos)','        break'],salida:`Adivinaste en ${[10,5,s].indexOf(s)+1}`,
      enun:'Ordena el juego de adivinar que prueba una lista de intentos y se detiene al acertar.',
      traza:[['Datos antes del bucle','secreto e intentos','Si intentos = 0 estuviera dentro, se reiniciaría.'],['Dentro del for: contar, comparar, avisar y salir','break al acertar','Cada nivel de sangría dentro del anterior.']]})}}
  },niveles:NIV});

export default {'pyc/try-except':conPreparacion(tryExcept,'a2',p=>`entrada = "${/entrada = "([^"]*)"/.exec(p.enunciado)[1]}"\n`),'pyc/tipos-error':tiposError,'pyc/archivos':archivos,'pyc/modulos':modulos,
  'pyc/clases':clases,'pyc/metodos':metodos,'pyc/proyectos':proyectos};
