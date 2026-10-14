# Plan de contenido

Fuente de verdad del contenido de la app. `npm run revisar` comprueba que cada `src/materias/<materia>/temas.js` siga este árbol
(mismos temas en el mismo orden, mismas habilidades y un nodo "Próximamente" por cada pendiente).

- `- [x] Título `id`` → la habilidad existe (lección, generador o banco). Su id va en el progreso: no se cambia.
- `- [ ] Título` → pendiente; en la app se ve como ⚪ Próximamente. Al crearla, ponle id en temas.js y márcala aquí con [x].
- `- 🔧 Título → ruta` → enlace a una herramienta (no cuenta para el dominio).
- Estado de cada tema en la app (src/nucleo/contenido.js): ✅ completo (todas sus habilidades con mini explicación, ejemplo resuelto,
  ejemplo con huecos y ejercicios básicos y de procedimiento; sin pendientes; al menos 1 reto de aplicación o escenario),
  🟡 en construcción, ⚪ próximamente.
- Retos de aplicación y escenarios: src/nucleo/retos.js (botón "🎯 Retos y escenarios" de cada materia y tema).
- Escenarios por materia (además de los de cada tema): Ciberseguridad → laboratorio de incidentes, diseño de red pequeña, auditoría de
  política de firewall, VPN entre sedes · Matemáticas → problemas de aplicación (optimización, física, economía, redes) y simulacro
  mixto por tema · Ciencia de datos → analizar un dataset generado de principio a fin · Inglés → el jefe de cada unidad.

## 🛡️ Ciberseguridad `ciberseguridad`

### Fundamentos de redes `redes-y-protocolos`

- [ ] Modelos OSI y TCP/IP
- [ ] Direcciones IP y clases
- [x] Binario, decimal y hexadecimal `binario-hex`
- [x] Subredes CIDR `subredes-cidr`
- [x] Máscara de subred /24 a /30 `mascaras`
- [x] Prefijo para N hosts `prefijo-hosts`
- [ ] VLSM
- [ ] IPv6 básico
- [x] Puertos y servicios `puertos-y-servicios`
- [ ] DNS
- [ ] DHCP
- [ ] ARP

### Conmutación y enrutamiento `conmutacion`

- [ ] Switches, MAC y tablas
- [ ] VLAN y trunks
- [ ] STP (concepto)
- [ ] Enrutamiento estático
- [ ] Rutas por defecto
- [ ] OSPF (concepto)
- [ ] Wi-Fi y seguridad WPA2/WPA3

### Firewalls `firewalls`

- [ ] Stateless vs stateful
- [x] Políticas de firewall `politicas-firewall`
- [ ] Objetos y servicios
- [x] NAT/PAT en el firewall `nat`
- [ ] Zonas
- [x] FortiGate, Palo Alto, Cisco ASA y pfSense `marcas`
- [ ] Buenas prácticas y auditoría de reglas

### VPN y criptografía `vpn-cripto`

- [x] Simétrica, asimétrica, hash y firmas `cripto`
- [ ] Certificados y PKI
- [ ] TLS
- [x] IPsec: fases 1 y 2 `vpn-fases`
- [ ] SSL VPN
- [ ] Troubleshooting de túneles

### Seguridad defensiva `defensa`

- [ ] CIA y gestión de riesgo
- [ ] Autenticación y MFA
- [ ] Gestión de parches
- [ ] Hardening
- [ ] Registros y SIEM
- [ ] IDS/IPS
- [x] Lectura de logs y detección de ataques `logs`
- [x] Respuesta a incidentes `incidentes`
- [x] Preguntas de seguridad `repaso-seguridad`
- [ ] Copias de seguridad

### Escenarios y herramientas `herramientas`

- 🔧 Laboratorio de incidentes → `incidentes`
- 🔧 Simulador de políticas → `fw`
- 🔧 Simulador de VPN → `vpn`
- 🔧 Calculadora de subredes → `subred`
- 🔧 Modelo OSI y puertos → `redes`
- 🔧 VLANs y Wi-Fi → `vlan`
- 🔧 Comparar marcas → `marcas`
- 🔧 FortiGate a fondo → `forti`
- 🔧 Examen rápido → `quiz`

## 🇺🇸 Inglés (MCER, 4 vertientes de Nation) `ingles`

### A1 · Primeros pasos `a1`

- [ ] Presentarse
- [ ] Números, fechas y hora
- [x] Verbo to be `verbo-to-be`
- [x] Presente simple `presente-simple`
- [x] Artículos: a, an, the `articulos`
- [x] Plurales `plurales`
- [x] There is / there are `there-is-there-are`
- [x] Preposiciones de tiempo y lugar `preposiciones`
- [x] Can y can’t `can`
- [ ] Rutinas
- [ ] Comida y compras
- [x] Frases hechas (chunks) `chunks`

### A2 · Contar y planear `a2`

- [x] Pasado simple `pasado-simple`
- [x] Futuro: going to y will `futuro-going-to-will`
- [ ] Comparativos y superlativos
- [ ] Countable / uncountable
- [x] Presente continuo `presente-continuo`
- [ ] Direcciones y viajes
- [ ] Salud
- [x] Vocabulario de trabajo y falsos amigos `vocabulario-trabajo`
- [ ] Pronunciación: -ed, -s y TH
- [x] Orden de las palabras `orden-palabras`
- [x] Traducir frases cortas `traducir`

### B1 · Opinar y resolver `b1`

- [x] Present perfect vs past simple `presente-perfecto`
- [ ] Condicionales 0, 1 y 2
- [ ] Voz pasiva básica
- [ ] Modales: should, must, have to
- [ ] Oraciones relativas
- [ ] Phrasal verbs frecuentes
- [ ] Email formal e informal
- [ ] Contar historias
- [ ] Opinar y argumentar
- [ ] Entrevista de trabajo

### B2 · Inglés profesional `b2`

- [ ] Condicional 3 y mixtos
- [ ] Reported speech
- [ ] Pasiva avanzada
- [ ] Conectores
- [ ] Inglés técnico de TI y ciberseguridad
- [ ] Presentaciones
- [ ] Debates
- [ ] Comprensión de audios naturales

### Hablar y escuchar `hablar-escuchar`

- 🔧 Hablar: tu mapa → `hablar`
- 🔧 Unidad 1: Presentarte → `hablar/u/presentarte`
- 🔧 Unidad 2: Rutina y trabajo → `hablar/u/rutina-trabajo`
- 🔧 Unidad 3: Pedir y comprar → `hablar/u/pedir-comprar`
- 🔧 Unidad 4: Ciudad y viajes → `hablar/u/ciudad-viajes`
- 🔧 Unidad 5: Contar el pasado → `hablar/u/contar-pasado`
- 🔧 Unidad 6: Trabajo en TI → `hablar/u/trabajo-ti`
- 🔧 Conversación con IA → `hablar/ia`

## ➗ Matemáticas `matematicas`

### Aritmética y prealgebra `prealgebra`

- [ ] Fracciones
- [ ] Porcentajes
- [ ] Potencias y raíces
- [ ] Orden de operaciones
- [ ] Notación científica

### Álgebra `algebra-basica`

- [x] Términos semejantes y propiedad distributiva `expresiones`
- [x] Ecuaciones lineales `ecuaciones-lineales`
- [ ] Desigualdades
- [x] Sistemas de ecuaciones 2×2 `sistemas-2x2`
- [ ] Sistemas 3×3
- [ ] Productos notables
- [x] Factorización `factorizacion`
- [ ] Fracciones algebraicas
- [ ] Ecuaciones cuadráticas
- [x] Leyes de exponentes `exponentes`
- [ ] Exponenciales y logaritmos
- [ ] Funciones y gráficas

### Trigonometría `trigonometria`

- [ ] Razones trigonométricas
- [ ] Círculo unitario
- [ ] Identidades básicas
- [ ] Ecuaciones trigonométricas

### Álgebra lineal `algebra-lineal`

- [x] Vectores `vectores`
- [x] Operaciones con vectores y producto punto `operaciones-producto-punto`
- [x] Producto punto `producto-punto`
- [x] Ángulo entre vectores `angulo-vectores`
- [ ] Producto cruz
- [x] Multiplicación de matrices `matrices`
- [x] Sistemas por Gauss `gauss`
- [ ] Gauss-Jordan
- [x] Determinantes `determinantes`
- [x] Inversa de una matriz 2×2 `inversa`
- [ ] Espacios vectoriales
- [ ] Independencia lineal y base
- [ ] Transformaciones lineales
- [ ] Valores y vectores propios

### Cálculo diferencial `calculo-diferencial`

- [x] Límites `limites`
- [ ] Continuidad
- [ ] Definición de derivada
- [x] Derivada de polinomios `derivada-polinomio`
- [x] Regla del producto `regla-producto`
- [x] Regla del cociente `regla-cociente`
- [x] Regla de la cadena `regla-cadena`
- [ ] Derivadas trigonométricas, exponenciales y logarítmicas
- [ ] Derivación implícita
- [ ] Máximos y mínimos
- [ ] Optimización
- [ ] Razón de cambio
- [ ] Regla de L’Hôpital

### Cálculo integral `calculo-integral`

- [x] Antiderivadas básicas `antiderivadas`
- [x] Integral definida y Teorema Fundamental `integral-definida`
- [x] Integración por sustitución `sustitucion`
- [ ] Integración por partes
- [ ] Fracciones parciales
- [ ] Sustitución trigonométrica
- [x] Área bajo la curva y entre curvas `area-curva`
- [ ] Volúmenes de revolución
- [ ] Integrales impropias

## 📊 Ciencia de datos `ciencia-datos`

### Estadística descriptiva `estadistica`

- [x] Tipos de variables `tipos-de-variables`
- [x] Media, mediana y moda `tendencia-central`
- [x] Rango y desviación estándar `dispersion`
- [x] Percentiles y boxplot `percentiles`
- [ ] Tablas de frecuencia

### Probabilidad `probabilidad`

- [ ] Conteo: permutaciones y combinaciones
- [x] Probabilidad básica `probabilidad-basica`
- [x] Eventos combinados y probabilidad condicional `probabilidad-compuesta`
- [ ] Teorema de Bayes
- [ ] Variables aleatorias
- [ ] Distribución binomial
- [ ] Distribución normal

### Inferencia `inferencia`

- [ ] Muestreo
- [ ] Intervalos de confianza
- [ ] Pruebas de hipótesis
- [ ] Correlación y regresión lineal

### Python para datos `python-pandas`

- [ ] Tipos, listas, diccionarios y funciones
- [x] Primeros pasos con pandas `pandas-basico`
- [x] ¿Qué imprime este código? `pandas-salida`
- [ ] Filtrar, agrupar y unir con pandas
- [ ] Limpieza de datos
- [x] Leer una gráfica de barras `leer-grafica`
- [ ] Qué gráfica usar

### Machine learning básico `machine-learning`

- [ ] Qué es y tipos de aprendizaje
- [ ] Entrenamiento y prueba
- [ ] Regresión vs clasificación
- [x] Exactitud, precisión y recall `ml-metricas`
- [ ] Sobreajuste
- [ ] k-NN y árboles (intuición)

## 📚 Lectura `lectura` (⚪ Próximamente)

Agregar libros, avance por capítulos, citas, notas y repaso de ideas clave. Modelo de datos documentado en src/materias/lectura/materia.js y en CLAUDE.md.
