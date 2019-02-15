# PJAX PWA Overlay

A set of mustache templates to be used with express-mustache-overlays and bootstrap-flexbox-overlay that add PJAX (PushState+AJAX) and Progressive Web App support to a project.

## Configuration

The components in this package make use of the `app.locals.pjaxPwa` namespace.

## Example

See `./example` for a full example and tutorial.

## Environment Variables

All the environment variables from express-render-error, express-mustache-overlays and express-public-files-overlays are available in the example, but the following are also available from `bootstrapOptionsFromEnv()`:

* `NETWORK_ERROR_URL` - the URL the PWA should fetch to use in case there is a network error in future
* `START_URL` - the URL the PWA should fetch to use each time the site is opened (after the user has installed the app)
* `WITH_PJAX_PWA` - enable or disable the PJAX PWA support, defaults to `'true'`, set to `'false'` to disable PWA support
* `WITH_START_PAGE` - setup a route handler at the `startUrl` that renders the template `start` to generate the start page. Defaults to `true`.
* `WITH_NETWORK_ERROR_PAGE` - setup a route handler at the `networkErrorUrl` that renders the template `networkError` to generate the network error page. Defaults to `true`.
* `START_PAGE_TITLE` - The title of the start page. Defaults to `'Start'`.
* `NETWORK_ERROR_PAGE_TITLE` - The title of the network error page. Defaults to `'Network Error'`


## PJAX Links and Forms

All links within `<div id="pjax-container">` will automatically use PJAX (as long as you have `WITH_PJAX_PWA='true'` set).

Any form given the ID `data-pjax` will be submitted as multipart via PJAX too. **Only one form per page can have this ID though**. The express-mustache-jwt-signin package's sign in form already has this ID for example.

Since forms are submitted as multipart, you'll need to install middleware that
can parse that and make it available as `req.body`. For example busboy.

**Tip: Debugging PJAX requests can be tricky because the default behaviour if there is an error is to re-fetch and re-load the entire page. To be able to track down errors more easily in your browser, make sure you tick the `Preserve Log` checkbox in the network tab and console so that you can see the failed request as well as the successfull request afterwards.**


## Dev

```
npm run fix
```


## Changelog

### 0.2.3 2019-02-15

* Changed `setupPjaxPwa()` so that `withPjaxPwa` defaults to `true`
* Added `withStartPage` and `withNetworkErrorPage` with default values of `true` to the config options you can pass to `setupPjaxPwa()`
* Added `NETWORK_ERROR_PAGE_TITLE` and `START_PAGE_TITLE`
* Added default config options

### 0.2.1 2019-02-15

* Changed `setupPjaxPwa()` so that any config specified overrides the values in `app.locals.theme` and `app.locals.pjaxPwa` for the purposes of setting up the PJAX PWA
* Updated the example so that it caches the public files it needs using service worker

### 0.2.0 2019-02-15

* Make `WITH_PJAX_PWA` `true` by default
* Provide deafault icon192 URL and icon

### 0.1.0 2019-02-06

* First version
