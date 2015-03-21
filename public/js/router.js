var HeaderView = require("./views/header").view,
    IndexView = require("./views/index").view,
    DeployControlsView = require("./views/create_project").view;

var ProjectsController = require("./controllers/projects").controller,
    ProjectController = require("./controllers/project").controller;

var indexTemplate = require("../html/index.jade");

var Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'create': 'create',
        'project/:name': 'project',
        'projects': 'projects',
        'deploy': 'deploy,'
    },

    index: function() {
        this.projectsController = new ProjectsController();
        this.projectsController.start();
    },

    project: function( name ) {
        this.projectController = new ProjectController();
        this.projectController.start({name: name});
    },

    projects: function() {
        this.projectsController = new ProjectsController();
        this.projectsController.start();
    },

    deploy: function() {
        
    },

    create: function() {
        this.headerView = new HeaderView();
        this.deployControlsView = new DeployControlsView();

        $(document.body).html( indexTemplate() );

        $('.header').html( this.headerView.render().el );
        $('.content').html( this.deployControlsView.render().el );
    },
});

exports.router = Router;