/* Datos del simulador de VPN IPsec: las dos sedes, la configuración correcta, opciones y escenarios con errores */

// Datos fijos de cada sede (no se editan en el simulador). m = Matriz, s = Sucursal
export const sitios={
 m:{nombre:'Matriz',wan:'200.10.10.2',lan:'192.168.10.0/24',tunel:'a-Sucursal'},
 s:{nombre:'Sucursal',wan:'198.51.100.20',lan:'192.168.20.0/24',tunel:'a-Matriz'}
};

// gw = IP remota, psk = clave, enc/hash/dh/ike = fase 1; src/dst/enc2 = fase 2 (red local, red remota, cifrado)
export const configBase={
 m:{gw:'198.51.100.20',psk:'CiberLab!2026',enc:'aes256',hash:'sha256',dh:'14',ike:'2',src:'192.168.10.0/24',dst:'192.168.20.0/24',enc2:'aes256'},
 s:{gw:'200.10.10.2',psk:'CiberLab!2026',enc:'aes256',hash:'sha256',dh:'14',ike:'2',src:'192.168.20.0/24',dst:'192.168.10.0/24',enc2:'aes256'}
};

// [valor en FortiOS, etiqueta]
export const cifrados=[['aes256','AES-256'],['aes128','AES-128'],['3des','3DES (obsoleto)'],['des','DES (inseguro)']];
export const hashes=[['sha256','SHA-256'],['sha512','SHA-512'],['sha1','SHA-1 (obsoleto)'],['md5','MD5 (inseguro)']];
export const gruposDH=[['14','14 · MODP 2048'],['19','19 · ECP 256'],['20','20 · ECP 384'],['21','21 · ECP 521'],['5','5 · MODP 1536 (débil)'],['2','2 · MODP 1024 (débil)']];
export const versionesIKE=[['2','IKEv2'],['1','IKEv1']];

// Cada escenario parte de configBase y aplica sus cambios. El síntoma no revela el error.
export const escenarios=[
 {n:'Escenario 1',sintoma:'Un técnico configuró la Sucursal por teléfono, dictando los datos, y el túnel no levanta.',
  cambios:{m:{ike:'1'},s:{ike:'1',psk:'CiberLab!2025'}}},
 {n:'Escenario 2',sintoma:'La Sucursal se configuró con una plantilla antigua del proveedor y el túnel nunca termina de negociar.',
  cambios:{s:{hash:'sha1',dh:'5'}}},
 {n:'Escenario 3',sintoma:'Las dos sedes se autentican, pero el túnel no queda arriba y los usuarios no llegan a la otra red.',
  cambios:{s:{dst:'192.168.1.0/24'}}}
];
