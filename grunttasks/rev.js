/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('rev', {
    dist: {
      files: {
        src: [
          '<%= yeoman.dist %>/bower_components/**/*.js',
          '<%= yeoman.dist %>/bower_components/**/*.{woff,eot,ttf,svg,ofl}',
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ]
      }
    }
  });
};
