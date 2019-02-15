const debug = require('debug')('pjax-pwa-overlay')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const accessAsync = promisify(fs.access)

const pjaxPwaOptionsFromEnv = (app) => {
  const options = {}
  if (typeof process.env.WITH_PJAX_PWA !== 'undefined') {
    options.withPjaxPwa = process.env.WITH_PJAX_PWA
  }
  if (typeof process.env.WITH_START_PAGE !== 'undefined') {
    options.withStartPage = process.env.WITH_START_PAGE
  }
  if (typeof process.env.WITH_NETWORK_ERROR_PAGE !== 'undefined') {
    options.withNetworkErrorPage = process.env.WITH_NETWORK_ERROR_PAGE
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
  if (typeof process.env.START_PAGE_TITLE !== 'undefined') {
    options.startPageTitle = process.env.START_PAGE_TITLE
  }
  if (typeof process.env.NETWORK_ERROR_PAGE_TITLE !== 'undefined') {
    options.networkErrorPageTitle = process.env.NETWORK_ERROR_PAGE_TITLE
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

  const defaults = getDefaults(app)
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

const getDefaults = (app) => {
  return {
    icon192Url: ((app.locals.theme && app.locals.theme.icon192Url) || '/public/icon192.png'),
    icon192File: path.join(__dirname, '..', 'public', 'icon192.png'),
    // icon192File = './icon192.png',
    icon512Url: '/public/icon512.png',
    icon512File: path.join(__dirname, '..', 'public', 'icon512.png'),
    // icon512File = './icon512.png',
    manifestUrl: '/manifest.json',
    serviceWorkerUrl: '/sw.js',
    name: 'App',
    description: 'App',
    shortName: 'App',
    display: 'standalone',
    themeColor: '#000000',
    backgroundColor: 'white',
    startUrl: '/start',
    networkErrorUrl: '/network-error',
    version: '0.1.0',
    defaultLocale: 'en',
    urlsToCache: [],
    withPjaxPwa: true,
    withStartPage: true,
    withNetworkErrorPage: true,
    startPageTitle: 'Start',
    networkErrorPageTitle: 'Network Error'
  }
}

const setupPjaxPwa = (app, config) => {
  const options = Object.assign({}, getDefaults(app), app.locals.theme, app.locals.pjaxPwa, config)
  if (options.withStartPage) {
    app.get(options.startUrl, (req, res, next) => {
      try {
        res.render('start', { title: options.startPageTitle })
      } catch (e) {
        next(e)
      }
    })
  }

  if (options.withNetworkErrorPage) {
    app.get(options.networkErrorUrl, (req, res, next) => {
      try {
        res.render('networkError', { title: options.networkErrorPageTitle })
      } catch (e) {
        next(e)
      }
    })
  }

  if (options.withPjaxPwa) {
    debug(`  Setting up service worker URL at ${options.serviceWorkerUrl}.`)
    app.get(options.serviceWorkerUrl, async (req, res, next) => {
      try {
        const lookup = { startUrl: options.startUrl, networkErrorUrl: options.networkErrorUrl, icon512Url: options.icon512Url, icon192Url: options.icon192Url, manifestUrl: options.manifestUrl }
        const filesToCache = [options.startUrl, options.networkErrorUrl, options.icon512Url, options.icon192Url, options.manifestUrl]
        for (let i = 0; i < options.urlsToCache.length; i++) {
          filesToCache.push(options.urlsToCache[i][0])
          lookup[options.urlsToCache[i][0]] = options.urlsToCache[i][0]
          for (let j = 0; j < options.urlsToCache[i].length; j++) {
            lookup[options.urlsToCache[i][j]] = options.urlsToCache[i][0]
          }
        }
        // debug(filesToCache)
        // debug(lookup)
        res.type('application/javascript')
        res.send(`// 2019-01-10, manifest version: ${options.version}
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
          console.log('Returning "${options.networkErrorUrl}" for path "' + path + '" since it is not in the cache ...')
          return cache.match('${options.networkErrorUrl}').then(function(r) {console.log(r); return r}).catch(function(e) {console.log(e)})
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

    debug(`  Setting up manifest at ${options.manifestUrl}.`)
    app.get(options.manifestUrl, async (req, res, next) => {
      try {
        res.type('application/json')
        res.json({
          'manifest_version': 2,
          name: options.name,
          display: options.display,
          start_url: options.startUrl,
          background_color: options.backgroundColor,
          theme_color: options.themeColor,
          short_name: options.shortName,
          scope: '/',
          version: options.version,
          default_locale: options.defaultLocale,
          description: options.default,
          icons: [
            {
              src: options.icon192Url,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: options.icon512Url,
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        })
      } catch (e) {
        next(e)
      }
    })
    const absIcon192File = path.normalize(options.icon192File)
    debug(`  Setting up ${options.icon192Url} -> ${absIcon192File} serve correctly`)
    app.get(options.icon192Url, (req, res, next) => {
      res.sendFile(absIcon192File)
    })
    const absIcon512File = path.normalize(options.icon512File)
    debug(`  Setting up ${options.icon512Url} -> ${absIcon512File} serve correctly`)
    app.get(options.icon512Url, (req, res, next) => {
      res.sendFile(absIcon512File)
    })
  }
}

module.exports = { pjaxPwaOptionsFromEnv, preparePjaxPwa, setupPjaxPwa }
