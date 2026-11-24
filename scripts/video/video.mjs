/* npm run video [-- --solo promo|tutorial] [--escena N] [--sin-voz] [--musica ruta.mp3] [--sin-musica] [--solo-montar]
   Graba las escenas con la app real (grabar.mjs) y monta los videos (montar.mjs). Todo queda en videos/ (no va a git). */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const aqui=dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
const correr=(s,a)=>{const r=spawnSync(process.execPath,[join(aqui,s),...a],{stdio:'inherit'});if(r.status)process.exit(r.status)};
const de=(...ks)=>args.flatMap((x,i)=>ks.includes(x)?[x,...(['--solo','--escena','--musica'].includes(x)?[args[i+1]]:[])]:[]);
if(!args.includes('--solo-montar'))correr('grabar.mjs',de('--solo','--escena','--sin-build'));
correr('montar.mjs',de('--solo','--sin-voz','--musica','--sin-musica'));
