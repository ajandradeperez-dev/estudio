const R_H='Hosts útiles = 2^(32 − prefijo) − 2: se restan la dirección de red y la de broadcast.';
const R_M='/24 = 255.255.255.0; /25 = 255.255.255.128; /26 = 255.255.255.192; /27 = 255.255.255.224; /30 = 255.255.255.252.';
const R_B='Divide en bloques de 2^(32 − prefijo) direcciones: en /26 son de 64 (0, 64, 128, 192). La red es el inicio del bloque y el broadcast, el final.';

export default {
  titulo:'Subredes CIDR',
  resumen:'Prefijo, máscara, hosts útiles, red y broadcast.',
  explicacion:[
    'El prefijo <b>/n</b> indica cuántos bits son de red. Hosts útiles = 2^(32 − n) − 2 (se restan la dirección de red y la de broadcast).',
    'Máscaras más usadas: /24 = 255.255.255.0 (254 hosts), /25 = .128 (126), /26 = .192 (62) y /30 = .252 (2, para enlaces punto a punto).',
    'La red es la primera dirección del bloque y el broadcast, la última. En /26 los bloques son de 64: .0, .64, .128 y .192.'
  ],
  ejemplos:[
    ['192.168.10.0/24','hosts .1 a .254 · broadcast .255'],
    ['10.0.0.77/26','bloque .64–.127 · red .64 · broadcast .127'],
    ['Enlace entre dos routers','/30: exactamente 2 hosts']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Cuántos hosts útiles tiene una red /24?',opciones:['256','254','255'],correcta:1,
     porque:{0:'Hay 256 direcciones, pero la de red y la de broadcast no se asignan.',2:'Se restan dos, no una: red y broadcast.'},regla:R_H},
    {tipo:'completar',pregunta:'¿Cuántos hosts útiles tiene una /26?',respuestas:['62'],
     errores:{'64':'Resta red y broadcast: 64 − 2.'},regla:R_H},
    {tipo:'completar',pregunta:'Escribe la máscara decimal de /24.',respuestas:['255.255.255.0'],
     errores:{'255.255.0.0':'Esa es /16.'},regla:R_M},
    {tipo:'completar',pregunta:'Escribe el broadcast de 192.168.10.0/24.',respuestas:['192.168.10.255'],
     errores:{'192.168.10.254':'.254 es el último host; el broadcast es .255.'},regla:R_B},
    {tipo:'completar',pregunta:'¿Cuántos hosts útiles tiene una /30?',respuestas:['2'],
     errores:{'4':'4 direcciones − red − broadcast = 2.'},regla:R_H}
  ],[
    {tipo:'opcion',pregunta:'Para un enlace punto a punto entre dos routers, ¿qué prefijo desperdicia menos direcciones?',opciones:['/24','/30','/16'],correcta:1,
     porque:{0:'Sobran 252 direcciones.',2:'Sobran miles de direcciones.'},regla:'Un enlace punto a punto necesita 2 hosts: /30 (2^2 − 2 = 2).'},
    {tipo:'completar',pregunta:'Escribe la máscara decimal de /26.',respuestas:['255.255.255.192'],
     errores:{'255.255.255.128':'Esa es /25.','255.255.255.224':'Esa es /27.'},regla:R_M},
    {tipo:'completar',pregunta:'¿Cuántos hosts útiles tiene una /25?',respuestas:['126'],
     errores:{'128':'Resta red y broadcast: 128 − 2.'},regla:R_H},
    {tipo:'completar',pregunta:'Escribe la dirección de red de 10.0.0.77/26.',respuestas:['10.0.0.64'],
     errores:{'10.0.0.0':'En /26 los bloques son de 64: el .77 cae en el bloque que empieza en .64.'},regla:R_B},
    {tipo:'completar',pregunta:'Escribe el broadcast de 10.0.0.77/26.',respuestas:['10.0.0.127'],
     errores:{'10.0.0.255':'Ese sería el de una /24. En /26, el bloque del .77 es .64–.127.','10.0.0.126':'.126 es el último host; el broadcast es .127.'},regla:R_B}
  ]]
};
