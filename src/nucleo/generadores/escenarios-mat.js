/* Escenarios integradores de Matemáticas (casos de varias preguntas con el mismo contexto). Sin DOM. */
import {prob,paso,final,marca,fmt,cerca} from './extensiones/base.js';

// Precálculo: una app de suscripción que crece (exponencial, modelo lineal de ingreso, composición e inversa con logaritmos)
export function escenarioApp(rng){
  const U0=rng.entero(2,9)*100,r=rng.elegir([5,8,10,12,15]),p=rng.elegir([29,49,79,99]),C=rng.entero(5,30)*1000,t=rng.entero(3,12),meta=U0*rng.entero(3,6);
  const U=x=>U0*(1+r/100)**x,R=u=>p*u-C,Ut=U(t),Rt=R(Ut),tMeta=Math.log(meta/U0)/Math.log(1+r/100),uEq=C/p;
  const ctx=`<p class="contexto">Lanzas una app de suscripción. Empieza con ${U0} usuarios y crece ${r} % al mes: U(t) = ${U0}·${fmt(1+r/100,2)}^t. Cada usuario paga $${p} al mes y los servidores y el equipo cuestan $${C} fijos al mes: ganancia G(u) = ${p}u − ${C}.</p>`;
  const q=(o)=>({...prob(o),enunciado:ctx+o.enunciado,profundidad:'escenario',regla:'Crecimiento: U₀(1 + r)^t. Ganancia: ingreso − costo fijo. Para despejar t de un exponencial, usa logaritmos.',pista:'Una función a la vez.'});
  return [
    q({enunciado:`1/4 · ¿Cuántos usuarios tendrás en el mes ${t}? (redondea a 2 decimales)`,v:Ut,dec:2,
      pasos:[paso('Factor de crecimiento',`${fmt(1+r/100,2)}^${t} = ${fmt((1+r/100)**t,4)}`,'Crece por porcentaje: se multiplica.'),final('Multiplica por U₀',`${U0}·${fmt((1+r/100)**t,4)} = ${marca(fmt(Ut))}`,'Usuarios.')],
      errores:[[U0*(1+r*t/100),'Eso sería crecimiento lineal (sumar lo mismo cada mes).'],[U0*(r/100)**t,'El factor es 1 + r, no r.'],[U0+r*t,'El porcentaje es sobre los usuarios.']],comprobar:()=>{let u=U0;for(let i=0;i<t;i++)u*=1+r/100;return cerca(u,Ut)}}),
    q({enunciado:'2/4 · ¿Con cuántos usuarios dejas de perder dinero (G(u) = 0)? (2 decimales)',v:uEq,dec:2,
      pasos:[paso('Iguala a 0',`${p}u − ${C} = 0`,'Punto de equilibrio.'),final('Despeja',`u = ${C}/${p} = ${marca(fmt(uEq))}`,'Usuarios.')],
      errores:[[C*p,'Se divide.'],[p/C,'Es costo entre precio.']],comprobar:()=>cerca(R(uEq),0,1e-6)}),
    q({enunciado:`3/4 · Con la composición G(U(t)), ¿cuál es tu ganancia en el mes ${t}? (2 decimales; negativo = pérdida)`,v:Rt,dec:2,unidad:'pesos',
      pasos:[paso('Primero U('+t+')',`${fmt(Ut)} usuarios`,'La función de adentro.'),final('Luego G',`${p}·${fmt(Ut)} − ${C} = ${marca(fmt(Rt))}`,'La de afuera.')],
      errores:[[p*Ut,'Falta restar el costo fijo.'],[R(t),'G se evalúa en los usuarios, no en el mes.']],comprobar:()=>cerca(p*U0*Math.exp(t*Math.log(1+r/100))-C,Rt)}),
    q({enunciado:`4/4 · ¿En qué mes llegas a ${meta} usuarios? Despeja t con logaritmos (2 decimales).`,v:tMeta,dec:2,unidad:'meses',
      pasos:[paso('Divide entre U₀',`${fmt(1+r/100,2)}^t = ${meta/U0}`,'Aísla la potencia.'),paso('Logaritmo',`t = ln ${meta/U0} / ln ${fmt(1+r/100,2)}`,'Baja el exponente.'),final('Calcula',marca(fmt(tMeta)),'Meses.')],
      errores:[[(meta/U0-1)/(r/100),'Eso supone crecimiento lineal.'],[Math.log(meta)/Math.log(1+r/100),'Divide primero entre U₀.'],[meta/U0,'Esa es la razón, no el tiempo.']],comprobar:()=>cerca(U(tMeta),meta,1e-9)})
  ];
}
