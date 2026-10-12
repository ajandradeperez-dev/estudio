export const $=s=>document.querySelector(s);
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- utilidades IP ---------- */
export const ip2n=ip=>{const p=ip.trim().split('.').map(Number);if(p.length!==4||p.some(x=>isNaN(x)||x<0||x>255))return null;return((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3]};
export const n2ip=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
export const mask=b=>b===0?0:(0xFFFFFFFF<<(32-b))>>>0;
export function inNet(ip,net){ if(net==='all')return true; const [a,b]=net.split('/'); const n=ip2n(ip),m=ip2n(a); if(n==null||m==null)return false; const bits=b===undefined?32:+b; return ((n&mask(bits))>>>0)===((m&mask(bits))>>>0);}
