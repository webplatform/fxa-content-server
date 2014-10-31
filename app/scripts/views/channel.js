/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global define,window,_,BaseView,Session,Template,Url*/
/*jshint indent: 2, dojo:true, browser: true */

define([
  "underscore",
  "views/base",
  "lib/session",
  "stache!templates/channel",
  "lib/url",
  'p-promise'
],
function (_, BaseView, Session, Template, Url, p) {
  "use strict";

  // https://accounts.webplatform.org/channel?service=recover&redirectTo=http%3A%2F%2Fdocs.webplatform.org%2Fwiki%2Fconcepts%2Fweb_design%3Fhi%3Ddude&context=fx_desktop_v1

  /**
   * Get only host part of URL
   *
   * Big thanks to @lewdev and @mc. on Stack Overflow.
   *
   * http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string#answer-23945027
   *
   * @param {String} urlString An URL
   */
  function originHostname(urlString) {
      var urlIsSupported = typeof URL === 'function'
      if (urlIsSupported) {
        return new URL(urlString).hostname;
      }

      return urlString.split('/')[2];
  }

  function isAcceptedOriginFromUrl(urlString) {
      return /webplatform(|staging)\.org$/.test(originHostname(urlString));
  }

  function wpdChannelHandler(messageEvent) {
      var isAcceptedOrigin = isAcceptedOriginFromUrl(messageEvent.origin || ""),
          origin = originHostname(messageEvent.origin),
          recvd = messageEvent.data.split(":") || null,
          self = this;

      console.debug("Accounts server; wpdChannelHandler, got [recvd,isAcceptedOrigin] ", recvd, isAcceptedOrigin);

      if (isAcceptedOrigin === true) {
        self.messageEvent = messageEvent;
        if (recvd[0] === "ping") {
          return this.fxaClient.isSignedIn(Session.sessionToken).then(onIsSignedInPingSuccess.bind(self), onIsSignedInPingFailure.bind(self));
        }
        if (recvd[0] === "signoff") {
          return this.fxaClient.signOut().then(onSignOut.bind(self));
        }
      } else {
        console.log("Accounts server; wpdChannelHandler, attempted communication from forbidden origin, ignoring.", origin);
      }
  }

  function onSignOut ( ) {
    console.log("Accounts server; onSignOut, about to postMessage back to frame.");
    this.messageEvent.source.postMessage({hasSession: false}, this.messageEvent.origin);
  }


  function onIsSignedInPingFailure ( ) {
    console.log("Accounts server; onIsSignedInPingFailure, got Promise failure, replying w/ no session. ", arguments);
    this.messageEvent.source.postMessage({hasSession: false}, this.messageEvent.origin);
  }

  function onIsSignedInPingSuccess ( isSignedIn ) {
    console.log("Accounts server; onIsSignedInPingSuccess, about to postMessage back, is user authorized? ", isSignedIn);
    var dataObj = {hasSession: isSignedIn};
    if (isSignedIn === true) {
      dataObj.recoveryPayload = Session.sessionToken||null;
    }
    this.messageEvent.source.postMessage(dataObj, this.messageEvent.origin);
  }

  var View = BaseView.extend({

    // DO NOT USE mustAuth:true, because we
    // want this view possible even though we
    // might have no session AND also that we
    // will only trust a "hasSession" that’s just
    // sent (e.g. user logs off accounts server during
    // same page view on a RelyingParty view.)
    //mustAuth: true,

    beforeRender: function () {
      var self = this;
      self.window.addEventListener("message", _.bind(wpdChannelHandler, self), false);
      if ( _.isObject(this.fxaClient) === false) {
          throw new Error("we MUST have an instance of FxA client stopping there");
      }
    },

    afterRender: function () {
      this.action = Url.searchParam("action", window.location.search);
    },

    template: Template,

    className: "wpd-channel"

  });

  return View;
});
