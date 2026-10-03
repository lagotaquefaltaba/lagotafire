// Service Worker de "La Gota Fire"
//
// CÓMO ACTUALIZAR EL JUEGO MÁS ADELANTE:
// Cada vez que subas un index.html nuevo, cambiá el número de acá abajo
// (CACHE_VERSION). Eso hace que los celulares que ya tenían el juego
// instalado bajen la versión nueva en vez de quedarse con la vieja
// guardada. Si no cambiás este número, puede que seule tardar en
// notarse la actualización.
const CACHE_VERSION = "v2";
const CACHE_NAME = "gota-fire-" + CACHE_VERSION;

const ARCHIVOS_PARA_GUARDAR = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png",
  "./icono-512-maskable.png",
];

// Al instalar, guarda una copia de todo para que funcione sin internet.
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_PARA_GUARDAR))
  );
  self.skipWaiting();
});

// Al activarse, borra cualquier versión guardada de antes (la vieja),
// para no acumular versiones viejas del juego ocupando espacio.
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// Al pedir un archivo: si hay internet, trae la versión más nueva y la
// guarda de paso; si no hay internet, usa la guardada. Así el juego
// anda offline, pero no se queda pegado en una versión vieja si hay
// conexión.
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request))
  );
});
