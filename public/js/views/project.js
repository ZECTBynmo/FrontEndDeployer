require("../../styles/project.less");

var HeaderView = require("./header").view,
    DeployControlsView = require("./deploy_controls").view;

var ProjectView = Backbone.View.extend({
    template: require("../../html/project.jade"),
    deployControlsTemplate: require("../../html/deploy_controls.jade"),

    events: {
        'click .delete-project-button': 'handleDeleteProjectButtonClick',
    },

    initialize: function( options ) {
        this.project = options.project;
        this.deleteProject = options.deleteProject;
    },

    render: function() {
        
        var context = {
            project: this.project,
        };

        for( var iRelease=0; iRelease<context.project.releases.length; ++iRelease ) {
            var release = context.project.releases[iRelease];
            release.createdAt = (new Date(release.created_at)).toDateString();
        }

        console.log( "ProjectView render context:" );
        console.log( context );

        this.$el.html( this.template(context) );
        this.deployControls = new DeployControlsView( {project: this.project} );
        this.$('.deploy-controls-housing').html( this.deployControls.render().el );

        // Setup our tooltips
        this.$('button').tipsy({fade: true, gravity: 'n'});

        return this;
    },

    handleDeleteProjectButtonClick: function(e) {
        e.preventDefault();
        this.deleteProject();
    },
});

exports.view = ProjectView;