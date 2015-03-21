require("../../styles/index.less");

var HeaderView = require("./header").view,
    ProjectsOverview = require('./projects_overview').view,
    DeployControlsView = require("./create_project").view;

var IndexView = Backbone.View.extend({
    template: require("../../html/index.jade"),

    initialize: function( options ) {
        this.projects = options.projects;
    },

    render: function() {
        this.$el.html( this.template() );

        this.headerView = new HeaderView();
        this.projectsOverview = new ProjectsOverview({projects: this.projects});

        this.$('.header').html( this.headerView.render().el );
        this.$('.content').html( this.projectsOverview.render().el );
        return this;
    }
});

exports.view = IndexView;