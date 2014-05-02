/**
 * WebPlatform Project utility api client
 *
 * Adjusting functionality to suit needs for webplatform.org
 * accounts management. For more information, see the file
 * WEBPLATFORM.md at the root of this project.
 *
 * This library handles various api/helper calls.
 *
 * @author  Renoir Boulanger <renoir@w3.org>
 **/

'use strict';

define([
  'underscore',
  'jquery',
  'p-promise'
],
function (_, $, P) {
  function WebplatformMigrationClient(options) {
    if (!(this instanceof WebplatformMigrationClient)) {
      return new WebplatformMigrationClient(options);
    }

    this.options = {};
    this.options.endpointPrefix = 'http://docs.webplatform.org/w/';
    this.options.endpoints = {
          'email': {
            method: "GET",
            url: "index.php",
            expected_return: "form",
            url_params: '?title=Special%3AEmailUser&target=renoirb'
          },
          'user_emailable': {
            method: "GET",
            url: "api.php",
            expected_return: "json",
            url_params: "?action=query&format=json&list=users&ususers=USERNAME" //%7Cuser2&usprop=registration%7Cemailable"
          }
    };

    _.extend(this.options, options||{});
  }

  WebplatformMigrationClient.prototype = {
    _getEndpointUrl: function _getEndpointUrl(name) {
      if (_.contains(_.keys(this.options.endpoints), name)) {
        var endpoint = this.options.endpoints[name],
            ending = (!! endpoint.url_params)? endpoint.url_params:null;

        return this.options.endpointPrefix + endpoint.url + ending;
      }

      throw 'Unknown endpoint "' + name + '"';
    },

    init: function init(name) {
      var promise,
          endpoint;

      try {
        endpoint = this._getEndpointUrl(name);
        promise = P(endpoint);

      }
    },

    hasUser: function hasUser(username) {

    }
  };

  return WebplatformMigrationClient;
});
