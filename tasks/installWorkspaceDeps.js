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
     * Create the "npm install" cmd to install the module dependencies
     *
     * @param  {String} module,
     *
     * @return {Function}
     */
    function installModuleCmd(module) {

        return function(cb) {
            grunt.log.subhead("Install '" + module + "' dependencies");

            // Temporarily change CW to the current module dir
            var prevCWD = process.cwd();
            grunt.file.setBase(module);

            grunt.verbose.writeln("npm install");
            exec("npm install", function(error, stdout) {
                if (error) {
                    grunt.log.error(error);
                }
                grunt.verbose.ok(stdout);
                // Cleaning CWD
                cb();
            });

            grunt.file.setBase(prevCWD);
        };
    }

    grunt.registerTask("install-workspace-deps", "Install all workspace dependencies.", function() {
        var done = this.async();

        grunt.log.subhead("Install all modules dependencies");

        var installCmds = [];
        // Loop through all 1st level folders
        grunt.file.expand(["*", "!node_modules"]).forEach(function(moduleDir) {
            if (grunt.file.isDir(moduleDir) && isModule(moduleDir)) {
                installCmds.push(installModuleCmd(moduleDir));
            }
        });

        // Execute the "npm install" commands
        async.parallel(installCmds, function(error) {
            done(error);
        });
    });
};
