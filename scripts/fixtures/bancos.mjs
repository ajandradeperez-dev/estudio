/* Bancos de ejemplo de "Mis materias" con el formato que genera la IA (ver src/nucleo/mias/esquema.js).
   npm run revisar los valida sin llamar a la API: los tres válidos deben pasar y el inválido debe rechazarse.
   Las pruebas en el navegador los usan como respuestas simuladas de Claude. */
const P=(que,como,porque,ojo)=>({que,como,porque,...(ojo?{ojo}:{})});
const ej=(id,nivel,tipo,enunciado,respuesta,{errores=[],pasos,regla,pista,...resto})=>({id,nivel,tipo,enunciado,respuesta,errores,pasos,regla,pista,...resto});

const R_TRIG='(sin x)′ = cos x y (cos x)′ = −sin x; con algo adentro, multiplica por su derivada (regla de la cadena).';
export const trigonometricas={
  leccion:{
    idea:'Las derivadas del seno y el coseno se alternan: la del seno es el coseno y la del coseno es menos el seno. Si adentro hay algo distinto de x, se multiplica por la derivada de lo de adentro.',
    ejemplo:{enunciado:'Deriva \\(f(x) = 3\\sin x\\)',pasos:[P('Saca la constante','\\(f\'(x) = 3\\,(\\sin x)\'\\)','Las constantes multiplican a la derivada.'),P('Deriva el seno','\\(3\\cos x\\)','(sin x)′ = cos x.')]},
    hueco:{enunciado:'Deriva \\(g(x) = \\cos x\\)',pasos:[P('Recuerda la regla','\\((\\cos x)\' = ?\\)','El coseno se deriva en menos el seno.')],pregunta:'¿Cuál es \\(g\'(x)\\)?',respuesta:'-sin(x)',alternativas:['-sen(x)']}
  },
  ejercicios:[
    ej('e1',1,'expresion','Deriva \\(f(x) = \\sin x\\)','cos(x)',{errores:[{valor:'-cos(x)',por:'La derivada del seno es el coseno, sin signo menos.'}],pasos:[P('Identifica la función','seno de x','Es una derivada básica.'),P('Aplica la regla','\\(\\cos x\\)','(sin x)′ = cos x.')],regla:R_TRIG,pista:'Seno → coseno.'}),
    ej('e2',1,'expresion','Deriva \\(f(x) = \\cos x\\)','-sin(x)',{errores:[{valor:'sin(x)',por:'Falta el signo menos: (cos x)′ = −sin x.'}],pasos:[P('Identifica la función','coseno de x','Derivada básica.'),P('Aplica la regla','\\(-\\sin x\\)','(cos x)′ = −sin x.','No olvides el signo menos.')],regla:R_TRIG,pista:'Coseno → menos seno.'}),
    ej('e3',1,'expresion','Deriva \\(f(x) = 3\\sin x\\)','3*cos(x)',{errores:[{valor:'3*sin(x)',por:'Se deriva el seno: queda el coseno.'}],pasos:[P('Saca la constante','\\(3(\\sin x)\'\\)','Las constantes se quedan.'),P('Deriva','\\(3\\cos x\\)','(sin x)′ = cos x.')],regla:R_TRIG,pista:'La constante se queda.'}),
    ej('e4',1,'expresion','Deriva \\(f(x) = x^2 + \\sin x\\)','2*x+cos(x)',{errores:[{valor:'2*x-cos(x)',por:'La derivada del seno es +cos x.'}],pasos:[P('Deriva término a término','\\((x^2)\' + (\\sin x)\'\\)','La derivada de una suma es la suma de derivadas.'),P('Calcula cada una','\\(2x + \\cos x\\)','Potencia y seno.')],regla:R_TRIG,pista:'Término a término.'}),
    ej('e5',2,'expresion','Deriva \\(f(x) = \\sin(2x)\\)','2*cos(2*x)',{errores:[{valor:'cos(2*x)',por:'Falta multiplicar por la derivada de lo de adentro (2).'}],pasos:[P('Afuera y adentro','afuera seno, adentro \\(2x\\)','Regla de la cadena.'),P('Deriva y multiplica','\\(\\cos(2x)\\cdot 2\\)','Derivada de afuera por la de adentro.')],regla:R_TRIG,pista:'Regla de la cadena.'}),
    ej('e6',2,'expresion','Deriva \\(f(x) = \\cos(3x)\\)','-3*sin(3*x)',{errores:[{valor:'3*sin(3*x)',por:'Falta el signo menos del coseno.'},{valor:'-sin(3*x)',por:'Falta multiplicar por 3.'}],pasos:[P('Afuera y adentro','afuera coseno, adentro \\(3x\\)','Regla de la cadena.'),P('Deriva y multiplica','\\(-\\sin(3x)\\cdot 3\\)','(cos u)′ = −sin u · u′.')],regla:R_TRIG,pista:'Menos seno por 3.'}),
    ej('e7',2,'expresion','Deriva \\(f(x) = x\\sin x\\)','sin(x)+x*cos(x)',{errores:[{valor:'cos(x)',por:'Es un producto: usa (fg)′ = f′g + fg′.'}],pasos:[P('Es un producto','\\(f = x,\\ g = \\sin x\\)','Regla del producto.'),P('Aplica la regla','\\(1\\cdot\\sin x + x\\cos x\\)','f′g + fg′.')],regla:R_TRIG,pista:'Regla del producto.'}),
    ej('e8',2,'numero','Si \\(f(x) = \\sin x\\), ¿cuánto vale \\(f\'(0)\\)?','1',{errores:[{valor:'0',por:'Eso es sin(0); la derivada es cos(0) = 1.'}],pasos:[P('Deriva','\\(f\'(x) = \\cos x\\)','(sin x)′ = cos x.'),P('Evalúa','\\(\\cos 0 = 1\\)','El coseno de 0 es 1.')],regla:R_TRIG,pista:'Primero deriva, luego evalúa.'}),
    ej('e9',3,'expresion','Deriva \\(f(x) = \\sin^2 x\\)','2*sin(x)*cos(x)',{errores:[{valor:'2*sin(x)',por:'Falta multiplicar por la derivada del seno.'}],pasos:[P('Escríbelo como potencia','\\((\\sin x)^2\\)','Afuera el cuadrado, adentro el seno.'),P('Cadena','\\(2\\sin x\\cdot\\cos x\\)','Derivada de afuera por la de adentro.')],regla:R_TRIG,pista:'Es (sin x)².'}),
    ej('e10',3,'expresion','Deriva \\(f(x) = \\tan x\\)','1/cos(x)^2',{errores:[{valor:'-1/cos(x)^2',por:'La derivada de la tangente es positiva.'}],pasos:[P('Escribe la tangente','\\(\\tan x = \\dfrac{\\sin x}{\\cos x}\\)','Así se puede usar la regla del cociente.'),P('Cociente','\\(\\dfrac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\dfrac{1}{\\cos^2 x}\\)','sin² + cos² = 1.')],regla:R_TRIG,pista:'tan = sin/cos.'}),
    ej('e11',3,'numero','Si \\(f(x) = \\cos x\\), ¿cuánto vale \\(f\'(\\pi/2)\\)?','-1',{errores:[{valor:'0',por:'Eso es cos(π/2); la derivada es −sin(π/2) = −1.'}],pasos:[P('Deriva','\\(f\'(x) = -\\sin x\\)','(cos x)′ = −sin x.'),P('Evalúa','\\(-\\sin(\\pi/2) = -1\\)','sin(π/2) = 1.')],regla:R_TRIG,pista:'Deriva y evalúa.'}),
    ej('e12',1,'opcion','¿Cuál es la derivada de \\(\\sin x\\)?','cos x',{opciones:['cos x','-cos x','sin x'],correcta:0,pasos:[P('Recuerda la regla','(sin x)′','Derivada básica.'),P('Respuesta','cos x','El seno se deriva en coseno.')],regla:R_TRIG,pista:'Seno → coseno.'})
  ]
};

const R_IND='La guerra de Independencia de México empezó en 1810 (Grito de Dolores, Hidalgo) y se consumó en 1821 (Plan de Iguala y Tratados de Córdoba, Iturbide).';
export const independencia={
  leccion:{
    idea:'La Independencia de México tuvo tres momentos: el inicio (1810, Hidalgo), la resistencia (Morelos y Guerrero) y la consumación (1821, Iturbide y el Ejército Trigarante).',
    ejemplo:{enunciado:'¿Cuántos años duró la guerra de Independencia?',pasos:[P('Ubica el inicio','16 de septiembre de 1810','El Grito de Dolores marca el inicio.'),P('Ubica el final y resta','1821 − 1810 = 11 años','Se consumó con la entrada del Ejército Trigarante.')]},
    hueco:{enunciado:'¿Quién encabezó el Ejército Trigarante?',pasos:[P('Recuerda 1821','Plan de Iguala, firmado con Vicente Guerrero','Unió a insurgentes y realistas.')],pregunta:'¿Quién lo firmó del lado realista?',respuesta:'Agustín de Iturbide',alternativas:['Iturbide']}
  },
  ejercicios:[
    ej('e1',1,'numero','¿En qué año inició la guerra de Independencia de México?','1810',{errores:[{valor:'1821',por:'1821 es la consumación; el inicio fue en 1810.'}],pasos:[P('Recuerda el Grito','Dolores, Guanajuato','Hidalgo llamó a levantarse.'),P('Año','1810','El 16 de septiembre de 1810.')],regla:R_IND,pista:'El Grito de Dolores.'}),
    ej('e2',1,'numero','¿En qué año se consumó la Independencia?','1821',{errores:[{valor:'1810',por:'1810 es el inicio.'}],pasos:[P('Recuerda la consumación','Entrada del Ejército Trigarante','A la Ciudad de México.'),P('Año','1821','27 de septiembre de 1821.')],regla:R_IND,pista:'Once años después del inicio.'}),
    ej('e3',1,'texto','¿Quién dio el Grito de Dolores?','Miguel Hidalgo',{alternativas:['Hidalgo','Miguel Hidalgo y Costilla','Miguel Hidalgo y Costilla'],errores:[{valor:'Morelos',por:'Morelos continuó la lucha después de Hidalgo.'}],pasos:[P('Ubica el lugar','Dolores, 1810','Ahí comenzó el movimiento.'),P('Quién','el cura Miguel Hidalgo','Convocó al pueblo.')],regla:R_IND,pista:'Era el cura de Dolores.'}),
    ej('e4',2,'texto','¿Qué documento firmaron Iturbide y Guerrero en 1821?','Plan de Iguala',{alternativas:['el Plan de Iguala'],errores:[{valor:'Tratados de Córdoba',por:'Los Tratados de Córdoba los firmaron Iturbide y O\'Donojú.'}],pasos:[P('Recuerda la alianza','Iturbide (realista) y Guerrero (insurgente)','Se unieron en 1821.'),P('Documento','Plan de Iguala','Proclamó las Tres Garantías.')],regla:R_IND,pista:'Lleva el nombre de una ciudad de Guerrero.'}),
    ej('e5',2,'texto','¿Qué acuerdo firmaron Iturbide y el virrey O\'Donojú en 1821?','Tratados de Córdoba',{alternativas:['Tratado de Córdoba','los Tratados de Córdoba'],errores:[{valor:'Plan de Iguala',por:'El Plan de Iguala fue con Guerrero.'}],pasos:[P('Quiénes firmaron','Iturbide y O\'Donojú','El último virrey enviado de España.'),P('Documento','Tratados de Córdoba','Reconocían la independencia.')],regla:R_IND,pista:'Una ciudad de Veracruz.'}),
    ej('e6',2,'texto','¿Quién escribió los Sentimientos de la Nación?','José María Morelos',{alternativas:['Morelos','José María Morelos y Pavón'],errores:[{valor:'Hidalgo',por:'Hidalgo murió en 1811; el documento es de 1813.'}],pasos:[P('Ubica el año','1813, Congreso de Chilpancingo','Organizó el movimiento.'),P('Autor','Morelos','Continuó la lucha de Hidalgo.')],regla:R_IND,pista:'Lo presentó en Chilpancingo.'}),
    ej('e7',2,'numero','¿Cuántos años duró la guerra de Independencia (de 1810 a 1821)?','11',{errores:[{valor:'10',por:'1821 − 1810 = 11.'}],pasos:[P('Inicio y final','1810 y 1821','Grito y consumación.'),P('Resta','1821 − 1810 = 11','Años completos.')],regla:R_IND,pista:'Resta los años.'}),
    ej('e8',3,'texto','¿Cómo se llamó el ejército que unió a insurgentes y realistas en 1821?','Ejército Trigarante',{alternativas:['Trigarante','el Ejército Trigarante','Ejercito de las Tres Garantias'],errores:[{valor:'Ejército Insurgente',por:'El Trigarante unió a los dos bandos.'}],pasos:[P('Recuerda el Plan de Iguala','tres garantías','Religión, independencia y unión.'),P('Nombre','Trigarante','De las tres garantías.')],regla:R_IND,pista:'Por las tres garantías.'}),
    ej('e9',3,'texto','¿Quién fue el primer emperador de México (1822)?','Agustín de Iturbide',{alternativas:['Iturbide','Agustín I'],errores:[{valor:'Guerrero',por:'Vicente Guerrero fue presidente después (1829).'}],pasos:[P('Después de 1821','el Imperio Mexicano','Se coronó un emperador.'),P('Quién','Iturbide (Agustín I)','Había encabezado el Trigarante.')],regla:R_IND,pista:'Encabezó el Ejército Trigarante.'}),
    ej('e10',1,'opcion','¿Qué día se celebra el inicio de la Independencia?','16 de septiembre',{opciones:['16 de septiembre','5 de mayo','20 de noviembre'],correcta:0,pasos:[P('Recuerda el Grito','madrugada del 16 de septiembre de 1810','Inicio del movimiento.'),P('Respuesta','16 de septiembre','Fiesta nacional.')],regla:R_IND,pista:'Es en septiembre.'}),
    ej('e11',3,'texto','¿Qué virrey firmó los Tratados de Córdoba?','Juan O\'Donojú',{alternativas:['O\'Donojú','ODonojú','Juan ODonojú','O Donojú'],errores:[{valor:'Venegas',por:'Venegas era virrey en 1810.'}],pasos:[P('Recuerda Córdoba','1821','Iturbide negoció con el representante de España.'),P('Quién','Juan O\'Donojú','El último jefe político de la Nueva España.')],regla:R_IND,pista:'Su apellido lleva apóstrofo.'})
  ]
};

const R_MOL='Molaridad M = moles de soluto / litros de disolución; moles = gramos / masa molar; en una dilución M₁V₁ = M₂V₂.';
export const molaridad={
  leccion:{
    idea:'La molaridad dice cuántos moles de soluto hay en cada litro de disolución: M = n / V (en litros). Si te dan gramos, primero pásalos a moles con la masa molar.',
    ejemplo:{enunciado:'¿Cuál es la molaridad de 2 mol de soluto en 4 L?',pasos:[P('Escribe la fórmula','\\(M = \\dfrac{n}{V}\\)','Moles entre litros.'),P('Sustituye','\\(M = \\dfrac{2}{4} = 0.5\\ \\text{M}\\)','Divide.')]},
    hueco:{enunciado:'Se disuelven 0.3 mol en 0.6 L.',pasos:[P('Fórmula','\\(M = n/V\\)','Moles entre litros.')],pregunta:'¿Cuál es la molaridad?',respuesta:'0.5',alternativas:[]}
  },
  ejercicios:[
    ej('e1',1,'numero','0.5 mol de NaCl en 1 L de disolución. ¿Molaridad?','0.5',{errores:[{valor:'2',por:'Es n/V, no V/n.'}],pasos:[P('Fórmula','\\(M = n/V\\)','Definición.'),P('Calcula','\\(0.5/1 = 0.5\\)','Moles entre litros.')],regla:R_MOL,pista:'Moles entre litros.'}),
    ej('e2',1,'numero','2 mol en 4 L. ¿Molaridad?','0.5',{errores:[{valor:'8',por:'No se multiplica: se divide.'}],pasos:[P('Fórmula','\\(M = n/V\\)','Definición.'),P('Calcula','\\(2/4 = 0.5\\)','Divide.')],regla:R_MOL,pista:'Divide.'}),
    ej('e3',1,'numero','1 mol en 0.5 L. ¿Molaridad?','2',{errores:[{valor:'0.5',por:'Es n/V = 1/0.5 = 2.'}],pasos:[P('Fórmula','\\(M = n/V\\)','Definición.'),P('Calcula','\\(1/0.5 = 2\\)','Dividir entre 0.5 duplica.')],regla:R_MOL,pista:'Divide entre 0.5.'}),
    ej('e4',2,'numero','58.44 g de NaCl (58.44 g/mol) en 2 L. ¿Molaridad?','0.5',{errores:[{valor:'29.22',por:'Primero pasa los gramos a moles.'}],pasos:[P('Gramos a moles','\\(58.44/58.44 = 1\\) mol','n = m / masa molar.'),P('Molaridad','\\(1/2 = 0.5\\)','Moles entre litros.')],regla:R_MOL,pista:'Primero moles.'}),
    ej('e5',2,'numero','¿Cuántos moles hay en 250 mL de una disolución 2 M?','0.5',{errores:[{valor:'500',por:'Pasa los mL a litros: 0.25 L.'}],pasos:[P('mL a L','\\(250\\ \\text{mL} = 0.25\\ \\text{L}\\)','La molaridad usa litros.'),P('Despeja n','\\(n = M\\cdot V = 2\\cdot0.25 = 0.5\\)','n = M·V.')],regla:R_MOL,pista:'n = M·V en litros.'}),
    ej('e6',2,'numero','¿Qué volumen (en L) de disolución 1.5 M contiene 0.3 mol?','0.2',{errores:[{valor:'0.45',por:'V = n/M, no n·M.'}],pasos:[P('Despeja V','\\(V = n/M\\)','De M = n/V.'),P('Calcula','\\(0.3/1.5 = 0.2\\)','Litros.')],regla:R_MOL,pista:'V = n/M.'}),
    ej('e7',3,'numero','10 g de NaOH (40 g/mol) en 500 mL. ¿Molaridad?','0.5',{errores:[{valor:'0.25',por:'0.25 son los moles; falta dividir entre 0.5 L.'}],pasos:[P('Moles','\\(10/40 = 0.25\\) mol','n = m / masa molar.'),P('Molaridad','\\(0.25/0.5 = 0.5\\)','500 mL = 0.5 L.','No olvides pasar a litros.')],regla:R_MOL,pista:'Moles y luego litros.'}),
    ej('e8',3,'numero','Se diluyen 100 mL de HCl 2 M hasta 400 mL. ¿Nueva molaridad?','0.5',{errores:[{valor:'8',por:'Al diluir, la molaridad baja: M₂ = M₁V₁/V₂.'}],pasos:[P('Dilución','\\(M_1V_1 = M_2V_2\\)','Los moles no cambian.'),P('Despeja','\\(M_2 = \\dfrac{2\\cdot100}{400} = 0.5\\)','Mismo número de moles en más volumen.')],regla:R_MOL,pista:'M₁V₁ = M₂V₂.'}),
    ej('e9',3,'numero','¿Cuántos gramos de glucosa (180 g/mol) necesitas para 1 L de disolución 0.1 M?','18',{errores:[{valor:'1800',por:'Multiplica 0.1 mol por 180 g/mol: 18 g.'}],pasos:[P('Moles necesarios','\\(n = 0.1\\cdot1 = 0.1\\) mol','n = M·V.'),P('A gramos','\\(0.1\\cdot180 = 18\\) g','m = n · masa molar.')],regla:R_MOL,pista:'Moles × masa molar.'}),
    ej('e10',2,'numero','4.9 g de H₂SO₄ (98 g/mol) en 1 L. ¿Molaridad?','0.05',{tolerancia:0.001,errores:[{valor:'4.9',por:'Pasa los gramos a moles: 4.9/98.'}],pasos:[P('Moles','\\(4.9/98 = 0.05\\)','n = m / masa molar.'),P('Molaridad','\\(0.05/1 = 0.05\\)','En 1 L.')],regla:R_MOL,pista:'Divide entre 98.'}),
    ej('e11',1,'texto','¿En qué unidades se expresa la molaridad?','mol/L',{alternativas:['M','moles por litro','mol por litro'],errores:[{valor:'g/L',por:'g/L es concentración en masa, no molaridad.'}],pasos:[P('Recuerda la fórmula','M = n/V','Moles entre litros.'),P('Unidades','mol/L (M)','Por eso se escribe M.')],regla:R_MOL,pista:'Moles entre…'})
  ]
};

// Inválido a propósito: npm run revisar comprueba que el validador lo rechaza
export const invalido={
  leccion:{idea:'',ejemplo:{enunciado:'x',pasos:[]},hueco:{enunciado:'x',pasos:[],pregunta:'',respuesta:''}},
  ejercicios:[
    ej('e1',1,'numero','¿Cuánto es 2 + 2?','cuatro',{pasos:[P('a','b','c'),P('a','b','c')],regla:'r',pista:'p'}),
    ej('e2',1,'numero','¿Cuánto es 2 + 2?','4',{errores:[{valor:'4',por:'error típico que en realidad es correcto'}],pasos:[P('a','b','c'),P('a','b','c')],regla:'r',pista:'p'}),
    ej('e3',1,'opcion','¿Cuál?','b',{opciones:['a','b'],correcta:0,pasos:[P('a','b','c'),P('a','b','c')],regla:'r',pista:'p'}),
    ej('e4',7,'texto','¿?','x',{pasos:[],regla:'',pista:''})
  ]
};
export const VALIDOS={trigonometricas,independencia,molaridad};
