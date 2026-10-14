/* Pasos de un procedimiento, calculados con los números del ejercicio:
   {que: lo que hago, como: la operación con estos números (HTML + KaTeX), porque: la regla en lenguaje simple,
    ojo?: error típico en este paso, res?: en el último paso, el resultado tal como se escribiría (npm run revisar lo verifica)}
   En las fórmulas, \cambio{…} resalta lo que cambia en ese paso (KaTeX, ver formula.js). Sin DOM. */
export const paso=(que,como,porque,extra={})=>({que,como,porque,...extra});
// Resaltar lo que cambia: dentro de una fórmula (\cambio) o en texto normal (<mark>)
export const c=x=>`\\cambio{${x}}`;
export const marca=x=>`<mark class="cambio">${x}</mark>`;
// Último paso: comprobación o resultado final con res = la respuesta
export const final=(que,como,porque,res,extra={})=>({que,como,porque,res,...extra});
