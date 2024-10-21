importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v2'; // Cambié a v2 para asegurarnos de que se elimine la versión anterior
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    './', // Descomentado para asegurarse de que la página raíz también se cachee
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'manifest.json'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'css/animate.css',
    'js/libs/jquery.js'
];

// Instalación del Service Worker
self.addEventListener('install', e => {
    console.log('Service Worker: Instalando...');
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => {
        console.log('Cache estático abierto');
        return cache.addAll(APP_SHELL).catch(err => {
            console.error('Error en cacheStatic:', err);
        });
    });

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => {
        console.log('Cache inmutable abierto');
        return cache.addAll(APP_SHELL_INMUTABLE).catch(err => {
            console.error('Error en cacheInmutable:', err);
        });
    });

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

// Activación del Service Worker
self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => {
        return Promise.all(
            keys.map(key => {
                if (key !== STATIC_CACHE && key.includes('static')) {
                    console.log('Eliminando caché estático antiguo:', key);
                    return caches.delete(key);
                }
                if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                    console.log('Eliminando caché dinámico antiguo:', key);
                    return caches.delete(key);
                }
            })
        );
    });

    e.waitUntil(respuesta);
    console.log('Service Worker: Activado');
});

// Fetch y manejo de cache dinámico
self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res;
        } else {
            return fetch(e.request).then(newRes => {
                return actualizarCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            }).catch(err => {
                console.error('Error al obtener el recurso de la red:', err);
            });
        }
    });

    e.respondWith(respuesta);
});

