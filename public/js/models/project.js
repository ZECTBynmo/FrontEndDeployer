var Project = Backbone.Model.extend({
    url: function() {
        return '/project/' + this.name;
    },

    initialize: function( options ) {
        this.name = options.name;
    },

    isNew: function() { return false; }
});

exports.model = Project;