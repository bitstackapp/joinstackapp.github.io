'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "57c156de612785a4dcd6d4146cf29eb9",
"icons/Icon-192.png": "5720e1d542215535eabd86fc296ab48f",
"icons/Icon-512.png": "6f3a9046c4005936188f8f534e089ec2",
"assets/NOTICES": "2a356d6aaf9e9672af6af3631f921972",
"assets/assets/fonts/Metric-Regular.otf": "0f1aec85d172031aae3d163adab69456",
"assets/assets/fonts/Metric-ThinItalic.otf": "7d3d2433f2b233547d3414515edd2625",
"assets/assets/fonts/Metric-Medium.otf": "fe425ce187293c0373a6e607d8051ebd",
"assets/assets/fonts/Metric-Semibold.otf": "44ed21a5a853d3439cab67cc25a9b59c",
"assets/assets/fonts/Metric-LightItalic.otf": "d93d7c793ceabc17b1c289e53a739dac",
"assets/assets/fonts/Metric-Bold.otf": "c997c236f57d4553c6ba71a59e70dfc1",
"assets/assets/fonts/Metric-Thin.otf": "8aea07923f0de376720a6d0f66512de9",
"assets/assets/fonts/Metric-MediumItalic.otf": "07aa71bff996e5cc742bb8ec2c4a29fc",
"assets/assets/fonts/Metric-BlackItalic.otf": "ec05244942686ad0c1319b8c9ad3a46c",
"assets/assets/fonts/Metric-Light.otf": "70bcf830a2b7da572a32ea7fec84ffce",
"assets/assets/fonts/Metric-SemiboldItalic.otf": "ff7e323327be6ca16a134b8f9f6918cf",
"assets/assets/fonts/Metric-Black.otf": "ba5062a25f7bb94fce29103e1a0c814f",
"assets/assets/fonts/Metric-BoldItalic.otf": "129f34f07defd086c9a702e49eb3dd17",
"assets/assets/video/piggy_bank_colour.gif": "bf6f6fb988fc70d88e2faea1edbd2628",
"assets/assets/misc/btc-eur-max.csv": "373eee65f4e70160957a3fcec6fbb87e",
"assets/assets/img/stack_blue.png": "f8c9084b2b4eb57c371cb354bb816a06",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/AssetManifest.json": "8250d6a9e4f560c3cc853e2838b8f894",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "a126c025bab9a1b4d8ac5534af76a208",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "d80ca32233940ebadc5ae5372ccd67f9",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "831eb40a2d76095849ba4aecd4340f19",
"assets/FontManifest.json": "4cedb49bd09d72bc043ab3f8dc199d4c",
"index.html": "fb129740433bc7e4185235c10fb6d50a",
"/": "fb129740433bc7e4185235c10fb6d50a",
"main.dart.js": "03a32bf843629fac3e8bb1c1b9984378",
"CNAME": "50cc6866259c5da1ce5fabc0be2ab16f",
"version.json": "b10b7790f67f9b8baf201ae1133c1fe3",
"favicon.png": "115b79792c869e3a15803b10c06ed6ad"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
