/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/sign_up',
  'lib/session',
  'lib/password-mixin',
  'lib/auth-errors',
  'lib/webplatform-signup-mixin'
],
function (_, BaseView, FormView, Template, Session, PasswordMixin, AuthErrors, WebplatformMixin) {
  var t = BaseView.t;

  function selectAutoFocusEl(email, password) {
    if (! email) {
      return 'email';
    } else if (! password) {
      return 'password';
    }
    return 'year';
  }

  var now = new Date();

  // If COPPA says 13, why 14 here? To make UX simpler, we only ask
  // for their year of birth, we do not ask for month and day.
  // To make this safe and ensure we do not let *any* 12 year olds pass,
  // we are saying that it is acceptable for some 13 year olds to be
  // caught in the snare.
  // This is written on 2014-01-16. 13 years ago is 2001-01-16. Somebody born
  // in 2001-01-15 is now 13. Somebody born 2001-01-17 is still only 12.
  // To avoid letting the 12 year old in, add an extra year.
  var TOO_YOUNG_YEAR = now.getFullYear() - 14;

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    initialize: function (options) {
      options = options || {};

      // Reset forceAuth flag so users who visit the reset_password screen
      // see the correct links.
      Session.set('forceAuth', false);
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return false;
      }
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'keydown #fxa-age-year': 'submitOnEnter',
      'click a[href="/signin"]': '_savePrefillInfo'
    },

    context: function () {
      var autofocusEl = selectAutoFocusEl(Session.prefillEmail,
                                Session.prefillPassword);

      return {
        serviceName: this.serviceName,
        email: Session.prefillEmail,
        password: Session.prefillPassword,
        service: Session.service,
        isSync: Session.isSync(),
        shouldFocusEmail: autofocusEl === 'email',
        shouldFocusPassword: autofocusEl === 'password',
        shouldFocusYear: autofocusEl === 'year'
      };
    },

    submitOnEnter: function (event) {
      if (event.which === 13) {
        this.validateAndSubmit();
      }
    },

    isValidEnd: function () {
      return this._validateYear();
    },

    showValidationErrorsEnd: function () {
      if (! this._validateYear()) {
        this.showValidationError('#fxa-age-year', t('Year of birth required'));
      }
    },

    submit: function () {
      if (! this._isUserOldEnough()) {
        return this._cannotCreateAccount();
      }

      return this._createAccount();
    },

    _validateYear: function () {
      return ! isNaN(this._getYear());
    },

    _getYear: function () {
      return this.$('#fxa-age-year').val();
    },

    _isUserOldEnough: function () {
      var year = parseInt(this._getYear(), 10);

      return year <= TOO_YOUNG_YEAR;
    },

    _cannotCreateAccount: function () {
      // this is a session cookie. It will go away once:
      // 1. the user closes the tab
      // and
      // 2. the user closes the browser
      // Both of these have to happen or else the cookie
      // hangs around like a bad smell.
      document.cookie = 'tooyoung=1;';

      this.navigate('cannot_create_account');
    },

    _createAccount: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();
      var customizeSync = this.$('.customize-sync').is(':checked');

      var self = this;

      var username = this.$('.username').val(); // WebPlatform.org specific
      var fullName = this.$('.fullName').val(); // ^

      return this.fxaClient.signUp(email, password, { customizeSync: customizeSync, username: username, fullName: fullName })
        .then(function (accountData) {
          return self.onSignUpSuccess(accountData);
        })
        .then(null, function (err) {
          // Account already exists. No attempt is made at signing the
          // user in directly, instead, point the user to the signin page
          // where the entered email/password will be prefilled.
          if (AuthErrors.is(err, 'ACCOUNT_ALREADY_EXISTS')) {
            return self._suggestSignIn();
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            // if user canceled login, just stop
            return;
          }

          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    },

    onSignUpSuccess: function(accountData) {
      if (accountData.verified) {
        this.navigate('settings');
      } else {
        this.navigate('confirm');
      }
    },

    _suggestSignIn: function () {
      var msg = t('Account already exists. <a href="/signin">Sign in</a>');
      return this.displayErrorUnsafe(msg);
    },

    _savePrefillInfo: function () {
      Session.set('prefillEmail', this.$('.email').val());
      Session.set('prefillPassword', this.$('.password').val());
    }
  });

  _.extend(View.prototype, PasswordMixin);

  // Extend with our own mixins here. No
  //   need to do the same oauth_sign_up
  //   because it already extends this
  //
  // #TODO is there a better way?
  WebplatformMixin(View);

  return View;
});
