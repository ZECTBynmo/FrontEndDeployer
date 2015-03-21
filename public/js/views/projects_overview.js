require("../../styles/projects_overview.less");

var ProjectsOverview = Backbone.View.extend({
    template: require("../../html/projects_overview.jade"),

    initialize: function( options ) {
        this.projects = options.projects;
    },

    render: function() {
        
        var context = {
            projects: this.projects
        };

        this.$el.html( this.template(context) );
        return this;
    }
});

exports.view = ProjectsOverview;