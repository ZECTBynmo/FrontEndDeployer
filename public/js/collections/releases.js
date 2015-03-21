var Releases = Backbone.Collection.extend({
    model: require('../models/release.js').model,

    initialize: function( options ) {
        this.repo = options.repo;
    },

    url: function() {
        return window.location.origin + '/repo/' + this.repo;
    },

});

exports.collection = Releases;