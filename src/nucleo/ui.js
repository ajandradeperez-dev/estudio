// Piezas de interfaz sin dependencias, para usar desde el núcleo y desde las materias
export const barra=(a,b)=>`<div class="barra" aria-hidden="true"><span style="width:${b?Math.max(0,Math.min(100,Math.round(a/b*100))):0}%"></span></div>`;
