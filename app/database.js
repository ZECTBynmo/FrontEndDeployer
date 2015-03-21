/*jslint node: true */
'use strict';

var mongoose = require('mongoose');

exports.database = function( auth ) { 
    return {
        setup: function(callback) {
            this.dbConnection = mongoose.createConnection( auth.mongo );

            this.ProjectSchema = mongoose.Schema({
                name: String,
                repo: String,
                root: String,
                deployed_version: String,
            });

            this.UserSchema = mongoose.Schema({
                name: String,
                password: String,
            });

            this.Project = this.dbConnection.model( 'Project', this.ProjectSchema );
            this.User = this.dbConnection.model( 'User', this.UserSchema );

            callback();
        }
    };
};
