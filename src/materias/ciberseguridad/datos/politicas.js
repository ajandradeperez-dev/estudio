/* Datos del simulador de políticas: servicios, políticas iniciales, marcas y paquetes de ejemplo */
export const services={HTTP:{p:'tcp',port:80},HTTPS:{p:'tcp',port:443},SSH:{p:'tcp',port:22},DNS:{p:'udp',port:53},RDP:{p:'tcp',port:3389},SMTP:{p:'tcp',port:25},ALL:{p:'any',port:'any'}};

// Se modifica en tiempo de ejecución (subir, bajar, borrar, agregar)
export const policies=[
 {id:1,name:'LAN-a-Internet',si:'lan',di:'wan',src:'192.168.10.0/24',dst:'all',svc:'HTTPS',act:'accept',nat:true,prof:'AV+WebFilter'},
 {id:2,name:'LAN-DNS',si:'lan',di:'wan',src:'192.168.10.0/24',dst:'8.8.8.8/32',svc:'DNS',act:'accept',nat:true,prof:'-'},
 {id:3,name:'Admin-SSH-DMZ',si:'lan',di:'dmz',src:'192.168.10.50/32',dst:'10.0.50.0/24',svc:'SSH',act:'accept',nat:false,prof:'-'},
 {id:4,name:'Web-publico-VIP',si:'wan',di:'dmz',src:'all',dst:'10.0.50.10/32',svc:'HTTPS',act:'accept',nat:false,prof:'IPS'},
 {id:5,name:'Bloquear-RDP',si:'wan',di:'lan',src:'all',dst:'all',svc:'RDP',act:'deny',nat:false,prof:'-'},
];

export const vendors={
 forti:{n:'Fortinet FortiGate',os:'FortiOS'},
 pa:{n:'Palo Alto',os:'PAN-OS'},
 asa:{n:'Cisco ASA',os:'ASA'},
 pf:{n:'pfSense',os:'pfSense (web)'}
};

// [etiqueta, entrada, salida, IP origen, IP destino, protocolo, puerto]
export const examples=[['Usuario navega web','lan','wan','192.168.10.25','142.250.1.1','tcp',443],['Usuario usa SSH a Internet','lan','wan','192.168.10.25','203.0.113.9','tcp',22],['Internet intenta RDP','wan','lan','198.51.100.7','192.168.10.25','tcp',3389],['Visitante al servidor web','wan','dmz','198.51.100.7','10.0.50.10','tcp',443],['Admin entra por SSH a DMZ','lan','dmz','192.168.10.50','10.0.50.10','tcp',22]];
