require("../styles/index.less");

window.Q = require('q');
window.$ = require('jquery');
window._ = require('underscore');
window.jQuery = window.$;
window.Backbone = require('backbone');
window.Backbone.$ = window.$;

var Router = require("./router.js").router;

$(function() {
    window.FrontEndDeployer = {
        router: new Router()
    };

    Backbone.history.start();
});