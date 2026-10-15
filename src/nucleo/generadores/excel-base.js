/* Base de los generadores de Excel: tablas de datos realistas (ventas, calificaciones, inventario, nómina) y preguntas de
   "escribe la fórmula" que se verifican POR RESULTADO, no por texto: la fórmula del usuario se evalúa en la hoja que ve y en otra
   hoja con los mismos encabezados y otros datos; tiene que dar lo mismo que la fórmula correcta en las dos (así no basta con
   escribir el número). Si la fórmula se copia hacia abajo (o a un rectángulo), se comprueban todas las copias.
   Cada pregunta trae comprobar(): un segundo cálculo independiente en JavaScript, sin el evaluador. Sin DOM. */
import {crearRng} from '../rng.js';
import {crearHoja,evaluar,valorCelda,mismoValor,copiarFormula,errorDeEscritura,esError,partes,ref,numACol,serial,mostrar,nombreIngles} from '../excel/formulas.js';
import {paso,final,marca} from './pasos.js';

export {paso,final,marca};
export const NOMBRES=['Ana','Luis','Marta','Pedro','Sofía','Diego','Lucía','Jorge','Carla','Raúl','Elena','Iván','Rosa','Hugo','Paula','Tomás','Valeria','Andrés'];
export const APELLIDOS=['García','López','Pérez','Ramírez','Torres','Flores','Gómez','Díaz','Ruiz','Castro','Morales','Vargas'];
export const REGIONES=['Norte','Sur','Centro','Este'];
export const PRODUCTOS=[['Laptop',12500],['Mouse',250],['Teclado',480],['Monitor',3200],['Audífonos',650],['Cámara web',890],['Bocina',720],['Tableta',5400]];
export const CATEGORIAS=['Cómputo','Audio','Oficina','Papelería'];
export const PUESTOS=['Ventas','Soporte','Contador','Analista','Recepción'];
export const code=f=>`<code>${f}</code>`;
// "SUMA (SUM)": nombre en español y, entre paréntesis, en inglés
export const fn=n=>{const en=nombreIngles(n);return en?`${n} (${en})`:n};

/* ---------- tablas de datos ---------- */
// Cada tabla: encabezados en la fila 1, datos desde la fila 2, columnas A, B, C…
export function tablaVentas(r,n){
  const nom=r.barajar(NOMBRES).slice(0,n);
  return {cab:['Vendedor','Región','Producto','Unidades','Precio'],filas:nom.map(x=>{const [p,pr]=r.elegir(PRODUCTOS);return [x,r.elegir(REGIONES),p,r.entero(1,40),pr]})};
}
export function tablaCalif(r,n,{faltan=0}={}){
  const nom=r.barajar(NOMBRES).slice(0,n),f=r.barajar([...Array(n).keys()]).slice(0,faltan);
  return {cab:['Alumno','Parcial 1','Parcial 2','Final','Asistencia'],filas:nom.map((x,i)=>[x,r.entero(40,100),r.entero(40,100),f.includes(i)?'Pendiente':r.entero(40,100),r.entero(12,20)*5/100])};
}
export function tablaInventario(r,n){
  const ps=r.barajar(PRODUCTOS).concat(r.barajar([['Libreta',35],['Pluma',12],['Engrapadora',140],['Carpeta',28]])).slice(0,n);
  return {cab:['Producto','Categoría','Existencia','Mínimo','Precio'],filas:ps.map(([p,pr])=>[p,r.elegir(CATEGORIAS),r.entero(0,60),r.elegir([5,10,15,20]),pr])};
}
export function tablaNomina(r,n){
  const nom=r.barajar(NOMBRES).slice(0,n);
  return {cab:['Empleado','Puesto','Sueldo','Horas extra','Ingreso'],filas:nom.map(x=>[x,r.elegir(PUESTOS),r.entero(9,40)*1000,r.entero(0,12),serial(r.entero(2015,2024),r.entero(1,12),r.entero(1,28))])};
}
export function aCeldas({cab,filas},extra={}){
  const c={};cab.forEach((t,j)=>{c[numACol(j+1)+1]=t});
  filas.forEach((f,i)=>f.forEach((v,j)=>{if(v!==null&&v!=='')c[numACol(j+1)+(i+2)]=v}));
  return {...c,...extra};
}
export const col=(t,nombre)=>numACol(t.cab.indexOf(nombre)+1);
export const ultima=t=>t.filas.length+1;
export const rangoCol=(t,nombre)=>`${col(t,nombre)}2:${col(t,nombre)}${ultima(t)}`;
export const valores=(t,nombre)=>t.filas.map(f=>f[t.cab.indexOf(nombre)]);
// Formato de las columnas al mostrar la hoja
export const formatosDe=(t,mapa)=>{const f={};for(const [nombre,fm] of Object.entries(mapa)){const k=col(t,nombre);if(!k||k==='@')continue;for(let i=2;i<=ultima(t);i++)f[k+i]=fm}return f};

/* ---------- pregunta "escribe la fórmula" ---------- */
// cfg: {rng, datos(r) → {celdas, tabla?}, destino:'F2', formula:'=…', copiar?: n filas hacia abajo | destinos?: ['B2',…],
//       enunciado, pasos, errores:[[fórmula, por]], regla, pista, esperado(datos) → [valores] (cálculo independiente), formatos?, hoy?}
export function formulaQ(cfg){
  const {rng,destino,formula}=cfg;
  const semilla2=rng.entero(1,2**31-1);
  const d1=cfg.datos(rng),d2=cfg.datos(crearRng(semilla2));
  const p0=partes(destino);
  const destinos=cfg.destinos||[destino,...Array.from({length:cfg.copiar||0},(_,i)=>ref(p0.c,p0.f+i+1))];
  const norm=e=>{const s=String(e??'').trim();return s.startsWith('=')?s:'='+s};
  // virtual: la fórmula se evalúa en cada celda sin escribirla (reglas de formato condicional sobre los datos)
  const resultados=(d,f)=>{if(cfg.virtual){const h=crearHoja(d.celdas,{hoy:cfg.hoy});return destinos.map(x=>evaluar(h,copiarFormula(f,destino,x)))}
    const c={...d.celdas};for(const x of destinos)c[x]=copiarFormula(f,destino,x);const h=crearHoja(c,{hoy:cfg.hoy});return destinos.map(x=>valorCelda(h,x))};
  const r1=resultados(d1,formula),r2=resultados(d2,formula);
  const iguales=(a,b)=>a.length===b.length&&a.every((v,i)=>mismoValor(v,b[i]));
  const da=e=>{const f=norm(e);return [resultados(d1,f),resultados(d2,f)]};
  const verificar=e=>{if(!String(e??'').trim())return false;const [a,b]=da(e);return iguales(a,r1)&&iguales(b,r2)};
  const errores=(cfg.errores||[]).filter(([f])=>!verificar(f)).map(([f,por])=>{const [w1,w2]=da(f);return {valor:f,si:e=>{const [a,b]=da(e);return iguales(a,w1)&&iguales(b,w2)},por}});
  errores.push(
    {si:e=>!!errorDeEscritura(norm(e)),por:'La fórmula está incompleta o mal escrita: revisa que cada paréntesis abierto se cierre, que los textos vayan entre comillas y que los argumentos se separen con ; (o con ,).'},
    {si:e=>da(e)[0].some(v=>esError(v)&&v.err==='#¿NOMBRE?'),por:'#¿NOMBRE? quiere decir que Excel no reconoce un nombre: revisa cómo escribiste la función o pon los textos entre comillas ("Norte").'},
    {si:e=>da(e)[0].some(v=>esError(v)&&v.err==='#¡REF!'),por:'#¡REF!: la fórmula se usa a sí misma (referencia circular) o apunta fuera de la tabla.'},
    {si:e=>da(e)[0].some(v=>esError(v)&&v.err==='#N/A'),por:'#N/A: la búsqueda no encontró el valor. Revisa el valor buscado, el rango y si pediste coincidencia exacta.'},
    {si:e=>{const [a]=da(e);return a.length>1&&mismoValor(a[0],r1[0])&&!iguales(a,r1)},por:'En la primera fila da bien, pero al copiarla hacia abajo cambia lo que no debía: fija con $ la celda que debe quedarse quieta (F4 en Excel).'}
  );
  const esperado=cfg.esperado;
  const comprobar=()=>!esperado||(iguales(r1,esperado(d1))&&iguales(r2,esperado(d2)));
  const fms=cfg.formatos?.(d1)||{};
  return {
    enunciado:cfg.enunciado,respuesta:formula,verificar,errores,comprobar,teclado:'xl',
    hoja:{celdas:d1.celdas,filas:12,cols:8,destino,destinos,formatos:fms,hoy:cfg.hoy,resultados:r1.map(v=>mostrar(v,fms[destino]))},
    pasos:[...cfg.pasos.slice(0,-1),{...cfg.pasos.at(-1),res:formula}],
    regla:cfg.regla,pista:cfg.pista,
    clave:cfg.formula+'|'+JSON.stringify(d1.celdas).slice(0,400)
  };
}

/* ---------- pregunta con la hoja a la vista y respuesta escrita (un valor, un texto o un rango) ---------- */
const normal=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim().replace(/[.!¡¿?]$/,'');
export function valorQ({enunciado,respuesta,alternativas=[],numero,pasos,errores=[],regla,pista,hoja,comprobar,clave,tolerancia=1e-9}){
  const ok=numero!==undefined
    ?e=>{const s=String(e??'').trim().replace(/[$\s]/g,'').replace(/,(?=\d{3}\b)/g,'');const v=s.endsWith('%')?parseFloat(s)/100:parseFloat(s.replace(',','.'));return Number.isFinite(v)&&Math.abs(v-numero)<=tolerancia*Math.max(1,Math.abs(numero))&&/^[-+]?[\d.,]+%?$/.test(s)}
    :e=>[respuesta,...alternativas].some(a=>normal(a)===normal(e));
  return {enunciado,respuesta:String(respuesta),verificar:ok,
    errores:errores.filter(([v])=>!ok(v)).map(([v,por])=>({valor:String(v),si:e=>normal(e)===normal(v),por})),
    pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:String(respuesta)}],regla,pista,hoja,comprobar:comprobar||(()=>true),clave:clave||enunciado+JSON.stringify(hoja?.celdas||'').slice(0,300)};
}
// Un rango escrito (B2:B9, b2 : b9, B9:B2) igual a otro
export const igualRango=(e,r)=>{const n=s=>String(s).toUpperCase().replace(/[\s$]/g,'').split(':').sort().join(':');return /^[A-Z]{1,2}\d+(:[A-Z]{1,2}\d+)?$/i.test(String(e).replace(/[\s$]/g,''))&&n(e)===n(r)};
