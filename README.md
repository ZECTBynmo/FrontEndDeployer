# Static Build Proxy

[![Build Status](http://www.google.com)](https://magnum.travis-ci.com/ZECTBynmo/FrontEndDeployer)

This is a server that serves up our front end builds. It allows us to deploy specific versions of our projects (specified with git tags) onto our live servers.

## Development/contribution

To run this server locally, first install the node dependencies
```
npm install
```
And then you can start up the debug server
```
node server.js
```
Then, open up the [webpack dev server](http://localhost:8080/webpack-dev-server/index.html) to see the UI
