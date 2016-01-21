"use strict";

module.exports = function(grunt) {
    var exec = require("child_process").exec;
    var async = require("async");

    /**
     * Check if the directory corresponding to the given path
     * corresponds to a node module.
     *
     * @param  {String}  path
     *
     * @return {Boolean}
     */
    function isModule(path) {
        // Modules have a package.json file
        return grunt.file.expand({
            cwd: path
        }, "package.json").length;
    }

    /**
     * Create the "node_modules" deletion cmd to remove the module dependencies
     *
     * @param  {String} module,
     *
     * @return {Function}
     */
    function cleanModuleDepsCmd(module) {

        return function(cb) {
            grunt.log.subhead("Clean '" + module + "' dependencies");

            grunt.verbose.writeln("Remove 'node_modules' folder");
            exec("rm -rf " + module + "/node_modules", function(error, stdout) {
                if (error) {
                    grunt.log.error(error);
                }
                grunt.log.subhead("'" + module + "' cleaned");
                grunt.verbose.ok(stdout);
                // Cleaning CWD
                cb();
            });
        };
    }

    grunt.registerTask("clean-workspace-deps", "Clean all workspace dependencies.", function() {
        var done = this.async();
        grunt.log.subhead("Clean all modules dependencies");

        var cleanCmds = [];
        // Loop through all 1st level folders
        grunt.file.expand(["*", "!node_modules"]).forEach(function(moduleDir) {
            if (grunt.file.isDir(moduleDir) && isModule(moduleDir)) {
                cleanCmds.push(cleanModuleDepsCmd(moduleDir));
            }
        });

        // Execute the "node_modules" folders deletion commands
        async.parallel(cleanCmds, function(error) {
            done(error);
        });
    });
};
