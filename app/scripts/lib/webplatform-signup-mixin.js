/**
 * WebPlatform Project signup mixins
 *
 * Adjusting functionality to suit needs for webplatform.org
 * accounts management. For more information, see the file
 * WEBPLATFORM.md at the root of this project.
 *
 * Adjusting required logic for accounts migration:
 *
 * - Ensuring that existing contributors can migrate their account
 *   and confirm their existing information
 * - Ensuring that new accounts can’t hijack existing ones
 *
 * @author  Renoir Boulanger <renoir@w3.org>
 **/

'use strict';

define([
  'underscore'
], function(_) {

  var messages = {
        REGISTERED_USERNAME: 'This username is already registered, if it’s your account, then you will be required to enter your previous password.',
      },
      ourEvents = {
        //'blur .wpd-username': 'onUsernameBlur'
        //,'change .wpd-username': '_validateUsernameField'
      },
      ourHandlers = {
        /*
        _getUsername: function _getUsername ( ) {
          return this.$('form .username').val();
        },

        onUsernameBlur: function onUsernameBlur ( ) {
          this._validateUsernameField();
          if (this._isUsernameExists() === true) {
            this.displayError(messages.REGISTERED_USERNAME);
            this.$('.error').css('background-color', 'purple');
            this.disableForm();
          } else {
            this.$('.error').attr('style', null);
            this.hideError();
            this.enableForm();
          }
        },

        _isUsernameExists: function _isUsernameExists ( ) {
          if (this._getUsername() == 'renoirb') {
            return true;
          }

          return false;
        },

        _validateUsernameField: function _validateUsernameField ( ) {
          var el = this.$('.username')[0];

          if(this._isUsernameExists() === true) {
            el.setCustomValidity(messages.REGISTERED_USERNAME);
          } else {
            el.setCustomValidity(""); // Has to be a 0-length string
          }
        }
        */
      };

  return function(orig){
    _(orig.prototype.events).extend(_.clone(ourEvents));

    return _(orig.prototype).extend(ourHandlers);
  };
});