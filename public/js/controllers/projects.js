var IndexView = require("../views/index").view;

var ReleaseCollection = require("../collections/releases.js").collection,
    ProjectsCollection = require("../collections/projects.js").collection;

var Releases = require("../collections/releases.js").collection;

var ProjectsController = {

    start: function( opts ) {
        var _this = this;

        this.projectsCollection = new ProjectsCollection();
        this.projectsCollection.fetch().then( function(projects, status) {
            _this.projectDetails = {};

            var releaseFetchPromises = [];
            for( var iProject=0; iProject<projects.length; ++iProject ) {
                var project = projects[iProject];

                var releaseCollection = new ReleaseCollection({repo: project.repo});

                var details = {
                    name: project.name,
                    repo: project.repo,
                    root: project.root,
                    deployed_version: project.deployed_version
                };

                releaseFetchPromises.push( releaseCollection.fetch() );

                _this.projectDetails[project.name] = details;
            }

            Q.all(releaseFetchPromises).then( function(projectReleases) {
                for( var iProject = 0; iProject<projects.length; ++iProject ) {
                    var project = projects[iProject];
                    _this.projectDetails[project.name].releases = projectReleases[iProject];
                }
            
                _this.indexView = new IndexView({projects: _this.projectDetails});
                $(document.body).html( _this.indexView.render().el );
            });
        }); 
    },

    stop: function( opts ) {

    }
};

exports.controller = function() { return ProjectsController; };