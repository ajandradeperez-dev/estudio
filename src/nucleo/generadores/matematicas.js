/* Generadores de aritmética y álgebra básica: ecuaciones lineales. Cada uno: generar(nivel 1–5, rng) → pregunta (ver index.js).
   Los pasos se calculan con los números de cada ejercicio (ver pasos.js). */
import {igualNum} from './verificar.js';
import {lineal,frac,par} from './formato.js';
import {paso,final,c} from './pasos.js';
import {rectaNumerica} from './diagramas.js';

const R_ECU='Para despejar x, haz lo mismo en los dos lados: lo que suma pasa restando (y al revés) y lo que multiplica pasa dividiendo.';
const coef=a=>a===1?'':a===-1?'-':String(a);
const resta=b=>b<0?`+ ${-b}`:`- ${b}`;

// Ecuaciones lineales: enteros (1–2) → incógnita en los dos lados (3) → paréntesis y negativos (4) → soluciones fraccionarias (5)
const ecuacionLineal={
  titulo:'Ecuaciones lineales',
  explicacion:'Despeja x paso a paso: pasa los números sueltos al otro lado cambiando la operación y luego divide entre el coeficiente de x.',
  alternativa:'Piensa en una <b>balanza en equilibrio</b>: lo que quitas o pones en un platillo lo tienes que hacer también en el otro. Si 3 cajas iguales más 7 kg pesan lo mismo que 25 kg, quita 7 kg de cada lado (3 cajas = 18 kg) y reparte entre 3: cada caja pesa 6 kg. Eso es "pasar restando" y "pasar dividiendo".',
  generar(nivel,rng){
    let A,B,izq,der,pasos,errores=[],pasoMal,comprobar;
    if(nivel<=3){
      const a=rng.entero(2,nivel===1?5:9)*(nivel===1?1:rng.signo()),x0=nivel===1?rng.entero(1,10):rng.noCero(-10,10),b=rng.noCero(-15,15);
      let d=0;if(nivel===3){d=rng.noCero(-6,6);if(d===a)d+=1}
      const e=(a-d)*x0+b;A=a-d;B=e-b;
      izq=lineal([[a,'x'],[b,'']]);der=lineal([[d,'x'],[e,'']]);
      pasos=[
        ...(d?[paso('Junta las x en el lado izquierdo',`\\(${lineal([[a,'x'],[-d,'x'],[b,'']])} = ${e}\\)`,`El término \\(${coef(d)}x\\) pasa al otro lado con el signo contrario.`,{ojo:'Solo se juntan términos con x de un lado y números del otro.'})]:[]),
        paso('Pasa el número suelto al otro lado',`\\(${d?`${coef(A)}x`:`${coef(a)}x`} = ${e} ${c(resta(b))}\\)`,`Lo que ${b>0?'suma':'resta'} en un lado pasa ${b>0?'restando':'sumando'} al otro (es hacer lo mismo en los dos lados).`,{ojo:'El número cambia de signo al cruzar el igual.'}),
        paso('Calcula',`\\(${coef(A)}x = ${c(B)}\\)`,`\\(${e} ${resta(b)} = ${B}\\).`),
        paso(`Divide entre ${A}`,`\\(x = \\dfrac{${B}}{${A}} = ${c(frac(B,A))}\\)`,`El ${A} multiplica a la x, así que pasa dividiendo.`,A<0?{ojo:'Al dividir entre un número negativo cambia el signo del resultado.'}:{})
      ];
      comprobar=`\\(${coef(a)}\\cdot${par(frac(B,A))} ${b<0?'-':'+'} ${Math.abs(b)} = ${frac(a*B+b*A,A)}\\) y el lado derecho da \\(${frac(d*B+e*A,A)}\\)`;
      pasoMal={i:d?1:0,texto:`\\(${coef(A)}x = ${e} ${b<0?'-':'+'} ${Math.abs(b)}\\)`,por:`el ${b} pasó al otro lado sin cambiar de signo.`};
      errores.push({valor:`x = ${frac(e+b,A,{tex:false})}`,si:v=>igualNum(v,(e+b)/A),por:`Pasaste el ${b} con el mismo signo: al cambiar de lado, ${b>0?'lo que suma pasa restando':'lo que resta pasa sumando'}.`});
      if(A!==1)errores.push({valor:`x = ${B}`,si:v=>igualNum(v,B),por:`Te faltó dividir entre ${A}: \\(${A}x = ${B}\\) da \\(x = ${frac(B,A)}\\).`});
      errores.push({valor:`x = ${frac(-B,A,{tex:false})}`,si:v=>igualNum(v,-B/A),por:'Revisa el signo al dividir: menos entre más da menos y menos entre menos da más.'});
    }else{
      // a(x + b) = c x + e   (nivel 4: solución entera; nivel 5: fracción)
      let a=rng.noCero(-6,6);if(Math.abs(a)===1)a*=2;const b=rng.noCero(-8,8);let cc=rng.noCero(-5,5);
      if(a-cc===0||(nivel===5&&Math.abs(a-cc)<2))cc=a-(nivel===5?rng.elegir([2,3,-2,-3]):1);
      A=a-cc;const ab=a*b;let e;
      if(nivel===4)e=A*rng.noCero(-9,9)+ab;else do e=rng.entero(-30,30);while((e-ab)%A===0);
      B=e-ab;
      izq=`${coef(a)}(${lineal([[1,'x'],[b,'']])})`;der=lineal([[cc,'x'],[e,'']]);
      pasos=[
        paso('Quita el paréntesis (propiedad distributiva)',`\\(${c(lineal([[a,'x'],[ab,'']]))} = ${der}\\)`,`El ${a} multiplica a cada término de adentro: \\(${a}\\cdot x\\) y \\(${a}\\cdot${par(b)} = ${ab}\\).`,{ojo:`No olvides multiplicar también el ${b}.`}),
        paso('Junta las x a la izquierda y los números a la derecha',`\\(${lineal([[a,'x'],[-cc,'x']])} = ${e} ${c(resta(ab))}\\)`,'Cada término cambia de signo al pasar al otro lado.'),
        paso('Simplifica cada lado',`\\(${coef(A)}x = ${c(B)}\\)`,`\\(${a} - ${par(cc)} = ${A}\\) y \\(${e} ${resta(ab)} = ${B}\\).`),
        paso(`Divide entre ${A}`,`\\(x = \\dfrac{${B}}{${A}} = ${c(frac(B,A))}\\)`,'Lo que multiplica a x pasa dividiendo; simplifica la fracción si se puede.',A<0?{ojo:'Dividir entre un negativo cambia el signo.'}:{})
      ];
      comprobar=`izquierda \\(${frac(a*(B+b*A),A)}\\) y derecha \\(${frac(cc*B+e*A,A)}\\)`;
      pasoMal={i:0,texto:`\\(${lineal([[a,'x'],[b,'']])} = ${der}\\)`,por:`el ${a} también multiplica al ${b}.`};
      errores.push({valor:`x = ${frac(e-b,A,{tex:false})}`,si:v=>igualNum(v,(e-b)/A),por:`Al quitar el paréntesis, el ${a} multiplica a los dos términos: ${a}·${b} = ${ab}.`});
      errores.push({valor:`x = ${frac(-B,A,{tex:false})}`,si:v=>igualNum(v,-B/A),por:'Revisa el signo al dividir.'});
    }
    const x=B/A,sol=frac(B,A,{tex:false});
    pasos.push(final('Comprueba sustituyendo',`Con \\(x = ${frac(B,A)}\\): ${comprobar} ✓`,'Si al poner tu valor en la ecuación los dos lados dan lo mismo, la respuesta es correcta.',`x = ${sol}`));
    return {
      enunciado:`Resuelve: \\(${izq} = ${der}\\)`,
      respuesta:`x = ${sol}`,
      verificar:v=>igualNum(v,x),
      pasos,errores,pasoMal,regla:R_ECU,diagrama:nivel<=3&&Math.abs(x)<=20?rectaNumerica(x):undefined,
      pista:nivel>=4?'Primero quita el paréntesis multiplicando.':nivel===3?'Junta las x en un lado y los números en el otro.':'Primero pasa el número suelto al otro lado.',
      teclado:'mat'
    };
  }
};

export default {'alg/ecuacion-lineal':ecuacionLineal};
