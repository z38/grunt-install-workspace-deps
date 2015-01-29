"use strict";

module.exports = function(grunt) {
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

            // Temporarily change CW to the current module dir
            var prevCWD = process.cwd();
            grunt.file.setBase(module);

            grunt.verbose.writeln("Remove 'node_modules' folder");
            grunt.file.delete("node_modules");
            grunt.file.setBase(prevCWD);
            // Cleaning CWD
            cb();
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
        async.series(cleanCmds, function(error) {
            done(error);
        });
    });
};
