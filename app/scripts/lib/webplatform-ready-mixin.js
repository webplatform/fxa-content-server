/**
 * WebPlatform Project ready mixins
 *
 * Adjusting functionality to suit needs for webplatform.org
 * accounts management. For more information, see the file
 * WEBPLATFORM.md at the root of this project.
 *
 * This view should’t promote any product.
 *
 * @author  Renoir Boulanger <renoir@w3.org>
 **/

'use strict';

define([
  'underscore'
], function (_) {
  return function (orig) {
    return _(orig.prototype).extend({
        // We aren’t mozilla, lets keep this
        //   vanilla, please.
        _showSignUpMarketing: function ( ) {
            return false;
        }
    });
  };
});