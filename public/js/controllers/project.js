var ProjectView = require("../views/project").view,
    HeaderView = require('../views/header').view;

var ReleaseCollection = require("../collections/releases").collection;

var Project = require("../models/project").model;

var ProjectController = {

    start: function( opts ) {
        var _this = this;

        this.project = new Project( opts );
        this.project.fetch().then( function(project, status) {
            _this.projectDetails = {};

            var releaseFetchPromises = [];

            var releaseCollection = new ReleaseCollection({repo: project.repo});

            var details = {
                name: project.name,
                repo: project.repo,
                root: project.root,
                deployed_version: project.deployed_version
            };

            releaseFetchPromises.push( releaseCollection.fetch() );

            _this.projectDetails = details;

            Q.all(releaseFetchPromises).then( function(projectReleases) {
                _this.projectDetails.releases = projectReleases[0];
                _this.projectView = new ProjectView({
                    project: _this.projectDetails,
                    deleteProject: function() {
                        _this.project.destroy({success: function() {
                            window.FrontEndDeployer.router.navigate( "/", {trigger: true} );
                        }});
                    }
                });

                _this.headerView = new HeaderView();

                $(document.body).html( require("../../html/index.jade")() );
                
                $('.header').html( _this.headerView.render().el );
                $('.content').html( _this.projectView.render().el );
            });
        }); 
    },

    stop: function( opts ) {

    }
};

exports.controller = function() { return ProjectController; };