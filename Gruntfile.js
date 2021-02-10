"use strict";

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
	pkg : grunt.file.readJSON('package.json'),
	dir : {
	    src : "WebContent",
	    dist : "dist"
	},

	copy : {
	    dist : {
		files : [ {
		    expand : true,
		    cwd : '<%=dir.GRModul01%>',
		    src : [ '**', '!test/**' ],
		    dest : '<%= dir.dist %>'
		} ]
	    }
	},

	clean : {
	    dist : '<%= dir.dist %>'
	},

	openui5_preload : {
	    component : {
		options : {
		    resources : {
			cwd : 'WebContent',
			prefix : 'de.arvato.GRModul01',
			src : [ '**/*.js', '**/*.xml', '**/*.css',
				'**/*.properties', '**/*.json' ]

		    },
		    dest : 'dist'
		},
		components : true
	    }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-openui5');

    grunt.registerTask('build', [ 'clean:dist', 'openui5_preload', 'copy' ]);
    //grunt.registerTask('build', [ 'clean:dist', 'openui5_preload' ]);

    // Default task.
    grunt.registerTask('default', [ 'clean', 'build' ]);
};