/* Escenas ilustradas para describir (escritura con imágenes y la parte de habla). Son dibujos SVG simples hechos para la
   app (nada de fotos descargadas ni generadas). Cada escena trae su descripción escrita (para quien no ve bien el dibujo
   o usa lector de pantalla) y la lista de elementos que se pueden mencionar. Los colores de fondo siguen al tema. */
const svg=(cuerpo,titulo)=>`<svg class="escena" viewBox="0 0 320 200" role="img" aria-label="${titulo}"><rect class="esc-fondo" x="0" y="0" width="320" height="200" rx="14"/>${cuerpo}</svg>`;
const persona=(x,y,color,{brazo=0,pelo='#4a3326'}={})=>`<g transform="translate(${x} ${y})"><circle cx="0" cy="-34" r="9" fill="#f1c7a3"/><path d="M-9 -38 q9 -12 18 0" fill="${pelo}"/><rect x="-10" y="-25" width="20" height="28" rx="6" fill="${color}"/><rect x="-9" y="3" width="7" height="22" rx="3" fill="#3b4152"/><rect x="2" y="3" width="7" height="22" rx="3" fill="#3b4152"/><rect x="8" y="-22" width="6" height="20" rx="3" fill="${color}" transform="rotate(${brazo} 11 -22)"/></g>`;

export const ESCENAS={
  cocina:{titulo:'Una cocina en la mañana',descripcion:'Una familia en la cocina por la mañana: una mujer cocina huevos en la estufa, un niño toma jugo en la mesa, hay pan y fruta, un reloj marca las 7:30 y por la ventana se ve el sol.',
    elementos:['kitchen','woman','cooking','eggs','stove','pan','boy','table','orange juice','glass','bread','fruit','bananas','clock','half past seven','window','sun','breakfast','morning','fridge'],
    svg:svg(`<rect x="18" y="18" width="70" height="52" rx="6" fill="#bfe3ff"/><circle cx="70" cy="34" r="10" fill="#f5c542"/>
<circle cx="262" cy="36" r="17" fill="#fff" stroke="#3b4152" stroke-width="3"/><path d="M262 36 L255 44 M262 36 L262 50" stroke="#3b4152" stroke-width="3" stroke-linecap="round"/>
<rect x="230" y="70" width="58" height="104" rx="6" fill="#d8dde6" stroke="#9aa3b5"/><line x1="232" y1="110" x2="286" y2="110" stroke="#9aa3b5"/>
<rect x="100" y="120" width="70" height="54" rx="4" fill="#9aa3b5"/><rect x="104" y="112" width="62" height="10" rx="3" fill="#3b4152"/><ellipse cx="135" cy="108" rx="18" ry="5" fill="#555"/><circle cx="130" cy="106" r="4" fill="#fff"/><circle cx="141" cy="106" r="4" fill="#fff"/><circle cx="130" cy="106" r="2" fill="#f5c542"/><circle cx="141" cy="106" r="2" fill="#f5c542"/>
${persona(188,150,'#e0679b',{brazo:-60})}
<rect x="20" y="140" width="80" height="10" rx="3" fill="#a0522d"/><rect x="26" y="150" width="6" height="26" fill="#a0522d"/><rect x="88" y="150" width="6" height="26" fill="#a0522d"/>
<rect x="30" y="122" width="10" height="18" rx="2" fill="#ffa53a" opacity=".9"/><ellipse cx="70" cy="136" rx="14" ry="5" fill="#d4a056"/><path d="M78 128 q8 -6 12 4" stroke="#f5c542" stroke-width="5" fill="none" stroke-linecap="round"/>
${persona(52,172,'#4a8fe0',{brazo:-30,pelo:'#2b1d14'})}`,'Una cocina en la mañana')},
  estacion:{titulo:'Una estación de tren',descripcion:'Una estación de tren: un tren está en el andén, un tablero muestra salidas y retrasos, un hombre con maleta corre, una mujer mira su teléfono sentada en una banca y un empleado ayuda a un turista con un mapa.',
    elementos:['train station','train','platform','departure board','delayed','man','suitcase','running','late','woman','bench','phone','waiting','staff member','tourist','map','clock','ticket','crowded','rush'],
    svg:svg(`<rect x="14" y="20" width="120" height="44" rx="6" fill="#1d2130"/><text x="22" y="38" fill="#ffd25e" font-size="10" font-family="monospace">08:15 LEEDS</text><text x="22" y="54" fill="#ff7a7f" font-size="10" font-family="monospace">08:40 YORK  DELAYED</text>
<rect x="150" y="60" width="160" height="62" rx="16" fill="#4652d0"/><rect x="160" y="72" width="26" height="20" rx="3" fill="#bfe3ff"/><rect x="194" y="72" width="26" height="20" rx="3" fill="#bfe3ff"/><rect x="228" y="72" width="26" height="20" rx="3" fill="#bfe3ff"/><rect x="262" y="72" width="26" height="20" rx="3" fill="#bfe3ff"/>
<rect x="0" y="126" width="320" height="12" fill="#9aa3b5"/>
${persona(60,176,'#1b7d4a',{brazo:-80})}<rect x="72" y="156" width="20" height="20" rx="3" fill="#7b3fc4"/>
<rect x="128" y="160" width="60" height="8" rx="3" fill="#a0522d"/>${persona(158,170,'#e0679b',{brazo:-100,pelo:'#c97a2a'})}<rect x="166" y="132" width="7" height="11" rx="2" fill="#1d2130"/>
${persona(236,180,'#c2560f')}${persona(276,180,'#4a8fe0',{brazo:-50,pelo:'#e8d35b'})}<rect x="250" y="140" width="22" height="16" fill="#f5f0dc" stroke="#9aa3b5"/>`,'Una estación de tren')},
  oficina:{titulo:'Una oficina con problemas',descripcion:'Una oficina moderna: una mujer habla por teléfono preocupada frente a una computadora con una alerta roja, un hombre lleva café, hay una impresora atascada con papeles en el piso, una planta y una pizarra con una reunión a las 10.',
    elementos:['office','woman','on the phone','worried','computer','screen','warning','error','man','coffee','printer','paper jam','papers on the floor','plant','whiteboard','meeting','ten o\'clock','desk','chair','problem'],
    svg:svg(`<rect x="200" y="18" width="104" height="58" rx="4" fill="#fff" stroke="#9aa3b5"/><text x="210" y="40" fill="#1d2130" font-size="11" font-family="sans-serif">MEETING</text><text x="210" y="58" fill="#cc2f35" font-size="11" font-family="sans-serif">10:00</text>
<rect x="20" y="110" width="140" height="10" rx="3" fill="#a0522d"/><rect x="40" y="70" width="70" height="44" rx="4" fill="#1d2130"/><rect x="44" y="74" width="62" height="34" fill="#fdecec"/><path d="M75 80 l10 18 h-20z" fill="#cc2f35"/><text x="72" y="96" fill="#fff" font-size="10">!</text>
${persona(130,150,'#7b3fc4',{brazo:-140,pelo:'#2b1d14'})}<rect x="138" y="106" width="6" height="12" rx="2" fill="#1d2130"/>
<rect x="196" y="120" width="50" height="34" rx="4" fill="#d8dde6" stroke="#9aa3b5"/><rect x="204" y="112" width="34" height="10" fill="#fff" stroke="#9aa3b5"/><rect x="190" y="170" width="18" height="12" fill="#fff" transform="rotate(-15 199 176)"/><rect x="214" y="174" width="18" height="12" fill="#fff" transform="rotate(10 223 180)"/>
${persona(280,182,'#1b7d4a',{brazo:-70})}<rect x="290" y="148" width="9" height="10" rx="2" fill="#7a4b2a"/>
<rect x="10" y="160" width="16" height="20" rx="3" fill="#c2560f"/><circle cx="18" cy="150" r="12" fill="#1b7d4a"/>`,'Una oficina con problemas')},
  parque:{titulo:'Un parque el domingo',descripcion:'Un parque un domingo soleado: una familia hace un pícnic en el pasto, un hombre corre con su perro, dos niños juegan futbol, una mujer lee en una banca bajo un árbol y un vendedor vende helados.',
    elementos:['park','sunny','Sunday','family','picnic','grass','blanket','man','running','dog','children','playing football','ball','woman','reading','book','bench','tree','ice cream','seller'],
    svg:svg(`<circle cx="290" cy="30" r="16" fill="#f5c542"/><rect x="0" y="120" width="320" height="80" fill="#8fd18a"/>
<rect x="40" y="70" width="14" height="60" fill="#8b5a2b"/><circle cx="47" cy="62" r="30" fill="#1b7d4a"/>
<rect x="20" y="132" width="60" height="7" rx="3" fill="#a0522d"/>${persona(50,160,'#e0679b',{brazo:-120,pelo:'#c97a2a'})}<rect x="56" y="124" width="12" height="9" fill="#4652d0"/>
<path d="M100 170 l60 0 l-10 18 l-60 0z" fill="#ff7a7f"/>${persona(118,178,'#4a8fe0')}${persona(142,178,'#ffd25e',{pelo:'#2b1d14'})}
${persona(206,166,'#c2560f',{brazo:-30})}<ellipse cx="232" cy="160" rx="12" ry="7" fill="#8b5a2b"/><circle cx="242" cy="155" r="5" fill="#8b5a2b"/>
${persona(262,190,'#1b7d4a',{brazo:-60})}${persona(296,190,'#7b3fc4',{brazo:-20})}<circle cx="280" cy="186" r="6" fill="#fff" stroke="#1d2130"/>
<rect x="170" y="96" width="34" height="26" rx="4" fill="#fff" stroke="#9aa3b5"/><text x="173" y="113" font-size="9" fill="#cc2f35">ICE CREAM</text>`,'Un parque el domingo')}
};
export const escena=id=>ESCENAS[id]||null;
