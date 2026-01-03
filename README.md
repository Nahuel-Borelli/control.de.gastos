# Frontend - Control de Gastos PWA

Este directorio contiene la aplicación cliente, construida como una PWA con HTML, CSS y JavaScript (vanilla).

## Estructura de Archivos

- **`index.html`**: El punto de entrada principal de la aplicación. Contiene la estructura de las dos pestañas (Carga y Resumen).
- **`styles.css`**: Todos los estilos de la aplicación, con un enfoque *mobile-first*.
- **`app.js`**: El orquestador principal. Maneja la lógica de la UI, la navegación, los formularios, la carga de datos desde la API y la comunicación con el Service Worker. Es un módulo de JavaScript (`type="module"`).
- **`idb.js`**: Un módulo auxiliar que abstrae toda la complejidad de la interacción con IndexedDB. Proporciona funciones simples para guardar y recuperar gastos pendientes.
- **`manifest.json`**: Archivo de manifiesto de la PWA, que permite que la aplicación sea "instalable".
- **`service-worker.js`**: El corazón de la PWA. Gestiona el cacheo de la aplicación y la sincronización en segundo plano.

## Funcionalidad PWA

### Carga Offline (Cache-First)

El Service Worker utiliza una estrategia de "cache-first". En el evento `install`, guarda los archivos principales de la aplicación (HTML, CSS, JS) en la **Cache API**.

Cuando la aplicación solicita uno de estos archivos, el Service Worker intercepta la petición y la sirve directamente desde la caché, resultando en una carga casi instantánea y permitiendo que la aplicación se abra sin conexión a internet.

### Sincronización de Datos en Segundo Plano (Background Sync)

Esta es la característica más avanzada de la PWA.

1.  **Captura del Gasto:** Cuando el usuario envía el formulario de gasto, `app.js` no intenta enviar los datos a la API directamente. En su lugar, los guarda en una base de datos local del navegador, **IndexedDB**, a través del módulo `idb.js`.
2.  **Registro de Sincronización:** Inmediatamente después de guardar el gasto en IndexedDB, `app.js` le pide al Service Worker que registre una tarea de sincronización con la etiqueta `'sync-new-gastos'`.
3.  **Ejecución en Segundo Plano:** El navegador toma el control. Cuando detecta que el dispositivo tiene conexión a internet, activa el Service Worker (incluso si la pestaña de la app está cerrada) y dispara el evento `sync`.
4.  **Envío de Datos:** El listener del evento `sync` en `service-worker.js` se ejecuta, lee todos los gastos pendientes de IndexedDB y los envía uno por uno a la API (`POST /gastos`). Si un gasto se envía con éxito, se elimina de IndexedDB. Si falla por un error de red, permanece en la base de datos para ser reintentado en la próxima sincronización.
