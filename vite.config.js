import {defineConfig} from 'vite';

// Puertos fijos: el progreso vive en localStorage, que depende del origen (incluido el puerto).
// Si Vite cambiara de puerto al estar ocupado, la app abriría "vacía". Con strictPort falla en vez de cambiar.
export default defineConfig({
  server:{port:5173,strictPort:true},
  preview:{port:4173,strictPort:true}
});
