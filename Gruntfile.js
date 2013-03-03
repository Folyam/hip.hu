module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['*.js', "lib/**/*.js", "routes/**/*.js", "workers/**/*.js"]
    }
  });
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('travis', ['jshint']);

  grunt.loadNpmTasks('grunt-contrib-jshint');
};