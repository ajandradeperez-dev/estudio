/* Errores de Python explicados para principiantes (sin DOM). explicarError({tipo, mensaje}, {desfase}) →
   {titulo, linea?, explicacion, consejo}. desfase: líneas que se agregaron antes del código de la persona (para que el
   número de línea sea el de SU código). */
const linea=(mensaje,desfase=0)=>{const m=[...String(mensaje||'').matchAll(/line (\d+)/g)].at(-1);const n=m?+m[1]-desfase:null;return n&&n>0?n:null};
const nombre=m=>(/name '([^']+)' is not defined/.exec(m)||[])[1];
const EXPLICA={
  NameError:m=>({explicacion:`Usaste ${nombre(m)?`«${nombre(m)}», `:''}una variable o función que no existe todavía.`,consejo:'Revisa cómo la escribiste (mayúsculas, acentos, guiones) y que la hayas creado antes de usarla. Si era un texto, ponlo entre comillas.'}),
  SyntaxError:m=>({explicacion:'Algo está mal escrito y Python no entiende la línea.',consejo:/never closed|unterminated|EOL|EOF/i.test(m)?'Falta cerrar algo: una comilla, un paréntesis o un corchete.':/expected ':'/i.test(m)?'Falta el «:» al final de la línea (if, for, while, def, class…).':'Revisa comillas, paréntesis y los dos puntos al final de if, for, while y def.'}),
  IndentationError:()=>({explicacion:'La sangría (los espacios al inicio de la línea) no es la que Python espera.',consejo:'Después de una línea que termina en «:» el bloque va con 4 espacios; las líneas del mismo bloque, con la misma sangría.'}),
  TabError:()=>({explicacion:'Mezclaste tabuladores y espacios en la sangría.',consejo:'Usa siempre 4 espacios (la tecla ⇥ del teclado de la app los pone).'}),
  TypeError:m=>({explicacion:/can only concatenate str|must be str, not/.test(m)?'Intentaste pegar un texto con un número usando +.':/missing \d+ required positional argument/.test(m)?'Llamaste a una función sin todos los datos que pide.':/takes \d+ positional argument/.test(m)?'Le pasaste a una función más datos de los que pide.':/not subscriptable/.test(m)?'Usaste [ ] con algo que no es lista, texto ni diccionario.':/not callable/.test(m)?'Pusiste ( ) después de algo que no es una función.':'Combinaste tipos que no van juntos.',
    consejo:/concatenate|must be str/.test(m)?'Convierte el número con str(), o usa una f-string: f"Total: {x}".':/argument/.test(m)?'Revisa cuántos parámetros tiene el def y cuántos valores pasas al llamarla.':'Revisa de qué tipo es cada valor (type() te lo dice).'}),
  ValueError:()=>({explicacion:'El tipo es correcto pero el valor no sirve, por ejemplo int("hola") o int("3.5").',consejo:'Revisa que el texto sea un número bien escrito (int solo enteros; float acepta decimales con punto).'}),
  ZeroDivisionError:()=>({explicacion:'Dividiste entre cero.',consejo:'Antes de dividir, revisa con un if que el divisor no sea 0, o usa try/except ZeroDivisionError.'}),
  IndexError:()=>({explicacion:'Pediste una posición que no existe en la lista o el texto.',consejo:'Los índices van de 0 a len(lista) − 1. Revisa el rango de tu for.'}),
  KeyError:m=>({explicacion:`La clave ${m?.split('\n').filter(Boolean).at(-1)?.replace(/^KeyError:\s*/,'')||''} no está en el diccionario.`,consejo:'Revisa cómo está escrita, o usa d.get(clave, valor_por_defecto) para que no falle.'}),
  AttributeError:()=>({explicacion:'Ese valor no tiene el método o atributo que usaste (por ejemplo, un número no tiene .upper()).',consejo:'Revisa el tipo del valor y el nombre del método.'}),
  FileNotFoundError:()=>({explicacion:'El archivo que quieres abrir no existe.',consejo:'Revisa el nombre, o créalo antes con open(nombre, "w").'}),
  EOFError:()=>({explicacion:'El programa pidió datos con input() pero ya no había más.',consejo:'Escribe los datos en el cuadro «Entrada», uno por línea, en el orden en que los pide el programa.'}),
  RecursionError:()=>({explicacion:'Una función se llamó a sí misma demasiadas veces.',consejo:'Revisa que tenga un caso base que termine.'}),
  ModuleNotFoundError:()=>({explicacion:'Ese módulo no existe aquí.',consejo:'Revisa el nombre (math, random, datetime…).'}),
  ImportError:()=>({explicacion:'No se pudo importar ese nombre del módulo.',consejo:'Revisa el nombre de la función o usa import módulo.'}),
  UnboundLocalError:()=>({explicacion:'Dentro de una función usaste una variable antes de darle valor (y más abajo le asignas uno).',consejo:'Pásala como parámetro o devuélvela con return.'}),
  Tiempo:()=>({explicacion:'El programa no terminó: probablemente es un bucle infinito.',consejo:'Revisa que la condición de tu while cambie dentro del bucle (por ejemplo, i += 1).'}),
  Detenido:()=>({explicacion:'Detuviste el programa.',consejo:'Cuando quieras, ejecútalo de nuevo.'}),
  Carga:()=>({explicacion:'No se pudo cargar Python en este teléfono.',consejo:'La primera vez necesita internet para descargarlo (unos 10 MB); después funciona sin conexión.'})
};
export function explicarError(error,{desfase=0}={}){
  if(!error)return null;
  const tipo=error.tipo||'Error',msg=String(error.mensaje||'');
  const ex=(EXPLICA[tipo]||(()=>({explicacion:'Python encontró un error al ejecutar el programa.',consejo:'Lee la última línea del mensaje: dice el tipo de error.'})))(msg);
  const ultima=msg.split('\n').filter(Boolean).at(-1)||tipo;
  return {titulo:tipo,linea:['Tiempo','Detenido','Carga'].includes(tipo)?null:linea(msg,desfase),original:ultima,...ex};
}
export const TIPOS_EXPLICADOS=Object.keys(EXPLICA);
