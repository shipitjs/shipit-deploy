module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> */\n',
                stripBanners: false
            }
        }
    }),
        grunt.registerTask('all', function() {
            var done = this.async();
        });
};