/* Generadores de aritmética y álgebra básica. Cada uno: generar(nivel 1–5, rng) → pregunta (ver index.js). */
import {igualNum} from './verificar.js';
import {lineal,frac} from './formato.js';

const R_ECU='Para despejar x, haz lo mismo en los dos lados: lo que suma pasa restando (y al revés) y lo que multiplica pasa dividiendo.';

// Ecuaciones lineales: enteros (1–2) → incógnita en los dos lados (3) → paréntesis y negativos (4) → soluciones fraccionarias (5)
const ecuacionLineal={
  titulo:'Ecuaciones lineales',
  explicacion:'Despeja x paso a paso: pasa los números sueltos al otro lado cambiando la operación y luego divide entre el coeficiente de x.',
  generar(nivel,rng){
    let a,b,c,d=0,x,izq,der,pasos,errores=[],pasoMal,B_,A_;
    if(nivel<=3){
      a=rng.entero(2,nivel===1?5:9)*(nivel===1?1:rng.signo());x=nivel===1?rng.entero(1,10):rng.noCero(-10,10);
      b=rng.noCero(-15,15);
      if(nivel===3){d=rng.noCero(-6,6);if(d===a)d+=1}   // ax + b = dx + e
      const e=(a-d)*x+b;
      izq=lineal([[a,'x'],[b,'']]);der=lineal([[d,'x'],[e,'']]);
      const A=a-d,B=e-b;
      pasos=[d?`\\(${lineal([[a,'x'],[-d,'x']])} = ${e} ${b<0?'+':'-'} ${Math.abs(b)}\\)`:`\\(${a===1?'':a===-1?'-':a}x = ${e} ${b<0?'+':'-'} ${Math.abs(b)}\\)`,`\\(${A===1?'':A===-1?'-':A}x = ${B}\\)`,`\\(x = ${frac(B,A)}\\)`];
      pasoMal={i:0,texto:`\\(${a===1?'':a===-1?'-':a}x = ${e} ${b<0?'-':'+'} ${Math.abs(b)}\\)`,por:`el ${b} pasó al otro lado sin cambiar de signo.`};
      if(A!==0){errores.push({valor:`x = ${frac(e+b,A,{tex:false})}`,si:v=>igualNum(v,(e+b)/A),por:`Pasaste el ${b} con el mismo signo: al cambiar de lado, ${b>0?'lo que suma pasa restando':'lo que resta pasa sumando'}.`});
        if(A!==1)errores.push({valor:`x = ${B}`,si:v=>igualNum(v,B),por:`Te faltó dividir entre ${A}: \\(${A}x = ${B}\\) da \\(x = ${frac(B,A)}\\).`});
        errores.push({valor:`x = ${frac(-B,A,{tex:false})}`,si:v=>igualNum(v,-B/A),por:'Revisa el signo al dividir: menos entre más da menos y menos entre menos da más.'});}
      x=B/A;B_=B;A_=A;
    }else{
      // a(x + b) = c x + e   (nivel 4: solución entera; nivel 5: fracción)
      a=rng.noCero(-6,6);if(Math.abs(a)===1)a=a*2;b=rng.noCero(-8,8);c=rng.noCero(-5,5);
      if(a-c===0||(nivel===5&&Math.abs(a-c)<2))c=a-(nivel===5?rng.elegir([2,3,-2,-3]):1);
      const A=a-c,ab=a*b;let e;
      if(nivel===4)e=A*rng.noCero(-9,9)+ab;else do e=rng.entero(-30,30);while((e-ab)%A===0);
      x=(e-ab)/A;
      izq=`${a===-1?'-':a}(${lineal([[1,'x'],[b,'']])})`;der=lineal([[c,'x'],[e,'']]);
      const B=e-ab;
      pasos=[`\\(${lineal([[a,'x'],[ab,'']])} = ${der}\\)`,`\\(${lineal([[a,'x'],[-c,'x']])} = ${e} ${ab<0?'+':'-'} ${Math.abs(ab)}\\)`,`\\(${A}x = ${B}\\)`,`\\(x = ${frac(B,A)}\\)`];
      pasoMal={i:0,texto:`\\(${lineal([[a,'x'],[b,'']])} = ${der}\\)`,por:`el ${a} también multiplica al ${b}.`};
      errores.push({valor:`x = ${frac(e-b,A,{tex:false})}`,si:v=>igualNum(v,(e-b)/A),por:`Al quitar el paréntesis, el ${a} multiplica a los dos términos: ${a}·${b} = ${ab}.`});
      errores.push({valor:`x = ${frac(-B,A,{tex:false})}`,si:v=>igualNum(v,-B/A),por:'Revisa el signo al dividir.'});
      x=B/A;B_=B;A_=A;
    }
    const sol=frac(B_,A_,{tex:false});
    return {
      enunciado:`Resuelve: \\(${izq} = ${der}\\)`,
      respuesta:`x = ${sol}`,
      verificar:v=>igualNum(v,x),
      pasos,errores,pasoMal,regla:R_ECU,
      pista:nivel>=4?'Primero quita el paréntesis multiplicando.':nivel===3?'Junta las x en un lado y los números en el otro.':'Primero pasa el número suelto al otro lado.',
      teclado:'mat'
    };
  }
};

export default {'alg/ecuacion-lineal':ecuacionLineal};
