# Alerta Gal - Prototipo Funcional

Este repositorio contiene el prototipo funcional de **Alerta Gal**, una plataforma integral de reporte, gestión y seguimiento de incidencias ciudadanas diseñada para conectar ciudadanos, centrales de operaciones y unidades de Serenazgo de manera ágil e interactiva.

Este prototipo se ha desarrollado íntegramente como una Single Page Application (SPA) para demostrar los flujos de usuario, la experiencia de interfaz (UI/UX) y la lógica de estado sin necesidad de desplegar una infraestructura backend en esta fase de evaluación.

## Requisitos Previos 📋
Para levantar este proyecto en un entorno local, necesitas tener instalado:
- [Node.js](https://nodejs.org/) (Versión 18.x o superior recomendada)
- Un gestor de paquetes como `npm` (incluido con Node.js).

## Instalación y Ejecución Local 🔧

Sigue estos pasos para probar la plataforma en tu máquina:

1. **Clona este repositorio y navega al directorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd grego-gal-prototype
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Visualiza la aplicación**
   Abre tu navegador web e ingresa a la dirección local que arroje la consola (generalmente [http://localhost:5173/](http://localhost:5173/)).

## Guía de Uso del Prototipo 📖

La aplicación cuenta con un **Selector de Roles** flotante (un botón morado en la esquina superior derecha). Esto permite simular los distintos perfiles de usuario sin tener que manejar sesiones múltiples:

1. **Ciudadano A / B**: Interfaz móvil que permite crear un reporte geolocalizado en la zona. Requiere un inicio de sesión "simulado" (bastará con ingresar un DNI inventado).
2. **Central de Operaciones (Operadora)**: Centro de mando táctico (versión escritorio). Permite gestionar las alertas entrantes, visualizar el mapa de calor con pines, asignar unidades libres y monitorear los tiempos promedio de respuesta.
3. **Sereno**: Interfaz en terreno para el personal asignado. Permite aceptar casos, trazar rutas simuladas hacia el punto y marcar las incidencias como atendidas.
4. **Trazabilidad (Ruta /seguimiento)**: Alerta Gal incluye un portal de tracking público. Ingresando el teléfono, un ciudadano puede ver la traza temporal exacta (timestamps) de las acciones de Serenazgo sobre su reporte.

*Nota sobre la persistencia:* El login utiliza `localStorage` para facilitar las pruebas del usuario, pero se limpia intencionalmente con cada refresco (F5) para forzar el flujo de inicio de sesión durante las evaluaciones. De manera similar, los datos de incidencias y serenos viven en un estado global volátil (mocked data); recargar la página devuelve el prototipo a su estado inicial.

## Estructura del Código 📁
- `/src/components`: Componentes reutilizables (LoginModal, ModalTraza, RoleSwitcher).
- `/src/context`: Lógica del motor de estado global (`AlertaContext`).
- `/src/views`: Pantallas maestras para cada perfil (CitizenView, OperatorView, etc.).
- `/src/types`: Definiciones estructurales (Interfaces de TypeScript). 
- `index.css`: Ajustes globales y reseteos para comportamiento progresivo.

## Tecnologías Principales 🚀
Para construir este prototipo de **Alerta Gal**, hemos diseñado una arquitectura frontend moderna y escalable, orientada a Single Page Applications (SPA) y preparada para comportarse como una Progressive Web App (PWA).

Resumen:
- **React 19 & TypeScript**: Núcleo de la aplicación asegurando tipado estricto.
- **Vite**: Entorno de desarrollo ultra rápido y optimización de compilación.
- **Material-UI (MUI v9) & Emotion**: Sistema de diseño corporativo y adaptativo.
- **Leaflet & React-Leaflet**: Motor de mapas interactivos tácticos para geolocalización.
- **React Context API**: Manejo de estado global para emular sincronización en tiempo real.


Detalle:
### 1. Núcleo (Core Stack)
- **React 19**: La librería principal para construir las interfaces de usuario interactivas basadas en componentes.
- **TypeScript**: Para tener un tipado estricto. Esto nos asegura que toda la estructura de datos (alertas, serenos, estados, historiales) sea consistente y libre de errores antes de compilar.
- **Vite**: El empaquetador (bundler) de nueva generación. Nos permite un entorno de desarrollo extremadamente rápido (casi instantáneo) y builds de producción altamente optimizados.

### 2. Diseño y Componentes UI (Design System)
- **Material-UI (MUI v9)**: El framework de diseño de Google. Nos ha permitido implementar modales, botones, inputs, tabs y tipografías (Typography) de manera rápida con una estética profesional y robusta. 
- **Emotion (`@emotion/react` / `@emotion/styled`)**: Motor de estilos CSS-in-JS utilizado por debajo de MUI para customizar componentes (como la caja estilo Google Maps).
- **Tipografía**: Hemos utilizado **Inter** (`@fontsource/inter`) para darle un aspecto limpio y moderno al texto en general, y **Roboto Mono** (`@fontsource/roboto-mono`) específicamente para tokens (ej. `#F3A9`) y temporizadores, dándoles ese look de "panel de control".

### 3. Mapas y Geolocalización
- **Leaflet & React-Leaflet (`leaflet`, `react-leaflet`)**: Es el motor de mapas de código abierto más ligero y versátil. Lo utilizamos para incrustar los mapas dinámicos tácticos tanto en la vista del ciudadano como en el Centro de Operaciones. Leaflet nos permite dibujar los pines de colores personalizados (con formato SVG puro inyectado a través de `L.DivIcon`) sin depender de costos de licencias pesadas en esta etapa de prototipo.

### 4. Enrutamiento (Navegación)
- **React Router DOM v7**: Para manejar las rutas de la aplicación de manera fluida y sin recargar la página. Actualmente maneja el inicio (`/`), el acceso directo al reporte (`/r`) y la vista pública del ciudadano (`/seguimiento`).

### 5. Herramientas Especializadas
- **QRCode React (`qrcode.react`)**: Librería ultra-ligera que renderiza códigos QR en vivo. Es lo que usamos en el modal de la Central de Operaciones para mostrar el QR de seguimiento al ciudadano.
- **Date-fns (`date-fns`)**: Utilidad para el manejo y formateo de fechas.
- **Iconografía**: Combinación de **Material Icons** (`@mui/icons-material`) para elementos estándar de interfaz, y **Lucide React** (`lucide-react`) cuando se requiere un trazo más fresco y moderno.

### 6. Arquitectura de Estado (Manejo de Datos)
- **Context API de React (`AlertaContext`)**: En lugar de configurar herramientas pesadas y complejas como Redux, diseñamos un proveedor de estado global nativo (un reducer) que mantiene sincronizadas todas las incidencias (`alertas`) y unidades patrulla (`serenos`) en tiempo real en la memoria del navegador.
