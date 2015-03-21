require("../../styles/deploy_controls.less");

var Project = require('../models/project').model;

var DeployControlsView = Backbone.View.extend({
    template: require("../../html/deploy_controls.jade"),

    events: {
        'click .deploy-button': 'deployButtonClicked',
    },

    initialize: function( options ) {
        this.project = options.project;      
    },

    render: function() {
        var context = {
            project: this.project
        };

        console.log( "Rendering" );
        this.$el.html( this.template(context) );

        return this;
    },

    deployButtonClicked: function(e) { 
        e.preventDefault();

        var tempProject = new Project( this.project );

        tempProject.set({
            deployed_version: $('.deploy-version-select').val()
        });

        tempProject.save();
    },
});

exports.view = DeployControlsView;