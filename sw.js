// Guarda una copia de la app en el celular: abre al instante, incluso con mala señal.
// Al abrirla muestra la copia guardada y, por detrás, descarga la versión nueva para la próxima vez.
// Al publicar cambios grandes, subir el número de versión para forzar la actualización.
const VERSION = "viajes-stange-v14";
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png", "./icono-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(nombres => Promise.all(nombres.filter(n => n !== VERSION).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const pedido = e.request;
  // Solo los archivos de la app de conductores; la planilla de Google, el panel, la instalación y la prueba pasan directo
  const url = new URL(pedido.url);
  if (pedido.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/oficina") || url.pathname.includes("/instalar") || url.pathname.includes("/demo")) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(pedido, { ignoreSearch: true });
    const nuevo = fetch(pedido).then(r => { if (r.ok) cache.put(pedido, r.clone()); return r; }).catch(() => null);
    if (guardado) { e.waitUntil(nuevo); return guardado; }
    return (await nuevo) || cache.match("./index.html");
  }));
});
