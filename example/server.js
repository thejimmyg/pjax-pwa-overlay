const express = require('express')
const { prepareOption, prepareDebug, optionFromEnv, installSignalHandlers, setupErrorHandlers } = require('express-render-error')
const debug = require('debug')('pjax-pwa-overlay:server')
const path = require('path')
const { prepareMustache, setupMustache, mustacheFromEnv } = require('express-mustache-overlays')
const { preparePublicFiles, setupPublicFiles, publicFilesFromEnv } = require('express-public-files-overlays')
const { prepareTheme, bootstrapOptionsFromEnv } = require('bootstrap-flexbox-overlay')
const { preparePjaxPwa, pjaxPwaOptionsFromEnv, setupPjaxPwa } = require('pjax-pwa-overlay')

installSignalHandlers()

const app = express()
prepareDebug(app, debug)
prepareOption(app, optionFromEnv(app))
preparePublicFiles(app, publicFilesFromEnv(app))
prepareMustache(app, mustacheFromEnv(app))
prepareTheme(app, bootstrapOptionsFromEnv(app))
const options = pjaxPwaOptionsFromEnv(app)
debug('Options:', options)
debug(JSON.stringify(app.locals.theme))
preparePjaxPwa(app, options)

app.locals.mustache.overlay([path.join(__dirname, 'views-overlay')])
setupPjaxPwa(app)

// Add any routes here:
app.get('/', (req, res) => {
  res.render('content', { content: '<h1>Home</h1><p>Homepage.</p>', title: 'Home' })
})
app.get('/throw', (req, res) => {
  throw new Error('Test Error')
})

// Before error handlers
setupPublicFiles(app)
// Right at the end before view installation
setupErrorHandlers(app)

// Set up the view
const mustacheEngine = setupMustache(app)
app.engine('mustache', mustacheEngine)
app.set('views', app.locals.mustache.dirs)
app.set('view engine', 'mustache')
app.listen(app.locals.option.port, () => console.log(`Example app listening on port ${app.locals.option.port}`))
