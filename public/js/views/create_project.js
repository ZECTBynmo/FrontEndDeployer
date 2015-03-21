require("../../styles/create_project.less");

var Project = require("../models/project").model;

var CreateProjectView = Backbone.View.extend({
    template: require("../../html/create_project.jade"),

    events: {
        'submit #new-deploy-form': 'newDeploy',
    },

    newDeploy: function(event) {
        event.preventDefault();

        var data = {
            name: this.$('.project-name').val(),
            repo: this.$('.repo-name').val(),
            root: this.$('.url-root').val(),
        };

        $.ajax({
            url: '/project', 
            type: 'POST', 
            contentType: 'application/json', 
            data: JSON.stringify(data),
            success: function() {
                window.FrontEndDeployer.router.navigate( '/', {trigger: true} );
            },
        });

    },

    render: function() {
        this.$el.html( this.template() );
        return this;
    }
});

exports.view = CreateProjectView;