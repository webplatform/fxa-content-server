/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle sign_in_complete, sign_up_complete,
 * and reset_password_complete.
 * Prints a message to the user that says
 * "All ready! You can go visit {{ service }}"
 */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/ready',
  'lib/session',
  'lib/xss',
  'lib/strings',
  'lib/oauth-mixin'
  ,'lib/webplatform-ready-mixin'
],
function (_, BaseView, FormView, Template, Session, Xss, Strings, OAuthMixin, WebplatformMixin) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    initialize: function (options) {
      options = options || {};

      this.type = options.type;
    },

    beforeRender: function () {
      if (this.isOAuthSameBrowser()) {
        // We're continuing an OAuth flow from the same browser
        this.setupOAuth(Session.oauth);
        return this.setServiceInfo();
      } else if (this.isOAuth()) {
        // We're continuing an OAuth flow in a different browser
        this.setupOAuth();
        this.service = Session.service;
        return this.setServiceInfo();
      }
    },

    context: function () {
      var serviceName = this.serviceName;

      if (this.serviceRedirectURI) {
        serviceName = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(this.serviceRedirectURI), serviceName
        ]);
      }

      return {
        service: this.service,
        serviceName: serviceName,
        signIn: this.is('sign_in'),

        signUp: this.is('sign_up'),
        showSignUpMarketing: this._showSignUpMarketing(),

        resetPassword: this.is('reset_password')
      };
    },

    events: {
      'click #redirectTo': BaseView.preventDefaultThen('submit')
    },

    _showSignUpMarketing: function () {
      if (! this.is('sign_up')) {
        return false;
      }

      // For UA information, see
      // https://developer.mozilla.org/docs/Gecko_user_agent_string_reference

      var ua = this.window.navigator.userAgent;

      // covers both B2G and Firefox for Android
      var isMobileFirefox = ua.indexOf('Mobile') > -1 && ua.indexOf('Firefox') > -1;
      var isTabletFirefox = ua.indexOf('Tablet') > -1 && ua.indexOf('Firefox') > -1;

      return ! (isMobileFirefox || isTabletFirefox);
    },

    afterRender: function() {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');
    },

    submit: function () {
      if (this.isOAuthSameBrowser()) {
        return this.finishOAuthFlow();
      } else if (this.isOAuth()) {
        return this.oAuthRedirectWithError();
      }
    },

    isOAuth: function () {
      return !!Session.service;
    },

    isOAuthSameBrowser: function () {
      /* jshint camelcase: false */
      return Session.oauth && Session.oauth.client_id === Session.service;
    },

    is: function (type) {
      return this.type === type;
    }
  });

  _.extend(View.prototype, OAuthMixin);

  // Extend with our own mixins here. No
  //   need to do the same oauth_sign_up
  //   because it already extends this.
  //
  // #TODO is there a better way?
  WebplatformMixin(View);

  return View;
});
