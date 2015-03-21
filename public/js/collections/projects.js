var Projects = Backbone.Collection.extend({
    model: require('../models/project.js').model,

    url: function() {
        return '/projects';
    },
});

exports.collection = Projects;