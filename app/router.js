/*jslint node: true */
'use strict';

var tarball = require('tarball-extract'),
    request = require('request'),
    GitHub = require('github-releases'),
    mkdirp = require('mkdirp'),
    unzip = require('unzip'),
    path = require('path'),
    zip = require('adm-zip'),
    grw = require('grw'),
    fs = require('fs');

var AdmZip = require('adm-zip'),
    currentBuilds = {};

exports.router = function( app, database, auth ) { return {
    app: app,
    database: database,

    setupRoutes: function(app) {
        console.log( "Setting up routes" );
        app.get(    '/',                 this.getIndex );
        app.get(    '/repo/:name',       this.getRepo );
        app.get(    '/projects',         this.getProjects );
        app.post(   '/project',          this.createProject );
        app.get(    '/project/:name',    this.getProject );
        app.put(    '/project/:name',    this.updateProject );
        app.delete( '/project/:name',    this.deleteProject );
        app.get(    '/builds/:project',  this.downloadBuild );
        app.get(    '/static/:project',  this.serve );
        app.get(    '/static/:project*', this.serve );
        app.get(    '/preview/:project', this.sendPreview );

        //app.get( '/user', this.isAuthenticated, this.user );
    },

//    isAuthenticated: function(req, res, next) {
//        console.log("Authenticating user")
//        if (req.user.authenticated) {
//            console.log( "Authenticated" );
//            return next();
//        }
//
//        console.log("UNAUTHENTICATED")
//        console.log("UNAUTHENTICATED")
//        console.log("UNAUTHENTICATED")
//        console.log("UNAUTHENTICATED")
//        console.log("UNAUTHENTICATED")
//    },

    sendPreview: function(req, res) {
        previewPath = path.resolve('deploys/' + req.params.project + '/preview.html')

        if( fs.existsSync(previewPath) ) {
            console.log("preview exists");
            res.sendFile( previewPath );
        } else {
            database.Project.findOne({name: req.params.project}, function(err, project) {
                if( project !== undefined || project.deployed_version === undefined ) {
                    return res.status(500).json({error: "This project hasn't been deployed yet"});
                }
                console.log("downloading and unpacking for preview")
                downloadAndUnpackForProject( project, auth, req.baseUrl, function() {
                    console.log( "All unpacked" );
                    res.sendFile( previewPath );
                });
            });
        }
    },

    serve: function(req, res) {

        database.Project.findOne({name: req.params.project}, function(err, project) {
            console.log( 'Serving project ' + req.params.project + '/' + req.path );

            var baseRouteString = '/static/' + project.name + '/',
                relativePath = req.path.replace( baseRouteString, '' ),
                outputDir = path.resolve('./deploys/' + project.name + '/' + project.deployed_version),
                fullPath = outputDir + '/unpacked/home/travis/build/ZECTBynmo/' + project.name + '/assets/' + relativePath;

            if( fs.existsSync(fullPath) ) {
                res.status(200).sendFile( fullPath );
            } else {
                downloadAndUnpackForProject( project, auth, req.baseUrl, function() {
                    res.status(200).sendFile( fullPath );
                });
            }
        });
    }, 

    getIndex: function(req, res) {
        res.sendFile( 'index.html', {root: '.'} );
    },

    getProject: function(req, res) {
        database.Project.find({name: req.params.name}, function(err, projects) {
            res.json( projects[0] );
        });
    },
    
    getProjects: function(req, res) {
        database.Project.find({}, function(err, projects) {
            res.json( projects );
        });
    },

    createProject: function(req, res) {
        var name = req.body.name;

        console.log( "Creating project " + name );

        database.Project.find({name: name}, function(err, projects) {

            if( projects.length > 0 ) {
                return res.status(500).json({error: "A project by the name " + name + " already exists"} );
            } else {

                var project = new database.Project({
                    name: name,
                    repo: req.body.repo,
                    root: req.body.root,
                    deployed_version: req.body.deployed_version,
                });

                project.save(function(err, project) {
                    res.json( {message: "Successfully created project " + name} );
                });
            }
        });
    },

    updateProject: function(req, res) {
        var name = req.params.name;

        console.log( 'updating ' + name );
        console.log( req.body );

        var update = {name: name};

        if( req.body.repo ) {
            update.repo = req.body.repo;
        }

        if( req.body.root ) {
            update.root = req.body.root;
        }

        if( req.body.deployed_version ) {
            update.deployed_version = req.body.deployed_version;
            var isNewVersion = true;
        }

        console.log( "UPDATE" );
        console.log( update );

        database.Project.findOneAndUpdate({name: name}, update, function(err, project) {
            function respond() {
                if( err ) {
                    res.status(500).json( err );
                } else {
                    res.json( {message: "Successfully updated project " + req.params.name} );
                }
            }

            if( isNewVersion ) {
                downloadAndUnpackForProject( project, auth, req.baseUrl, function() {
                    respond();
                });
            } else {
                respond();
            }
        });
    },

    deleteProject: function(req, res) {
        console.log( 'Deleting project ' + req.params.name );
        database.Project.findOneAndRemove({name: req.params.name}, function(err, projects) {
            if( err ) {
                res.status(500).json( err );
            } else {
                res.json( {message: "Successfully deleted project " + req.params.name} );
            }
        });
    },

    getRepo: function(req, res) {
        console.log( req.params.name );

        var options = {
            url: 'https://api.github.com/repos/ZECTBynmo/' + req.params.name + '/releases?access_token=' + auth.token,
            headers: {
                'User-Agent': 'request'
            }
        };

        request.get( options, function (error, response, body) {
            res.json( JSON.parse(body) );
        });
    },

    downloadBuild: function(req, res) {
        database.Project.findOne({name: req.params.project}, function(err, project) {
            console.log( 'Retreiving build ' + req.params.project );
            console.log( arguments );

            if( project.deployed_version === undefined ) {
                return res.status(500).json({error: "This project hasn't been deployed yet"});
            }

            downloadAndUnpackForProject( project, auth, req.baseUrl, function() {
                res.json({message: 'Successfully unpacked'}); 
            });
        });
    },
}};

function writePreviewContainer( host, project, callback ) {
    var containerHtmlString = '<html><head><script type="text/javascript" charset="utf-8" src="' + host + '/static/' + project.name + '/main.js"></script></head><body></body></html>',
        previewPath = path.resolve('./deploys/' + project.name );
    
    mkdirp( previewPath, function(err) {
        fs.writeFileSync( previewPath + '/preview.html', containerHtmlString );
        callback();
    });
}

function downloadAndUnpackForProject( project, auth, host, callback ) {
    var outputPath = path.resolve('./deploys/' + project.name + '/' + project.deployed_version),
        outputZip = outputPath + '/build.zip',
        outputUnpacked = outputPath + '/unpacked',
        previewPath = path.resolve('./deploys/' + project.name );

    mkdirp( outputPath, function(err) {
        console.log( 'Created deploy folder' );

        var writeStream = fs.createWriteStream( outputZip );

        var github = new GitHub({user: 'ZECTBynmo', repo: project.name, token: auth.token});

        github.getReleases({
            tag_name: project.deployed_version
        }, function(err, releases) {
            var assets = releases[0].assets;

            for( var iAsset=0; iAsset<assets.length; ++iAsset ) {
                if( assets[iAsset].name != 'build.zip' ) {
                    continue;
                } else {
                    github.downloadAsset(assets[iAsset], function(error, inputStream) {
                        console.log( 'Downloaded release assets' );
                        var stream = inputStream.pipe(writeStream);
                        stream.on('finish', function() {
                            
                            var zip = new AdmZip( outputZip );
                            zip.extractAllTo( outputUnpacked, true );

                            writePreviewContainer( host, project, function() {
                                callback();
                            });
                        });
                    });
                }
            }
        });
    });
}
