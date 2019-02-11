const debug = require('debug')('pjax-pwa-overlay')
const path = require('path')

const pjaxPwaOptionsFromEnv = (app) => {
  options = {}
  if (typeof process.env.WITH_PJAX_PWA !== 'undefined') {
    options.withPjaxPwa = process.env.WITH_PJAX_PWA
  }
  if (typeof process.env.NETWORK_ERROR_URL !== 'undefined') {
    options.networkErrorUrl = process.env.NETWORK_ERROR_URL
  }
  if (typeof process.env.START_URL !== 'undefined') {
    options.startUrl = process.env.START_URL
  }
  return options
}

const preparePjaxPwa = (app, pjaxPwaOptions) => {
  if (!app.locals.theme) {
    throw new Error('No app.locals.theme settings, have you called prepareTheme()?')
  }
  if (!app.locals.pjaxPwa) {
    app.locals.pjaxPwa = {}
  }
  Object.assign(app.locals.pjaxPwa, {startUrl: '/start', withPjaxPwa: false, networkErrorUrl: '/network-error'}, pjaxPwaOptions)
  // Set up the two overalys we need
  app.locals.mustache.overlay([path.join(__dirname, '..', 'views')])
  app.locals.publicFiles.overlay(app.locals.theme.publicFilesUrl, [path.join(__dirname, '..', 'public')])
}

const setupPjaxPwa = (app) => {
  app.get(app.locals.pjaxPwa.startUrl, async (req, res, next) => {
    try {
      res.render('start', { })
    } catch (e) {
      next(e)
    }
  })

  app.get(app.locals.pjaxPwa.networkErrorUrl, async (req, res, next) => {
    try {
      res.render('networkError', {})
    } catch (e) {
      next(e)
    }
  })
}


module.exports = { pjaxPwaOptionsFromEnv, preparePjaxPwa, setupPjaxPwa }
