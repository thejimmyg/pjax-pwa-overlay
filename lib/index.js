const debug = require('debug')('pjax-pwa-overlay')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)
const accessAsync = promisify(fs.access)

const pjaxPwaOptionsFromEnv = (app) => {
  const options = {}
  if (typeof process.env.WITH_PJAX_PWA !== 'undefined') {
    options.withPjaxPwa = process.env.WITH_PJAX_PWA
  }
  if (typeof process.env.NETWORK_ERROR_URL !== 'undefined') {
    options.networkErrorUrl = process.env.NETWORK_ERROR_URL
  }
  if (typeof process.env.START_URL !== 'undefined') {
    options.startUrl = process.env.START_URL
  }
  if (typeof process.env.MANIFEST_URL !== 'undefined') {
    options.manifestUrl = process.env.MANIFEST_URL
  }
  if (typeof process.env.SERVICE_WORKER_URL !== 'undefined') {
    options.serviceWorkerUrl = process.env.SERVICE_WORKER_URL
  }
  if (typeof process.env.NAME !== 'undefined') {
    options.name = process.env.NAME
  }
  if (typeof process.env.SHORT_NAME !== 'undefined') {
    options.shortName = process.env.SHORT_NAME
  }
  if (typeof process.env.DISPLAY !== 'undefined') {
    options.display = process.env.DISPLAY
  }
  if (typeof process.env.BACKGROUND_COLOR !== 'undefined') {
    options.backgroundColor = process.env.BACKGROUND_COLOR
  }
  if (typeof process.env.URLS_TO_CACHE !== 'undefined') {
    options.urlsToCache = JSON.parse(process.env.URLS_TO_CACHE)
  }
  if (typeof process.env.DESCRIPTION !== 'undefined') {
    options.description = process.env.DESCRIPTION
  }
  if (typeof process.env.ICON_512_URL !== 'undefined') {
    options.icon512Url = process.env.ICON_512_URL
  }
  if (typeof process.env.ICON_512_FILE !== 'undefined') {
    options.icon512File = process.env.ICON_512_FILE
  }
  if (typeof process.env.ICON_192_FILE !== 'undefined') {
    options.icon192File = process.env.ICON_192_FILE
  }
  return options
}

const preparePjaxPwa = (app, pjaxPwaOptions) => {
  if (!app.locals.theme) {
    throw new Error('No app.locals.theme available. Did you call prepareTheme() before prepearePjaxPwa?')
  }
  if (typeof app.locals.theme.icon192Url === 'undefined') {
    debug('WARNING: No app.locals.theme.icon192Url specified. Did you call prepareTheme() before prepearePjaxPwa? Did you forget to set THEME_ICON_192_URL?')
  }
  if (typeof app.locals.theme.publicFilesUrl === 'undefined') {
    debug('WARNING: No app.locals.theme.publicFilesUrl specified. Did you call prepareTheme() before prepearePjaxPwa? Did you forget to set THEME_PUBLIC_FILES_URL?')
  }
  if (!app.locals.pjaxPwa) {
    app.locals.pjaxPwa = {}
  }
  const fixed = {
    version: '0.1.0',
    defaultLocale: 'en'
  }

  // THEME_ICON_192_URL - the URL to a 192x192 PNG file to use as the icon, available in templates as theme.icon192Url
  // THEME_COLOR - the color the browser should use for its theme, available in templates as theme.color
  // THEME_PUBLIC_FILES_URL - Defaults to app.locals.option.scriptName + '/public'. Used to specify where the public files used by the overlay should be mounted.
  //
  // Weirdness - 192 vs 512, hosting the thing

  const defaults = {
    // icon192Url from theme
    icon192Url: app.locals.theme.icon192Url || '/public/icon192.png',
    icon192File: path.join(__dirname, '..', 'public', 'icon192.png'),
    icon512Url: '/public/icon512.png',
    icon512File: path.join(__dirname, '..', 'public', 'icon512.png'),
    description: 'App',
    urlsToCache: [],
    display: 'standalone',
    themeColor: '#000000',
    backgroundColor: 'white',
    name: 'App',
    shortName: (pjaxPwaOptions.name || 'App').slice(0, 8),
    serviceWorkerUrl: '/sw.js',
    manifestUrl: '/manifest.json',
    startUrl: '/start',
    withPjaxPwa: true,
    networkErrorUrl: '/network-error'
  }
  Object.assign(app.locals.pjaxPwa, fixed, defaults, pjaxPwaOptions)
  // Set up the two overalys we need
  app.locals.mustache.overlay([path.join(__dirname, '..', 'views')])
  app.locals.publicFiles.overlay(app.locals.theme.publicFilesUrl, [path.join(__dirname, '..', 'public')])
  accessAsync(app.locals.pjaxPwa.icon192File, fs.constants.R_OK).catch((e) => {
    const msg = `ERROR: Cannot access icon 192 file: ${app.locals.pjaxPwa.icon192File}`
    console.error(msg)
    debug(msg)
  })
  accessAsync(app.locals.pjaxPwa.icon512File, fs.constants.R_OK).catch((e) => {
    const msg = `ERROR: Cannot access icon 512 file: ${app.locals.pjaxPwa.icon521File}`
    console.error(msg)
    debug(msg)
  })
}

const setupPjaxPwa = (app, config) => {
  const options = Object.assign({}, app.locals.theme, app.locals.pjaxPwa, config)
  const {
    version,
    defaultLocale,
    icon192Url,
    icon192File,
    icon512Url,
    icon512File,
    description,
    urlsToCache,
    display,
    themeColor,
    backgroundColor,
    name,
    shortName,
    serviceWorkerUrl,
    manifestUrl,
    startUrl,
    withPjaxPwa,
    networkErrorUrl
  } = options
  app.get(startUrl, (req, res, next) => {
    try {
      res.render('start', { })
    } catch (e) {
      next(e)
    }
  })

  app.get(networkErrorUrl, (req, res, next) => {
    try {
      res.render('networkError', {})
    } catch (e) {
      next(e)
    }
  })

  if (withPjaxPwa) {
    debug(`  Setting up service worker URL at ${serviceWorkerUrl}.`)
    app.get(serviceWorkerUrl, async (req, res, next) => {
      try {
        const lookup = { startUrl, networkErrorUrl, icon512Url, icon192Url, manifestUrl }
        const filesToCache = [startUrl, networkErrorUrl, icon512Url, icon192Url, manifestUrl]
        for (let i = 0; i < urlsToCache.length; i++) {
          filesToCache.push(urlsToCache[i][0])
          lookup[urlsToCache[i][0]] = urlsToCache[i][0]
          for (let j = 0; j < urlsToCache[i].length; j++) {
            lookup[urlsToCache[i][j]] = urlsToCache[i][0]
          }
        }
        // debug(filesToCache)
        // debug(lookup)
        res.type('application/javascript')
        res.send(`// 2019-01-10, manifest version: ${version}
var filesToCache = ${JSON.stringify(filesToCache)};
var lookup = ${JSON.stringify(lookup)};

self.addEventListener('install', function(event) {
  var promises = [];
  filesToCache.forEach(function(fileToCache) {
    var offlineRequest = new Request(fileToCache);
    console.log('Preparing fetch for', fileToCache);
    promises.push(
      fetch(offlineRequest).then(function(response) {
        return caches.open('offline').then(function(cache) {
          console.log('[oninstall] Cached offline page', response.url, response.status);
          var r = cache.put(offlineRequest, response);
          r.then(function(t) {
            console.log('Fetched', t)
          })
          return r
        });
      })
    )
  })
  event.waitUntil(Promise.all(promises).then(function(success) { self.skipWaiting() ; console.log('Finished populating the cache. Ready.'); return success }));
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
    .catch(function (error) {
      return caches.open('offline')
      .then(function(cache) {
        var url = new URL(event.request.url)
        var path = url.pathname
        console.log('Investigating "' + path + '" found "'+ lookup[path] +'" from cache ...')
        if (lookup[path]) {
          console.log('Returning path "' + lookup[path] + '" for "'+ path +'" from cache ...')
          return cache.match(lookup[path])
        } else {
          console.log('Returning "${networkErrorUrl}" for path "' + path + '" since it is not in the cache ...')
          return cache.match('${networkErrorUrl}').then(function(r) {console.log(r); return r}).catch(function(e) {console.log(e)})
        }
      })
    })
  );
});
      `)
      } catch (e) {
        next(e)
      }
    })

    debug(`  Setting up manifest at ${manifestUrl}.`)
    app.get(manifestUrl, async (req, res, next) => {
      try {
        res.type('application/json')
        res.json({
          'manifest_version': 2,
          name,
          display,
          start_url: startUrl,
          background_color: backgroundColor,
          theme_color: themeColor,
          short_name: shortName,
          scope: '/',
          version,
          default_locale: defaultLocale,
          description,
          icons: [
            {
              src: icon192Url,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: icon512Url,
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        })
      } catch (e) {
        next(e)
      }
    })
    const absIcon192File = path.normalize(icon192File)
    debug(`  Setting up ${icon192Url} -> ${absIcon192File} serve correctly`)
    app.get(icon192Url, (req, res, next) => {
      res.sendFile(absIcon192File)
    })
    const absIcon512File = path.normalize(icon512File)
    debug(`  Setting up ${icon512Url} -> ${absIcon512File} serve correctly`)
    app.get(icon512Url, (req, res, next) => {
      res.sendFile(absIcon512File)
    })
  }
}

module.exports = { pjaxPwaOptionsFromEnv, preparePjaxPwa, setupPjaxPwa }
