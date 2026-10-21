/* 🧪 Laboratorio del curso de Python: «escribe la función», corregido como un juez con pruebas visibles y ocultas
   (nucleo/python/juez.js). Cada ejercicio: {id, unidad, titulo, enunciado, inicio, solucion, pruebas, ocultas, idea,
   primero, pasos:[[que, como, porque]], gemelo, preparar?}. npm run python comprueba en Pyodide que cada solución pasa
   todas sus pruebas y que el código inicial no. Los ids se guardan en el progreso (extra.lab): no los cambies. */
const P=(llamada,esperado)=>({llamada,esperado});
const T=(id,unidad,titulo,enunciado,o)=>({id,unidad,titulo,enunciado,inicio:o.inicio,solucion:o.solucion,pruebas:o.pruebas,ocultas:o.ocultas,
  idea:o.idea,primero:o.primero,pasos:o.pasos,gemelo:o.gemelo,preparar:o.preparar});
const def=(firma,coment='Escribe tu código aquí')=>`def ${firma}:\n    # ${coment}\n    pass\n`;

export const LABORATORIO=[
  // 1 · Primeros pasos
  T('saludo','primeros-pasos','Saludo personalizado','Escribe <code>saludo(nombre)</code> que <b>devuelva</b> el texto <code>"Hola, &lt;nombre&gt;!"</code>. Ejemplo: <code>saludo("Ana")</code> → <code>"Hola, Ana!"</code>.',{
    inicio:def('saludo(nombre)'),solucion:'def saludo(nombre):\n    return "Hola, " + nombre + "!"\n',
    pruebas:[P('saludo("Ana")',"'Hola, Ana!'"),P('saludo("Luis")',"'Hola, Luis!'")],ocultas:[P('saludo("")',"'Hola, !'"),P('saludo("Marta López")',"'Hola, Marta López!'")],
    idea:'Hay que armar un texto pegando tres partes: "Hola, ", el nombre y "!". Y devolverlo con return (no imprimirlo).',
    primero:'Con nombre = "Ana": <code>"Hola, " + nombre</code> da <code>"Hola, Ana"</code>; falta pegar <code>"!"</code>.',
    pasos:[['Pega las partes','"Hola, " + nombre + "!"','Con textos, + los une.'],['Devuélvelo','return "Hola, " + nombre + "!"','return entrega el valor; print solo lo mostraría.']],gemelo:'despedida'}),
  T('despedida','primeros-pasos','Despedida','Escribe <code>despedida(nombre)</code> que devuelva <code>"Adiós, &lt;nombre&gt;. ¡Vuelve pronto!"</code>.',{
    inicio:def('despedida(nombre)'),solucion:'def despedida(nombre):\n    return "Adiós, " + nombre + ". ¡Vuelve pronto!"\n',
    pruebas:[P('despedida("Eva")',"'Adiós, Eva. ¡Vuelve pronto!'")],ocultas:[P('despedida("Iván")',"'Adiós, Iván. ¡Vuelve pronto!'"),P('despedida("x")',"'Adiós, x. ¡Vuelve pronto!'")],
    idea:'Igual que el saludo: pega el texto fijo con el nombre y devuélvelo.',primero:'Con nombre = "Eva": <code>"Adiós, " + nombre + ". ¡Vuelve pronto!"</code>.',
    pasos:[['Pega las partes','"Adiós, " + nombre + ". ¡Vuelve pronto!"','Cuida espacios y signos.'],['Devuélvelo','return …','Con return.']],gemelo:'saludo'}),
  T('doble-y-triple','primeros-pasos','Doble más triple','Escribe <code>calcula(n)</code> que devuelva el doble de n más el triple de n. Ejemplo: <code>calcula(2)</code> → 10.',{
    inicio:def('calcula(n)'),solucion:'def calcula(n):\n    return n * 2 + n * 3\n',
    pruebas:[P('calcula(2)','10'),P('calcula(0)','0')],ocultas:[P('calcula(7)','35'),P('calcula(-3)','-15')],
    idea:'Calcula dos cosas (n × 2 y n × 3) y súmalas.',primero:'Con n = 2: <code>2 * 2 + 2 * 3</code> = 4 + 6 = 10.',
    pasos:[['Doble y triple','n * 2 y n * 3','* multiplica.'],['Súmalos y devuelve','return n * 2 + n * 3','* va antes que +.']],gemelo:'saludo'}),
  // 2 · Variables y tipos
  T('a-entero','variables','Texto a número','Escribe <code>suma_textos(a, b)</code>: a y b llegan como texto (por ejemplo "12" y "30"); devuelve su <b>suma como número</b>.',{
    inicio:def('suma_textos(a, b)'),solucion:'def suma_textos(a, b):\n    return int(a) + int(b)\n',
    pruebas:[P('suma_textos("12", "30")','42'),P('suma_textos("0", "5")','5')],ocultas:[P('suma_textos("100", "-1")','99'),P('suma_textos("7", "7")','14')],
    idea:'Los textos no se suman (se pegan): primero conviértelos a número con int().',primero:'Con a = "12": <code>int("12")</code> → 12; con b = "30": 30; 12 + 30 = 42.',
    pasos:[['Convierte cada uno','int(a), int(b)','Ahora son enteros.'],['Suma y devuelve','return int(a) + int(b)','Ya suma de verdad.']],gemelo:'precio-texto'}),
  T('precio-texto','variables','Precio con decimales','Escribe <code>total(precio, cantidad)</code>: precio llega como texto con decimales ("19.50") y cantidad como entero; devuelve precio × cantidad (número).',{
    inicio:def('total(precio, cantidad)'),solucion:'def total(precio, cantidad):\n    return float(precio) * cantidad\n',
    pruebas:[P('total("19.50", 2)','39.0'),P('total("10", 3)','30.0')],ocultas:[P('total("0.25", 4)','1.0'),P('total("99.99", 0)','0.0')],
    idea:'Con decimales se usa float(), no int().',primero:'Con precio = "19.50": <code>float("19.50")</code> → 19.5; × 2 = 39.0.',
    pasos:[['Convierte con float','float(precio)','int("19.50") daría ValueError.'],['Multiplica y devuelve','return float(precio) * cantidad','Resultado float.']],gemelo:'a-entero'}),
  T('describir-tipo','variables','¿De qué tipo es?','Escribe <code>tipo(x)</code> que devuelva <code>"entero"</code>, <code>"decimal"</code>, <code>"texto"</code> o <code>"otro"</code> según el tipo de x.',{
    inicio:def('tipo(x)'),solucion:'def tipo(x):\n    if type(x) == int:\n        return "entero"\n    if type(x) == float:\n        return "decimal"\n    if type(x) == str:\n        return "texto"\n    return "otro"\n',
    pruebas:[P('tipo(5)',"'entero'"),P('tipo("5")',"'texto'")],ocultas:[P('tipo(2.5)',"'decimal'"),P('tipo(True)',"'otro'"),P('tipo([1])',"'otro'")],
    idea:'type(x) dice el tipo; compáralo con int, float y str en orden.',primero:'Con x = 5: <code>type(5) == int</code> es True → devuelve "entero".',
    pasos:[['Pregunta por cada tipo','if type(x) == int: …','type(True) es bool, no int.'],['Si no es ninguno','return "otro"','Al final.']],gemelo:'a-entero'}),
  // 3 · Operadores
  T('cambio-billetes','operadores','Billetes de 100','Escribe <code>billetes(monto)</code> que devuelva cuántos billetes de 100 caben en monto y cuánto sobra, como tupla: <code>billetes(350)</code> → <code>(3, 50)</code>.',{
    inicio:def('billetes(monto)'),solucion:'def billetes(monto):\n    return monto // 100, monto % 100\n',
    pruebas:[P('billetes(350)','(3, 50)'),P('billetes(99)','(0, 99)')],ocultas:[P('billetes(1000)','(10, 0)'),P('billetes(101)','(1, 1)')],
    idea:'«Cuántos caben» es división entera (//) y «cuánto sobra» es el residuo (%).',primero:'Con monto = 350: <code>350 // 100</code> = 3 y <code>350 % 100</code> = 50.',
    pasos:[['División entera y residuo','monto // 100, monto % 100','// sin decimales; % lo que sobra.'],['Devuelve los dos','return monto // 100, monto % 100','Con coma forma una tupla.']],gemelo:'horas-minutos'}),
  T('horas-minutos','operadores','Minutos a horas','Escribe <code>convertir(minutos)</code> que devuelva el texto <code>"H h M min"</code>: <code>convertir(135)</code> → <code>"2 h 15 min"</code>.',{
    inicio:def('convertir(minutos)'),solucion:'def convertir(minutos):\n    return f"{minutos // 60} h {minutos % 60} min"\n',
    pruebas:[P('convertir(135)',"'2 h 15 min'"),P('convertir(60)',"'1 h 0 min'")],ocultas:[P('convertir(5)',"'0 h 5 min'"),P('convertir(600)',"'10 h 0 min'")],
    idea:'Horas = minutos // 60; minutos que sobran = minutos % 60. Luego arma el texto con una f-string.',primero:'Con 135: <code>135 // 60</code> = 2 y <code>135 % 60</code> = 15 → "2 h 15 min".',
    pasos:[['Calcula horas y minutos','minutos // 60 y minutos % 60','Como en los billetes.'],['Arma el texto','f"{minutos // 60} h {minutos % 60} min"','Respeta los espacios.']],gemelo:'cambio-billetes'}),
  T('precio-iva','operadores','Precio con IVA','Escribe <code>con_iva(precio)</code> que devuelva el precio más 16 % de IVA, <b>redondeado a 2 decimales</b>.',{
    inicio:def('con_iva(precio)'),solucion:'def con_iva(precio):\n    return round(precio * 1.16, 2)\n',
    pruebas:[P('con_iva(100)','116.0'),P('con_iva(19.99)','23.19')],ocultas:[P('con_iva(0)','0.0'),P('con_iva(250)','290.0')],
    idea:'Sumar 16 % es multiplicar por 1.16; luego round(…, 2).',primero:'Con 19.99: <code>19.99 * 1.16</code> = 23.1884 → <code>round(23.1884, 2)</code> = 23.19.',
    pasos:[['Multiplica por 1.16','precio * 1.16','100 % + 16 %.'],['Redondea','round(precio * 1.16, 2)','2 decimales.']],gemelo:'cambio-billetes'}),
  // 4 · Condicionales
  T('calificacion','condicionales','Letra de la calificación','Escribe <code>letra(nota)</code>: 90 o más → "A"; 80 a 89 → "B"; 70 a 79 → "C"; menos de 70 → "R".',{
    inicio:def('letra(nota)'),solucion:'def letra(nota):\n    if nota >= 90:\n        return "A"\n    elif nota >= 80:\n        return "B"\n    elif nota >= 70:\n        return "C"\n    else:\n        return "R"\n',
    pruebas:[P('letra(95)',"'A'"),P('letra(70)',"'C'")],ocultas:[P('letra(90)',"'A'"),P('letra(89)',"'B'"),P('letra(69)',"'R'"),P('letra(0)',"'R'")],
    idea:'Revisa de la nota más alta a la más baja: la primera condición que se cumpla decide.',primero:'Con nota = 85: <code>85 >= 90</code> es False; <code>85 >= 80</code> es True → "B".',
    pasos:[['De mayor a menor','if nota >= 90 … elif nota >= 80 … elif nota >= 70','El orden importa.'],['Lo demás','else: return "R"','Menos de 70.']],gemelo:'tarifa-edad'}),
  T('tarifa-edad','condicionales','Tarifa del cine','Escribe <code>tarifa(edad)</code>: menores de 12 pagan 50; de 12 a 64, 90; de 65 en adelante, 45.',{
    inicio:def('tarifa(edad)'),solucion:'def tarifa(edad):\n    if edad < 12:\n        return 50\n    elif edad < 65:\n        return 90\n    return 45\n',
    pruebas:[P('tarifa(8)','50'),P('tarifa(30)','90')],ocultas:[P('tarifa(12)','90'),P('tarifa(64)','90'),P('tarifa(65)','45'),P('tarifa(0)','50')],
    idea:'Tres rangos: revisa en orden de menor a mayor edad.',primero:'Con edad = 12: <code>12 < 12</code> es False; <code>12 < 65</code> es True → 90.',
    pasos:[['Primer rango','if edad < 12: return 50','Menores de 12.'],['Segundo y tercero','elif edad < 65: return 90; si no, 45','65 ya es tercera edad.']],gemelo:'calificacion'}),
  T('bisiesto','condicionales','Año bisiesto','Escribe <code>bisiesto(anio)</code> que devuelva True si el año es bisiesto: divisible entre 4, excepto los divisibles entre 100 que no lo son entre 400.',{
    inicio:def('bisiesto(anio)'),solucion:'def bisiesto(anio):\n    return anio % 4 == 0 and (anio % 100 != 0 or anio % 400 == 0)\n',
    pruebas:[P('bisiesto(2024)','True'),P('bisiesto(2023)','False')],ocultas:[P('bisiesto(1900)','False'),P('bisiesto(2000)','True'),P('bisiesto(2100)','False')],
    idea:'Combina condiciones con and y or: divisible entre 4 Y (no entre 100 O sí entre 400).',primero:'Con 1900: <code>1900 % 4 == 0</code> True, pero <code>1900 % 100 != 0</code> False y <code>1900 % 400 == 0</code> False → False.',
    pasos:[['Divisible entre 4','anio % 4 == 0','Primera condición.'],['La excepción','anio % 100 != 0 or anio % 400 == 0','Los siglos solo si son divisibles entre 400.']],gemelo:'tarifa-edad'}),
  // 5 · Bucles
  T('suma-hasta','bucles','Suma de 1 a n','Escribe <code>suma_hasta(n)</code> que devuelva 1 + 2 + … + n usando un bucle.',{
    inicio:def('suma_hasta(n)'),solucion:'def suma_hasta(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n',
    pruebas:[P('suma_hasta(4)','10'),P('suma_hasta(1)','1')],ocultas:[P('suma_hasta(0)','0'),P('suma_hasta(100)','5050')],
    idea:'Un acumulador que empieza en 0 y suma cada número de 1 a n.',primero:'Con n = 4: <code>range(1, 5)</code> da 1, 2, 3, 4 → 0 + 1 + 2 + 3 + 4 = 10.',
    pasos:[['Acumulador','total = 0','Antes del for.'],['Recorre 1 … n','for i in range(1, n + 1): total += i','range no incluye el final.'],['Devuelve','return total','Fuera del for.']],gemelo:'factorial'}),
  T('factorial','bucles','Factorial','Escribe <code>factorial(n)</code>: n! = 1 × 2 × … × n (y 0! = 1).',{
    inicio:def('factorial(n)'),solucion:'def factorial(n):\n    r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r\n',
    pruebas:[P('factorial(4)','24'),P('factorial(0)','1')],ocultas:[P('factorial(1)','1'),P('factorial(10)','3628800')],
    idea:'Como la suma, pero multiplicando: el acumulador empieza en 1.',primero:'Con n = 4: r = 1 → ×2 = 2 → ×3 = 6 → ×4 = 24.',
    pasos:[['Acumulador en 1','r = 1','Si empezara en 0, todo daría 0.'],['Multiplica','for i in range(2, n + 1): r *= i','Del 2 al n.'],['Devuelve','return r','0! = 1 sale solo.']],gemelo:'suma-hasta'}),
  T('cuenta-pares','bucles','Contar pares','Escribe <code>pares(v)</code> que devuelva cuántos números pares hay en la lista v.',{
    inicio:def('pares(v)'),solucion:'def pares(v):\n    c = 0\n    for x in v:\n        if x % 2 == 0:\n            c += 1\n    return c\n',
    pruebas:[P('pares([1, 2, 3, 4])','2'),P('pares([])','0')],ocultas:[P('pares([2, 4, 6])','3'),P('pares([1, 3, -5])','0'),P('pares([-2, 0])','2')],
    idea:'Recorre la lista y cuenta solo los que dan residuo 0 al dividir entre 2.',primero:'Con [1, 2, 3, 4]: 2 % 2 == 0 ✓ y 4 % 2 == 0 ✓ → 2.',
    pasos:[['Contador','c = 0','Antes del for.'],['Recorre y pregunta','for x in v: if x % 2 == 0: c += 1','El residuo dice si es par.'],['Devuelve','return c','Fuera del for.']],gemelo:'suma-hasta'}),
  // 6 · Listas
  T('mayor','listas','El mayor sin max()','Escribe <code>mayor(v)</code> que devuelva el número más grande de la lista (no vacía) <b>sin usar max()</b>.',{
    inicio:def('mayor(v)'),solucion:'def mayor(v):\n    m = v[0]\n    for x in v:\n        if x > m:\n            m = x\n    return m\n',
    pruebas:[P('mayor([3, 9, 2])','9'),P('mayor([5])','5')],ocultas:[P('mayor([-4, -2, -9])','-2'),P('mayor([1, 1, 1])','1')],
    idea:'Supón que el primero es el mayor y compáralo con cada uno; si encuentras uno más grande, ese pasa a ser el mayor.',primero:'Con [3, 9, 2]: m = 3; 9 > 3 → m = 9; 2 > 9 no → 9.',
    pasos:[['Candidato inicial','m = v[0]','No 0: la lista puede tener negativos.'],['Compara con cada uno','for x in v: if x > m: m = x','Se queda con el mayor.'],['Devuelve','return m','Al final.']],gemelo:'sin-repetidos'}),
  T('sin-repetidos','listas','Quitar repetidos en orden','Escribe <code>unicos(v)</code> que devuelva una lista con los elementos de v sin repetir, <b>en el orden en que aparecen</b>.',{
    inicio:def('unicos(v)'),solucion:'def unicos(v):\n    r = []\n    for x in v:\n        if x not in r:\n            r.append(x)\n    return r\n',
    pruebas:[P('unicos([3, 1, 3, 2, 1])','[3, 1, 2]'),P('unicos([])','[]')],ocultas:[P('unicos([1, 1, 1])','[1]'),P('unicos(["a", "b", "a"])',"['a', 'b']")],
    idea:'Arma una lista nueva y agrega cada elemento solo si todavía no está.',primero:'Con [3, 1, 3, 2, 1]: 3 → [3]; 1 → [3, 1]; 3 ya está; 2 → [3, 1, 2]; 1 ya está.',
    pasos:[['Lista resultado','r = []','Vacía.'],['Agrega si no está','for x in v: if x not in r: r.append(x)','in pregunta si ya está.'],['Devuelve','return r','set() no respeta el orden.']],gemelo:'mayor'}),
  T('promedio-sin-extremos','listas','Promedio sin extremos','Escribe <code>promedio_justo(v)</code>: quita el valor más alto y el más bajo (uno de cada) y devuelve el promedio del resto. La lista tiene al menos 3 números.',{
    inicio:def('promedio_justo(v)'),solucion:'def promedio_justo(v):\n    s = sorted(v)[1:-1]\n    return sum(s) / len(s)\n',
    pruebas:[P('promedio_justo([10, 8, 2, 9])','8.5'),P('promedio_justo([5, 5, 5])','5.0')],ocultas:[P('promedio_justo([1, 100, 50, 50, 0])','33.666666666666664'),P('promedio_justo([3, 1, 2])','2.0')],
    idea:'Ordena la lista y toma la rebanada que quita el primero y el último.',primero:'Con [10, 8, 2, 9]: <code>sorted</code> → [2, 8, 9, 10]; <code>[1:-1]</code> → [8, 9]; promedio 8.5.',
    pasos:[['Ordena y rebana','sorted(v)[1:-1]','Sin el menor ni el mayor.'],['Promedia','sum(s) / len(s)','Suma entre cantidad.']],gemelo:'mayor'}),
  // 7 · Diccionarios y conjuntos
  T('contar-palabras','diccionarios','Contar palabras','Escribe <code>conteo(texto)</code> que devuelva un diccionario con cuántas veces aparece cada palabra (separadas por espacios).',{
    inicio:def('conteo(texto)'),solucion:'def conteo(texto):\n    d = {}\n    for p in texto.split():\n        d[p] = d.get(p, 0) + 1\n    return d\n',
    pruebas:[P('conteo("sol mar sol")',"{'sol': 2, 'mar': 1}"),P('conteo("")','{}')],ocultas:[P('conteo("a a a")',"{'a': 3}"),P('conteo("uno dos tres")',"{'uno': 1, 'dos': 1, 'tres': 1}")],
    idea:'Corta el texto en palabras y, para cada una, súmale 1 a su cuenta en el diccionario (empezando en 0).',primero:'Con "sol mar sol": split → ["sol", "mar", "sol"]; d["sol"] = 0 + 1, d["mar"] = 1, d["sol"] = 1 + 1 = 2.',
    pasos:[['Palabras','texto.split()','Corta por espacios.'],['Cuenta con get','d[p] = d.get(p, 0) + 1','get evita el KeyError la primera vez.'],['Devuelve','return d','El diccionario.']],gemelo:'inventario'}),
  T('inventario','diccionarios','Actualizar inventario','Escribe <code>vender(stock, producto, cantidad)</code>: si hay suficiente, resta la cantidad del stock y devuelve True; si no (o no existe el producto), no cambia nada y devuelve False.',{
    inicio:def('vender(stock, producto, cantidad)'),solucion:'def vender(stock, producto, cantidad):\n    if stock.get(producto, 0) >= cantidad:\n        stock[producto] -= cantidad\n        return True\n    return False\n',
    pruebas:[P('vender({"pan": 5}, "pan", 2)','True'),P('vender({"pan": 1}, "pan", 2)','False')],ocultas:[P('vender({}, "leche", 1)','False'),P('(lambda s: (vender(s, "pan", 5), s["pan"]))({"pan": 5})','(True, 0)'),P('(lambda s: (vender(s, "pan", 9), s["pan"]))({"pan": 5})','(False, 5)')],
    idea:'Mira cuánto hay (0 si no existe); si alcanza, resta y di True.',primero:'Con stock = {"pan": 5}, vender 2: <code>stock.get("pan", 0)</code> = 5 ≥ 2 → stock["pan"] = 3 y True.',
    pasos:[['¿Alcanza?','stock.get(producto, 0) >= cantidad','get da 0 si no existe.'],['Resta y confirma','stock[producto] -= cantidad; return True','Cambia el diccionario.'],['Si no','return False','Sin tocar nada.']],gemelo:'contar-palabras'}),
  T('comunes','diccionarios','Alumnos en común','Escribe <code>en_ambos(a, b)</code>: a y b son listas de nombres; devuelve la lista <b>ordenada</b> de los que están en las dos.',{
    inicio:def('en_ambos(a, b)'),solucion:'def en_ambos(a, b):\n    return sorted(set(a) & set(b))\n',
    pruebas:[P('en_ambos(["Ana", "Luis"], ["Luis", "Eva"])',"['Luis']"),P('en_ambos([], ["Eva"])','[]')],ocultas:[P('en_ambos(["b", "a", "c"], ["c", "a"])',"['a', 'c']"),P('en_ambos(["x", "x"], ["x"])',"['x']")],
    idea:'Convierte las dos listas en conjuntos y usa la intersección (&); luego ordénala.',primero:'Con ["Ana", "Luis"] y ["Luis", "Eva"]: <code>{"Ana", "Luis"} & {"Luis", "Eva"}</code> = {"Luis"} → ["Luis"].',
    pasos:[['Conjuntos','set(a) & set(b)','& = los que están en los dos.'],['Ordena','sorted(...)','Devuelve una lista ordenada.']],gemelo:'contar-palabras'}),
  // 8 · Funciones
  T('es-primo','funciones','¿Es primo?','Escribe <code>es_primo(n)</code> que devuelva True si n es primo (solo divisible entre 1 y sí mismo; 0 y 1 no son primos).',{
    inicio:def('es_primo(n)'),solucion:'def es_primo(n):\n    if n < 2:\n        return False\n    for d in range(2, int(n ** 0.5) + 1):\n        if n % d == 0:\n            return False\n    return True\n',
    pruebas:[P('es_primo(7)','True'),P('es_primo(9)','False')],ocultas:[P('es_primo(1)','False'),P('es_primo(2)','True'),P('es_primo(97)','True'),P('es_primo(100)','False')],
    idea:'Prueba si algún número entre 2 y la raíz de n lo divide; si alguno lo divide, no es primo.',primero:'Con n = 9: prueba d = 2 (9 % 2 = 1) y d = 3 (9 % 3 = 0) → no es primo.',
    pasos:[['Casos pequeños','if n < 2: return False','0 y 1 no son primos.'],['Busca un divisor','for d in range(2, int(n ** 0.5) + 1): if n % d == 0: return False','Basta llegar a la raíz.'],['Si no hubo','return True','Después del for.']],gemelo:'mcd'}),
  T('mcd','funciones','Máximo común divisor','Escribe <code>mcd(a, b)</code> con el algoritmo de Euclides: mientras b no sea 0, (a, b) pasa a ser (b, a % b); al final, a es el MCD.',{
    inicio:def('mcd(a, b)'),solucion:'def mcd(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n',
    pruebas:[P('mcd(12, 18)','6'),P('mcd(7, 5)','1')],ocultas:[P('mcd(100, 10)','10'),P('mcd(0, 9)','9'),P('mcd(48, 36)','12')],
    idea:'Repite el reemplazo (a, b) → (b, a % b) hasta que b sea 0.',primero:'Con 12 y 18: (12, 18) → (18, 12) → (12, 6) → (6, 0) → 6.',
    pasos:[['Bucle','while b != 0:','Mientras quede residuo.'],['Reemplazo simultáneo','a, b = b, a % b','Con tupla, sin variable extra.'],['Devuelve','return a','Cuando b llega a 0.']],gemelo:'es-primo'}),
  T('aplicar-descuento','funciones','Descuento por defecto','Escribe <code>precio_final(precio, descuento=0.1)</code> que devuelva el precio con el descuento aplicado, redondeado a 2 decimales. Si no se pasa descuento, es 10 %.',{
    inicio:'def precio_final(precio):\n    # agrega el parámetro descuento con valor por defecto\n    pass\n',solucion:'def precio_final(precio, descuento=0.1):\n    return round(precio * (1 - descuento), 2)\n',
    pruebas:[P('precio_final(100)','90.0'),P('precio_final(100, 0.25)','75.0')],ocultas:[P('precio_final(59.9, 0)','59.9'),P('precio_final(80, descuento=0.5)','40.0')],
    idea:'Un parámetro con valor por defecto se escribe descuento=0.1 en el def.',primero:'Con 100 y sin descuento: <code>100 * (1 - 0.1)</code> = 90.0.',
    pasos:[['Firma','def precio_final(precio, descuento=0.1):','El default va después.'],['Cuenta','round(precio * (1 - descuento), 2)','Lo que queda tras el descuento.']],gemelo:'mcd'}),
  // 9 · Cadenas
  T('iniciales','cadenas','Iniciales','Escribe <code>iniciales(nombre)</code> que devuelva las iniciales en mayúscula: <code>iniciales("ana maría lópez")</code> → <code>"AML"</code>.',{
    inicio:def('iniciales(nombre)'),solucion:'def iniciales(nombre):\n    return "".join(p[0].upper() for p in nombre.split())\n',
    pruebas:[P('iniciales("ana maría lópez")',"'AML'"),P('iniciales("Luis")',"'L'")],ocultas:[P('iniciales("  eva   díaz ")',"'ED'"),P('iniciales("")',"''")],
    idea:'Corta en palabras, toma la primera letra de cada una en mayúscula y júntalas.',primero:'Con "ana maría lópez": split → ["ana", "maría", "lópez"]; primeras letras a, m, l → "AML".',
    pasos:[['Palabras','nombre.split()','split() también quita espacios extra.'],['Primera letra en mayúscula','p[0].upper()','De cada palabra.'],['Une','"".join(...)','Sin separador.']],gemelo:'contar-vocales'}),
  T('contar-vocales','cadenas','Contar vocales','Escribe <code>vocales(t)</code> que devuelva cuántas vocales (a, e, i, o, u, con o sin acento, mayúsculas o minúsculas) tiene el texto.',{
    inicio:def('vocales(t)'),solucion:'def vocales(t):\n    return sum(1 for c in t.lower() if c in "aeiouáéíóú")\n',
    pruebas:[P('vocales("Hola")','2'),P('vocales("xyz")','0')],ocultas:[P('vocales("Canción ÁRBOL")','5'),P('vocales("")','0')],
    idea:'Pasa todo a minúsculas y cuenta los caracteres que están en "aeiouáéíóú".',primero:'Con "Hola": lower → "hola"; o ✓ y a ✓ → 2.',
    pasos:[['Minúsculas','t.lower()','Así no importa si son mayúsculas.'],['Cuenta','sum(1 for c in … if c in "aeiouáéíóú")','O un for con contador.']],gemelo:'iniciales'}),
  T('palindromo','cadenas','¿Palíndromo?','Escribe <code>palindromo(t)</code> que devuelva True si el texto se lee igual al revés, sin contar espacios ni mayúsculas: "Anita lava la tina" → True.',{
    inicio:def('palindromo(t)'),solucion:'def palindromo(t):\n    s = t.replace(" ", "").lower()\n    return s == s[::-1]\n',
    pruebas:[P('palindromo("Anita lava la tina")','True'),P('palindromo("hola")','False')],ocultas:[P('palindromo("oso")','True'),P('palindromo("")','True'),P('palindromo("Ab")','False')],
    idea:'Limpia el texto (sin espacios, en minúsculas) y compáralo con su versión al revés.',primero:'Con "Anita lava la tina": limpio → "anitalavalatina"; al revés es igual → True.',
    pasos:[['Limpia','t.replace(" ", "").lower()','Quita espacios y mayúsculas.'],['Compara con el reverso','s == s[::-1]','[::-1] invierte.']],gemelo:'iniciales'}),
  // 10 · Excepciones
  T('division-segura','excepciones','División segura','Escribe <code>dividir(a, b)</code> que devuelva a / b; si b es 0, devuelve <code>None</code> en vez de fallar (usa try/except).',{
    inicio:def('dividir(a, b)'),solucion:'def dividir(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n',
    pruebas:[P('dividir(10, 4)','2.5'),P('dividir(1, 0)','None')],ocultas:[P('dividir(0, 5)','0.0'),P('dividir(-9, 3)','-3.0')],
    idea:'Pon la división dentro de try y atrapa ZeroDivisionError.',primero:'Con 1 y 0: <code>1 / 0</code> lanza ZeroDivisionError → el except devuelve None.',
    pasos:[['Intenta','try: return a / b','Lo que puede fallar.'],['Atrapa','except ZeroDivisionError: return None','Solo ese error.']],gemelo:'a-numero'}),
  T('a-numero','excepciones','Leer un número con cuidado','Escribe <code>a_numero(texto)</code> que devuelva el texto convertido a float; si no se puede, devuelve 0.0.',{
    inicio:def('a_numero(texto)'),solucion:'def a_numero(texto):\n    try:\n        return float(texto)\n    except ValueError:\n        return 0.0\n',
    pruebas:[P('a_numero("3.5")','3.5'),P('a_numero("hola")','0.0')],ocultas:[P('a_numero("10")','10.0'),P('a_numero("")','0.0'),P('a_numero("-2.25")','-2.25')],
    idea:'float() lanza ValueError si el texto no es un número: atrápalo.',primero:'Con "hola": <code>float("hola")</code> → ValueError → el except devuelve 0.0.',
    pasos:[['Intenta convertir','try: return float(texto)','Puede fallar.'],['Valor por defecto','except ValueError: return 0.0','Para textos inválidos.']],gemelo:'division-segura'}),
  T('suma-valida','excepciones','Sumar lo que se pueda','Escribe <code>suma_valida(v)</code>: v es una lista de textos; suma los que se pueden convertir a entero y devuelve la tupla (suma, cuántos fallaron).',{
    inicio:def('suma_valida(v)'),solucion:'def suma_valida(v):\n    s = 0\n    malos = 0\n    for t in v:\n        try:\n            s += int(t)\n        except ValueError:\n            malos += 1\n    return s, malos\n',
    pruebas:[P('suma_valida(["5", "x", "3"])','(8, 1)'),P('suma_valida([])','(0, 0)')],ocultas:[P('suma_valida(["2.5", "1"])','(1, 1)'),P('suma_valida(["a", "b"])','(0, 2)')],
    idea:'Recorre la lista; dentro del for, intenta convertir cada uno; si falla, cuéntalo y sigue.',primero:'Con ["5", "x", "3"]: 5 ✓, "x" ✗ (malos = 1), 3 ✓ → (8, 1).',
    pasos:[['Dos acumuladores','s = 0; malos = 0','Suma y fallos.'],['try dentro del for','try: s += int(t) except ValueError: malos += 1','Un error no detiene a los demás.'],['Devuelve los dos','return s, malos','Tupla.']],gemelo:'a-numero'}),
  // 11 · Archivos y módulos
  T('contar-lineas','archivos','Contar líneas de un archivo','Escribe <code>lineas(nombre)</code> que devuelva cuántas líneas tiene el archivo de texto. (Ya existe <code>datos.txt</code> con 3 líneas).',{
    preparar:'with open("datos.txt", "w") as __f:\n    __f.write("uno\\ndos\\ntres\\n")\nwith open("vacio.txt", "w") as __f:\n    pass\n',
    inicio:def('lineas(nombre)'),solucion:'def lineas(nombre):\n    with open(nombre) as f:\n        return len(f.readlines())\n',
    pruebas:[P('lineas("datos.txt")','3')],ocultas:[P('lineas("vacio.txt")','0')],
    idea:'Abre el archivo con with open(nombre) y cuenta lo que devuelve readlines().',primero:'Con "datos.txt": readlines() → ["uno\\n", "dos\\n", "tres\\n"] → len = 3.',
    pasos:[['Abre para leer','with open(nombre) as f:','Modo "r" por defecto.'],['Cuenta','return len(f.readlines())','Una entrada por línea.']],gemelo:'guardar-lista'}),
  T('guardar-lista','archivos','Guardar una lista','Escribe <code>guardar(nombre, v)</code> que escriba cada elemento de v en una línea del archivo y devuelva cuántas líneas escribió.',{
    inicio:def('guardar(nombre, v)'),solucion:'def guardar(nombre, v):\n    with open(nombre, "w") as f:\n        for x in v:\n            f.write(str(x) + "\\n")\n    return len(v)\n',
    pruebas:[P('guardar("a.txt", [1, 2, 3])','3'),P('(guardar("b.txt", ["x", "y"]), open("b.txt").read())',"(2, 'x\\ny\\n')")],ocultas:[P('(guardar("c.txt", []), open("c.txt").read())',"(0, '')")],
    idea:'Abre en modo "w" y escribe cada elemento seguido de "\\n".',primero:'Con [1, 2, 3]: escribe "1\\n", "2\\n" y "3\\n" → 3 líneas.',
    pasos:[['Abre para escribir','with open(nombre, "w") as f:','"w" crea o vacía.'],['Una línea por elemento','f.write(str(x) + "\\n")','str() por si son números.'],['Devuelve cuántas','return len(v)','Fuera del with.']],gemelo:'contar-lineas'}),
  T('raiz-redondeada','archivos','Usar el módulo math','Escribe <code>hipotenusa(a, b)</code> que use <code>math.sqrt</code> para devolver la hipotenusa redondeada a 2 decimales.',{
    inicio:'import math\n\n'+def('hipotenusa(a, b)'),solucion:'import math\n\ndef hipotenusa(a, b):\n    return round(math.sqrt(a ** 2 + b ** 2), 2)\n',
    pruebas:[P('hipotenusa(3, 4)','5.0'),P('hipotenusa(1, 1)','1.41')],ocultas:[P('hipotenusa(5, 12)','13.0'),P('hipotenusa(2, 3)','3.61')],
    idea:'Pitágoras: raíz de (a² + b²). La raíz está en math.sqrt.',primero:'Con 3 y 4: <code>3 ** 2 + 4 ** 2</code> = 25 → <code>math.sqrt(25)</code> = 5.0.',
    pasos:[['Suma de cuadrados','a ** 2 + b ** 2','** es potencia.'],['Raíz y redondeo','round(math.sqrt(…), 2)','math ya está importado.']],gemelo:'contar-lineas'}),
  // 12 · Clases
  T('clase-rectangulo','clases','Clase Rectángulo','Escribe la clase <code>Rectangulo</code> con <code>__init__(self, base, altura)</code> y los métodos <code>area()</code> y <code>perimetro()</code>.',{
    inicio:'class Rectangulo:\n    def __init__(self, base, altura):\n        pass\n',solucion:'class Rectangulo:\n    def __init__(self, base, altura):\n        self.base = base\n        self.altura = altura\n    def area(self):\n        return self.base * self.altura\n    def perimetro(self):\n        return 2 * (self.base + self.altura)\n',
    pruebas:[P('Rectangulo(3, 4).area()','12'),P('Rectangulo(3, 4).perimetro()','14')],ocultas:[P('Rectangulo(1, 1).area()','1'),P('Rectangulo(0, 5).perimetro()','10')],
    idea:'Guarda base y altura en self dentro de __init__; los métodos los leen con self.',primero:'Con Rectangulo(3, 4): self.base = 3, self.altura = 4 → area = 3 * 4 = 12.',
    pasos:[['Guarda los datos','self.base = base; self.altura = altura','En __init__.'],['Métodos','def area(self): return self.base * self.altura','Y perimetro = 2 × (base + altura).']],gemelo:'clase-cuenta'}),
  T('clase-cuenta','clases','Clase Cuenta bancaria','Escribe la clase <code>Cuenta</code> con saldo inicial, <code>depositar(monto)</code> y <code>retirar(monto)</code> (si no alcanza, no retira y devuelve False; si retira, devuelve True). El saldo se lee en <code>.saldo</code>.',{
    inicio:'class Cuenta:\n    def __init__(self, saldo):\n        pass\n',solucion:'class Cuenta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n    def depositar(self, monto):\n        self.saldo += monto\n    def retirar(self, monto):\n        if monto > self.saldo:\n            return False\n        self.saldo -= monto\n        return True\n',
    pruebas:[P('(lambda c: (c.depositar(50), c.saldo))(Cuenta(100))','(None, 150)'),P('Cuenta(10).retirar(20)','False')],ocultas:[P('(lambda c: (c.retirar(30), c.saldo))(Cuenta(100))','(True, 70)'),P('(lambda c: (c.retirar(200), c.saldo))(Cuenta(100))','(False, 100)')],
    idea:'El saldo vive en self.saldo; depositar suma y retirar revisa antes de restar.',primero:'Con Cuenta(100) y depositar(50): self.saldo = 100 + 50 = 150.',
    pasos:[['Guarda el saldo','self.saldo = saldo','En __init__.'],['depositar','self.saldo += monto','Cambia el estado.'],['retirar con revisión','if monto > self.saldo: return False … return True','No deja saldo negativo.']],gemelo:'clase-rectangulo'}),
  T('clase-estudiante','clases','Herencia: Estudiante','Ya existe la clase <code>Persona</code> (con <code>self.nombre</code>). Escribe <code>Estudiante(Persona)</code> con un método <code>presentarse()</code> que devuelva <code>"Soy &lt;nombre&gt; y estudio"</code>.',{
    preparar:'class Persona:\n    def __init__(self, nombre):\n        self.nombre = nombre\n',
    inicio:'class Estudiante(Persona):\n    pass\n',solucion:'class Estudiante(Persona):\n    def presentarse(self):\n        return "Soy " + self.nombre + " y estudio"\n',
    pruebas:[P('Estudiante("Ana").presentarse()',"'Soy Ana y estudio'")],ocultas:[P('Estudiante("Luis").presentarse()',"'Soy Luis y estudio'"),P('Estudiante("Eva").nombre',"'Eva'")],
    idea:'Estudiante hereda __init__ de Persona (ya guarda el nombre); solo agrega el método.',primero:'Con Estudiante("Ana"): self.nombre = "Ana" (heredado) → "Soy " + "Ana" + " y estudio".',
    pasos:[['Hereda','class Estudiante(Persona):','Tiene nombre sin escribir __init__.'],['Método nuevo','def presentarse(self): return "Soy " + self.nombre + " y estudio"','Usa el dato heredado.']],gemelo:'clase-cuenta'}),
  // 13 · Proyectos
  T('calculadora','proyectos','Calculadora','Escribe <code>calcular(a, op, b)</code> para op en "+", "-", "*" y "/". Si op no es válida o se divide entre 0, devuelve <code>None</code>.',{
    inicio:def('calcular(a, op, b)'),solucion:'def calcular(a, op, b):\n    if op == "+":\n        return a + b\n    if op == "-":\n        return a - b\n    if op == "*":\n        return a * b\n    if op == "/" and b != 0:\n        return a / b\n    return None\n',
    pruebas:[P('calcular(2, "+", 3)','5'),P('calcular(7, "/", 2)','3.5')],ocultas:[P('calcular(5, "/", 0)','None'),P('calcular(4, "%", 2)','None'),P('calcular(3, "*", -2)','-6'),P('calcular(1, "-", 9)','-8')],
    idea:'Un if por operación; la división solo si b no es 0; si nada aplica, None.',primero:'Con (7, "/", 2): op == "/" y 2 != 0 → 7 / 2 = 3.5.',
    pasos:[['Un caso por operación','if op == "+": return a + b …','return termina en cuanto acierta.'],['Cuida la división','if op == "/" and b != 0','Evita ZeroDivisionError.'],['Lo demás','return None','Operación inválida.']],gemelo:'adivina'}),
  T('adivina','proyectos','Juego de adivinar','Escribe <code>pistas(secreto, intentos)</code> que devuelva una lista con "más alto", "más bajo" o "¡adivinaste!" para cada intento, y se detenga al adivinar.',{
    inicio:def('pistas(secreto, intentos)'),solucion:'def pistas(secreto, intentos):\n    r = []\n    for i in intentos:\n        if i < secreto:\n            r.append("más alto")\n        elif i > secreto:\n            r.append("más bajo")\n        else:\n            r.append("¡adivinaste!")\n            break\n    return r\n',
    pruebas:[P('pistas(7, [5, 9, 7])',"['más alto', 'más bajo', '¡adivinaste!']")],ocultas:[P('pistas(3, [3, 1])',"['¡adivinaste!']"),P('pistas(10, [1, 2])',"['más alto', 'más alto']"),P('pistas(5, [])','[]')],
    idea:'Recorre los intentos y compara cada uno con el secreto; al acertar, agrega el mensaje y sal con break.',primero:'Con secreto 7 e intentos [5, 9, 7]: 5 < 7 → "más alto"; 9 > 7 → "más bajo"; 7 → "¡adivinaste!" y break.',
    pasos:[['Lista de respuestas','r = []','Una por intento.'],['Compara','if i < secreto … elif i > secreto … else','Tres casos.'],['Detente al acertar','break','Lo que sigue no se revisa.']],gemelo:'calculadora'}),
  T('reporte-notas','proyectos','Reporte de calificaciones','Escribe <code>reporte(notas)</code>: notas es un diccionario nombre → calificación. Devuelve la tupla (promedio redondeado a 1 decimal, nombre de la nota más alta, cuántos aprobaron con 70 o más).',{
    inicio:def('reporte(notas)'),solucion:'def reporte(notas):\n    prom = round(sum(notas.values()) / len(notas), 1)\n    mejor = max(notas, key=notas.get)\n    aprob = sum(1 for n in notas.values() if n >= 70)\n    return prom, mejor, aprob\n',
    pruebas:[P('reporte({"Ana": 90, "Luis": 60, "Eva": 75})',"(75.0, 'Ana', 2)")],ocultas:[P('reporte({"x": 70})',"(70.0, 'x', 1)"),P('reporte({"a": 50, "b": 55})',"(52.5, 'b', 0)")],
    idea:'Tres cálculos sobre los valores del diccionario: promedio, quién tiene el máximo y cuántos ≥ 70.',primero:'Con Ana 90, Luis 60, Eva 75: suma 225 / 3 = 75.0; el máximo es Ana; aprobados: Ana y Eva → 2.',
    pasos:[['Promedio','round(sum(notas.values()) / len(notas), 1)','values() da las calificaciones.'],['El mejor','max(notas, key=notas.get)','La clave con el valor más alto.'],['Aprobados','sum(1 for n in notas.values() if n >= 70)','Cuenta los que cumplen.']],gemelo:'calculadora'})
];
export const tarea=id=>LABORATORIO.find(t=>t.id===id)||null;
export const tareasDe=unidad=>LABORATORIO.filter(t=>t.unidad===unidad);
