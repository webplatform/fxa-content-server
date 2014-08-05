/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

'use strict';

define([
  'p-promise',
  'lib/url',
  'lib/oauth-client',
  'lib/assertion',
  'lib/oauth-errors',
  'lib/config-loader',
  'lib/session',
  'lib/service-name'
], function (p, Url, OAuthClient, Assertion, OAuthErrors, ConfigLoader, Session, ServiceName) {
  /* jshint camelcase: false */

  // If the user completes an OAuth flow using a different browser than they started with, we
  // redirect them back to the RP with this code in the `error_code` query param.
  var RP_DIFFERENT_BROWSER_ERROR_CODE = 3005;

  var SYNC_SERVICE = 'sync';

  return {
    setupOAuth: function (params) {
      if (!this._configLoader) {
        this._configLoader = new ConfigLoader();
      }

      this._oAuthClient = new OAuthClient();

      if (!params) {
        params = Url.searchParams(this.window.location.search);
      }
      this._oAuthParams = params;

      this.service = params.client_id;
    },

    setServiceInfo: function () {
      var self = this;

      if (this.service === SYNC_SERVICE) {
        self.serviceName = new ServiceName(this.translator).get(this.service);
        return p();
      }

      return this._oAuthClient.getClientInfo(this.service)
        .then(function(clientInfo) {
          self.serviceName = clientInfo.name;
          self.serviceRedirectURI = clientInfo.redirect_uri;
        })
        .fail(function(xhr) {
          self.displayError(xhr.responseJSON, OAuthErrors);
        });
    },

    oAuthRedirectWithError: function () {
      this.window.location.href = this.serviceRedirectURI +
                                  '?error=' + RP_DIFFERENT_BROWSER_ERROR_CODE;
    },

    finishOAuthFlow: function () {
      var self = this;
      return this._configLoader.fetch().then(function(config) {
        return Assertion.generate(config.oauthUrl);
      })
      .then(function(assertion) {
        self._oAuthParams.assertion = assertion;
        return self._oAuthClient.getCode(self._oAuthParams);
      })
      .then(function(result) {
        Session.clear('oauth');  // RBx look about that
        // Redirect to the returned URL
        self.window.location.href = result.redirect;
      })
      .fail(function(xhr) {
        Session.clear('oauth');
        self.displayError(xhr.responseJSON, OAuthErrors);
      });
    }
  };
});
