/* Emparejar los temas de una materia propia con las habilidades de la app (sin IA): sinónimos por habilidad y palabras en común,
   sin acentos, mayúsculas ni plurales. Sin DOM: lo usa también npm run revisar.
   catalogo: [{materia, id, titulo, tema?, materiaNombre?}]  →  emparejar(texto, catalogo) → {materia, id, titulo, puntaje} | null */
export const normal=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ+#/ ]+/g,' ').replace(/\s+/g,' ').trim();
const VACIAS=new Set('de la el los las y e en a al del con por para un una unos unas o u su sus se que es son como sobre entre sus tema temas unidad introduccion conceptos concepto basicos basicas basico nociones generales general aplicaciones aplicacion uso usos estudio parte i ii iii iv the of and to in on a an'.split(' '));
const raiz=w=>w.length>4?w.replace(/(es|s)$/,''):w;
const palabras=s=>normal(s).split(' ').filter(w=>w&&!VACIAS.has(w)).map(raiz);

// Sinónimos y nombres comunes en temarios, por habilidad '<materia>/<id>'
export const SINONIMOS={
  'matematicas/expresiones':['expresiones algebraicas','terminos semejantes','reduccion de terminos','evaluar expresiones','lenguaje algebraico'],
  'matematicas/ecuaciones-lineales':['ecuaciones lineales','ecuacion lineal','ecuaciones de primer grado','ecuacion de primer grado','despejar'],
  'matematicas/sistemas-2x2':['sistemas de ecuaciones','sistema de ecuaciones','ecuaciones simultaneas','2x2','metodo de sustitucion','metodo de igualacion','metodo de reduccion'],
  'matematicas/factorizacion':['factorizacion','factorizar','productos notables','factor comun','trinomio','diferencia de cuadrados'],
  'matematicas/exponentes':['leyes de los exponentes','leyes de exponentes','potencias','potenciacion','exponentes'],
  'matematicas/vectores':['vectores','vector','magnitud de un vector','norma de un vector','suma de vectores','r2 y r3','espacios vectoriales'],
  'matematicas/operaciones-producto-punto':['operaciones con vectores','combinacion lineal'],
  'matematicas/producto-punto':['producto punto','producto escalar','producto interno','dot product'],
  'matematicas/angulo-vectores':['angulo entre vectores','ortogonalidad','vectores ortogonales','vectores perpendiculares','proyeccion'],
  'matematicas/matrices':['matrices','matriz','multiplicacion de matrices','producto de matrices','algebra matricial','operaciones con matrices'],
  'matematicas/gauss':['gauss','gauss jordan','eliminacion gaussiana','sistemas de ecuaciones lineales','escalonamiento'],
  'matematicas/determinantes':['determinantes','determinante','regla de cramer','cramer','sarrus'],
  'matematicas/inversa':['matriz inversa','inversa de una matriz','inversas'],
  'matematicas/limites':['limites','limite','continuidad','limites laterales','limites al infinito','asintotas'],
  'matematicas/derivada-polinomio':['derivada','derivadas','derivacion','diferenciacion','reglas de derivacion','regla de la potencia','tasa de cambio','razon de cambio'],
  'matematicas/regla-producto':['regla del producto','derivada de un producto'],
  'matematicas/regla-cociente':['regla del cociente','derivada de un cociente'],
  'matematicas/regla-cadena':['regla de la cadena','derivacion implicita','derivada implicita','funcion compuesta','composicion de funciones'],
  'matematicas/antiderivadas':['antiderivada','antiderivadas','integral indefinida','integrales indefinidas','primitiva','integrales inmediatas'],
  'matematicas/integral-definida':['integral definida','integrales definidas','teorema fundamental del calculo','sumas de riemann'],
  'matematicas/sustitucion':['sustitucion','cambio de variable','integracion por sustitucion'],
  'matematicas/area-curva':['area bajo la curva','area entre curvas','calculo de areas','aplicaciones de la integral'],
  'ciberseguridad/binario-hex':['sistemas numericos','conversion de bases','binario','hexadecimal','sistema binario'],
  'ciberseguridad/puertos-y-servicios':['puertos','puertos y servicios','tcp y udp','protocolos de aplicacion','servicios de red'],
  'ciberseguridad/subredes-cidr':['subredes','subred','subnetting','cidr','vlsm','direccionamiento ip','direcciones ip','ipv4'],
  'ciberseguridad/mascaras':['mascara de red','mascara de subred','mascaras','netmask','wildcard'],
  'ciberseguridad/prefijo-hosts':['numero de hosts','calculo de hosts','hosts por subred'],
  'ciberseguridad/politicas-firewall':['firewall','firewalls','cortafuegos','reglas de firewall','politicas de seguridad','acl','listas de control de acceso','filtrado de paquetes'],
  'ciberseguridad/nat':['nat','traduccion de direcciones','pat','port forwarding','snat','dnat'],
  'ciberseguridad/vpn-fases':['vpn','ipsec','ike','tuneles','redes privadas virtuales'],
  'ciberseguridad/cripto':['criptografia','cifrado','hash','firma digital','clave publica','cifrado simetrico','cifrado asimetrico','pki','certificados'],
  'ciberseguridad/logs':['logs','registros','bitacoras','siem','analisis de eventos','monitoreo'],
  'ciberseguridad/incidentes':['respuesta a incidentes','incidentes de seguridad','gestion de incidentes','malware','phishing','ataques'],
  'ciencia-datos/tendencia-central':['tendencia central','media mediana y moda','media','mediana','moda','promedio'],
  'ciencia-datos/tipos-de-variables':['tipos de variables','variables cualitativas','variables cuantitativas','escalas de medicion'],
  'ciencia-datos/dispersion':['dispersion','desviacion estandar','varianza','rango','medidas de dispersion','desviacion tipica'],
  'ciencia-datos/percentiles':['percentiles','cuartiles','deciles','diagrama de caja','boxplot','medidas de posicion'],
  'ciencia-datos/probabilidad-basica':['probabilidad','probabilidad clasica','regla de laplace','espacio muestral','eventos'],
  'ciencia-datos/probabilidad-compuesta':['probabilidad condicional','eventos independientes','probabilidad compuesta','eventos compuestos','teorema de bayes','bayes'],
  'ciencia-datos/pandas-basico':['pandas','dataframe','dataframes','python para datos','manipulacion de datos'],
  'ciencia-datos/pandas-salida':['lectura de codigo','salida de pandas'],
  'ciencia-datos/leer-grafica':['graficas','graficos','visualizacion','grafica de barras','histograma','visualizacion de datos'],
  'ciencia-datos/ml-metricas':['matriz de confusion','precision y recall','exactitud','accuracy','metricas de clasificacion','f1','evaluacion de modelos'],
  'ingles/verbo-to-be':['verb to be','verbo to be','to be','am is are','verbo ser y estar'],
  'ingles/presente-simple':['present simple','simple present','presente simple','rutinas'],
  'ingles/can':['can','modal can','habilidades can','could'],
  'ingles/there-is-there-are':['there is','there are','there is there are','hay'],
  'ingles/presente-continuo':['present continuous','present progressive','presente continuo','presente progresivo','ing form'],
  'ingles/pasado-simple':['past simple','simple past','pasado simple','regular verbs','irregular verbs','verbos regulares','verbos irregulares'],
  'ingles/futuro-going-to-will':['future','futuro','will','going to','be going to'],
  'ingles/presente-perfecto':['present perfect','presente perfecto','have has participle'],
  'ingles/articulos':['articles','articulos','a an the'],
  'ingles/plurales':['plurals','plurales','plural nouns'],
  'ingles/preposiciones':['prepositions','preposiciones','in on at'],
  'ingles/orden-palabras':['word order','orden de las palabras','sentence structure','adverbs of frequency'],
  'ingles/vocabulario-trabajo':['vocabulary work','vocabulario de trabajo','jobs','occupations','profesiones'],
  'ingles/traducir':['translation','traduccion'],
  'ingles/chunks':['useful expressions','expresiones utiles','phrases','frases hechas']
};
const contiene=(texto,frase)=>(' '+texto+' ').includes(' '+frase+' ');

export function emparejar(texto,catalogo){
  const t=normal(texto),tp=new Set(palabras(texto));if(!t)return null;
  let mejor=null;
  for(const h of catalogo){
    const clave=`${h.materia}/${h.id}`;let puntaje=0;
    // 1. un sinónimo (o el título exacto) aparece completo en el tema: la frase más larga gana
    for(const f of [normal(h.titulo),...(SINONIMOS[clave]||[]).map(normal)])if(f&&contiene(t,f))puntaje=Math.max(puntaje,.8+Math.min(.2,f.length/100));
    // 2. palabras del título de la habilidad presentes en el tema
    if(puntaje<.8){const hp=palabras(h.titulo).filter(w=>w.length>2);if(hp.length){const comunes=hp.filter(w=>tp.has(w)).length;puntaje=Math.max(puntaje,comunes/hp.length*.75)}}
    if(puntaje>(mejor?.puntaje||0))mejor={materia:h.materia,id:h.id,titulo:h.titulo,puntaje:Math.round(puntaje*100)/100};
  }
  return mejor&&mejor.puntaje>=.6?mejor:null;
}
