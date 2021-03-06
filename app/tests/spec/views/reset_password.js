/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/session',
  'views/reset_password',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, Session, View, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/reset_password', function () {
    var view, router;

    beforeEach(function () {
      router = new RouterMock();
      view = new View({
        router: router
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = router = null;
      $('#container').empty();
    });

    describe('render', function () {
      it('renders template', function () {
        assert.ok($('#fxa-reset-password-header').length);
      });

      it('pre-fills email addresses from Session.prefillEmail', function () {
        Session.set('prefillEmail', 'prefilled@testuser.com');
        return view.render()
            .then(function () {
              assert.equal(view.$('.email').val(), 'prefilled@testuser.com');
            });
      });
    });

    describe('isValid', function () {
      it('returns true if email address is entered', function () {
        view.$('input[type=email]').val('testuser@testuser.com');
        assert.isTrue(view.isValid());
      });

      it('returns false if email address is empty', function () {
        assert.isFalse(view.isValid());
      });

      it('returns false if email address is invalid', function () {
        view.$('input[type=email]').val('testuser');
        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('submit with valid input', function () {
      it('submits the email address', function () {
        var email = 'testuser.' + Math.random() + '@testuser.com';
        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                view.$('input[type=email]').val(email);

                return view.submit();
              })
              .then(function () {
                assert.equal(router.page, 'confirm_reset_password');
              });
      });
    });

    describe('submit with unknown email address', function () {
      it('rejects the promise', function () {
        var email = 'unknown' + Math.random() + '@testuser.com';
        view.$('input[type=email]').val(email);

        return view.submit()
                  .then(function (msg) {
                    assert.ok(msg.indexOf('/signup') > -1);
                  });
      });
    });

  });

  describe('views/reset_password with email specified as query param', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.location.search = '?email=testuser@testuser.com';

      view = new View({
        window: windowMock
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = windowMock = null;
      $('#container').empty();
    });

    it('pre-fills email address', function () {
      assert.equal(view.$('.email').val(), 'testuser@testuser.com');
    });

    it('removes the back button - the user probably browsed here directly', function () {
      assert.equal(view.$('#back').length, 0);
    });
  });
});
