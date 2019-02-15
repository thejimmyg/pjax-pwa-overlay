# PJAX PWA Overlay Example

You can test the example as simply as:

```
cd ../
npm install
cd example
npm install
PORT=8000 npm start
```

If you get a warning about not being able to install a package, remove your `package-lock.json` file and try again.

To add logging too you can use:

```
DEBUG="*" PORT=8000 npm start
```

You can choose just a few selected loggers by comma-separating their names like this:

```
DEBUG="pjax*,express-mustache-overlays" PORT=8000 npm start
```

For production use you may want to change the settings in the code, or use environment variables.

If you visit http://localhost:8000/ you'll see a page rendered from the `content.mustache` template in bootstreap-flexbox-overlay's `views` directory. 

If you visit http://localhost:8000/not-found, no route is set up so you'll see a 404 page rendered from express-render-error's `view/404.mustache` template.

If you visit http://localhost:8000/throw you'll see a 500 page rendered from from express-render-error's `views/500.mustache` and you should also see the debug output of a stack trace at the terminal (if you set the `DEBUG` environment variable correctly as above).

If you visit http://localhost:8000/network-error you'll see a page that also gets rendered if you lose your internet connection or the server goes down. You wouldn't normally link this into your navigation but it is here in the example for testing. If you stop the server (or disable networking) and visit any other page, this should be the page you see. If you visit /home, set the server and networking up again and follow `try again`, the homepage should then reload, without the browser refreshing (i.e. still as a single page app).

If you visit http://localhost:8000/start you'll see the page the user would see if they installed the PWA and then opened it. Again, this might not be included in the navigation in a real app, but is handy for debugging here.

You can also specify overlays directly in code as documented in express-public-files-overlays and express-mustache-overlays.


## Docker

Docker can't copy files from a parent directory so the `docker:build` command puts the current dev version of pjax-pwa-overlay in this directory and created a modified `package.json.docker`:

```
npm run docker:build && npm run docker:run
```

## Dev

```
npm run fix
```
