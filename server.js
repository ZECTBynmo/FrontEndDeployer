/*jslint node: true */
'use strict';

var webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackConfig = require('./webpack.config'),
    LocalStrategy = require('passport-local'),
    bodyParser = require('body-parser'),
    Database = require('./app/database').database,
    passport = require('passport'),
    webpack = require('webpack'),
    express = require('express'),
    Router = require('./app/router').router,
    config = require('./config'),
    path = require('path');

var auth = config.auth;

var app = express(),
    database = new Database( auth );

function configApp() {
    var compiler = webpack( webpackConfig );

    app.use(webpackDevMiddleware(compiler, {
        quiet: false,
        noInfo: false,
        //lazy: true,
        watchDelay: 300,
        publicPath: '/assets/',
        headers: {'X-Custom-Header': 'yes'},
        stats: {colors: true },
    }));

    app.use( bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
}

// Configure our application
configApp();

// Setup a static route to serve all files within /assets
app.use( '/assets', express.static(path.join(__dirname, 'assets')) );

database.setup( function() {

    // Create our router
    var router = new Router( app, database, auth );

    passport.use(new LocalStrategy(
        function( username, password, done ) {
            database.User.findOne( {name: username}, function(err, user) {
                if( err ) { return done(err); }
                if( !user ) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if( !user.validPassword(password) ) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done( null, user );
            });
        }
    ));

    // The router sets up the rest of the site's routes
    router.setupRoutes( app );

    app.use(passport.initialize());

    // Start up the server!
    var port = process.env.PORT || 8000;
    app.listen( port );
    console.log( 'Listening on port ' + port );

});