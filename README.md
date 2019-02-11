# PJAX PWA Overlay

A set of mustache templates to be used with express-mustache-overlays and bootstrap-flexbox-overlay that add PJAX (PushState+AJAX) and Progressive Web App support to a project.

## Configuration

The components in this package make use of the `app.locals.pjaxPwa` namespace.

## Example

See `./example` for a full example and tutorial.

## Environment Variables

All the environment variables from express-render-error, express-mustache-overlays and express-public-files-overlays are available in the example, but the following are also available from `bootstrapOptionsFromEnv()`:

* `WITH_PJAX_PWA` - enable or disable the PJAX PWA support, defaults to `'false'`, set to `'true'` to enable PWA support
* `NETWORK_ERROR_URL` - the URL the PWA should fetch to use in case there is a network error in future
* `START_URL` - the URL the PWA should fetch to use each time the site is opened (after the user has installed the app)


## Dev

```
npm run fix
```


## Changelog

### 0.1.0 2019-02-06

* First version
