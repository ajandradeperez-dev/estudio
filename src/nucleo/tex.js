/* Ajustes al TeX antes de dibujarlo con KaTeX (sin DOM: también lo usa npm run revisar).
   - \lim_{x\to a} en línea pone el subíndice al lado («limₓ→₋₂») y, en letra chica, «x→−2» se lee como «x→→2».
     Con \limits el subíndice va abajo, como en el libro, y un espacio fino separa la flecha del signo menos. */
export const prepararTex=s=>String(s)
  .replace(/\\lim(?![a-zA-Z])(?!\s*\\(?:no)?limits)\s*_/g,'\\lim\\limits_')
  .replace(/\\to\s*(?=[-−])/g,'\\to\\,');
