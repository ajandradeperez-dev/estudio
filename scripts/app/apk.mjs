/* La app Android nativa (Capacitor, PROMPT-APP-NATIVA).
   node scripts/app/apk.mjs --solo-web   (npm run build:app): compila la web para la app en dist-app/ (base '/', sin service
                                          worker) y la copia al proyecto Android (npx cap sync).
   node scripts/app/apk.mjs [--debug] [--aab] (npm run apk): además compila el APK con Gradle y deja EstudioPlus.apk (y
                                          EstudioPlus.aab con --aab) firmado con la MISMA llave de la TWA (~/.ciberlab-firma).
   Contraseñas de la llave: variables ESTUDIO_KEYSTORE_PASSWORD y ESTUDIO_KEY_PASSWORD (o las BUBBLEWRAP_… de siempre); si
   no están, se leen en memoria de ~/.ciberlab-firma/contraseñas.txt. Nunca se escriben en un archivo ni se muestran: van a
   Gradle como variables de entorno (ORG_GRADLE_PROJECT_estudio…).
   Herramientas: el JDK 21 de Android Studio (JAVA_HOME) y el Android SDK (ANDROID_HOME); se buscan solos en Windows. */
import {execSync} from 'node:child_process';
import {existsSync,readFileSync,copyFileSync,statSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {homedir} from 'node:os';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','..'),arg=x=>process.argv.includes(x);
const ejecutar=(cmd,env={},cwd=raiz)=>execSync(cmd,{cwd,stdio:'inherit',env:{...process.env,...env}});
const version=(()=>{try{return `${new Date().toISOString().slice(0,10)} · ${execSync('git rev-parse --short HEAD',{cwd:raiz}).toString().trim()}`}catch(e){return ''}})();

console.log('▶ Web de la app (dist-app/)');
ejecutar('npx vite build',{APP_NATIVA:'1',APP_VERSION:process.env.APP_VERSION||version});
// Python sin internet: Pyodide dentro del APK (unos 12 MB sin comprimir); --sin-python lo deja fuera (se baja de jsDelivr)
if(!arg('--sin-python')){const de=join(raiz,'node_modules','pyodide'),a=join(raiz,'dist-app','pyodide');mkdirSync(a,{recursive:true});
  for(const f of ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])copyFileSync(join(de,f),join(a,f))}
const java=process.env.JAVA_HOME||['C:/Program Files/Android/Android Studio/jbr'].find(existsSync);
const sdk=process.env.ANDROID_HOME||[join(homedir(),'AppData','Local','Android','Sdk')].find(existsSync);
const envAndroid={...(java?{JAVA_HOME:java}:{}),...(sdk?{ANDROID_HOME:sdk,ANDROID_SDK_ROOT:sdk}:{})};
console.log('▶ Copiar al proyecto Android (cap sync)');
ejecutar('npx cap sync android',envAndroid);
if(arg('--solo-web'))process.exit(0);

// firma
const firma=join(homedir(),'.ciberlab-firma');
let pass={almacen:process.env.ESTUDIO_KEYSTORE_PASSWORD||process.env.BUBBLEWRAP_KEYSTORE_PASSWORD,llave:process.env.ESTUDIO_KEY_PASSWORD||process.env.BUBBLEWRAP_KEY_PASSWORD};
if(!arg('--debug')&&(!pass.almacen||!pass.llave)&&existsSync(join(firma,'contraseñas.txt'))){
  const t=readFileSync(join(firma,'contraseñas.txt'),'utf8'),de=re=>t.match(re)?.[1]?.trim();
  pass={almacen:pass.almacen||de(/Contraseña del almacén[^:]*:\s*(.+)/),llave:pass.llave||de(/Contraseña de la llave[^:]*:\s*(.+)/)};
}
const envFirma=arg('--debug')?{}:{ORG_GRADLE_PROJECT_estudioStoreFile:join(firma,'ciberlab.keystore'),ORG_GRADLE_PROJECT_estudioKeyAlias:'ciberlab',
  ORG_GRADLE_PROJECT_estudioStorePassword:pass.almacen||'',ORG_GRADLE_PROJECT_estudioKeyPassword:pass.llave||''};
if(!arg('--debug')&&(!existsSync(join(firma,'ciberlab.keystore'))||!pass.almacen||!pass.llave)){console.error('✗ Falta la llave o sus contraseñas (~/.ciberlab-firma). Usa --debug para un APK sin firmar de prueba.');process.exit(1)}
const tareas=[arg('--debug')?'assembleDebug':'assembleRelease',...(arg('--aab')?['bundleRelease']:[])];
console.log(`▶ Gradle: ${tareas.join(' ')}`);
// (con la ruta completa: en Windows, con NoDefaultCurrentDirectoryInExePath, cmd no busca en la carpeta actual)
ejecutar(`"${join(raiz,'android-app',process.platform==='win32'?'gradlew.bat':'gradlew')}" ${tareas.join(' ')} --console=plain`,{...envAndroid,...envFirma},join(raiz,'android-app'));
const salida=join(raiz,'android-app','app','build','outputs');
const apk=arg('--debug')?join(salida,'apk','debug','app-debug.apk'):join(salida,'apk','release','app-release.apk');
const destino=join(raiz,arg('--debug')?'EstudioPlus-debug.apk':'EstudioPlus.apk');copyFileSync(apk,destino);
if(arg('--aab'))copyFileSync(join(salida,'bundle','release','app-release.aab'),join(raiz,'EstudioPlus.aab'));
console.log(`✓ ${destino} (${(statSync(destino).size/1048576).toFixed(1)} MB)${arg('--aab')?' y EstudioPlus.aab':''}`);
