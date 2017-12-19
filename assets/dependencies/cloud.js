/**
 * cloud.js
 * v1.0.1
 *
 * Copyright (c) 2015-2017, Mike McNeil, Scott Gress, Sails Co. (https://sailsjs.com/about)
 * Copyright (c) 2014, Mike McNeil, Balderdash Design Co. (http://balderdash.co)
 * MIT License
 * ---------------------------------------------------------------------------------------------
 * ## Basic Usage
 *
 * Step 1:
 *
 * ```
 * Cloud.setup({  doSomething: 'POST /api/v1/somethings/:id/do'  });
 * ```
 * ^^Note that this can also be compiled automatically from your Sails app's routes using a script.
 *
 * Step 2:
 *
 * ```
 * var result = await Cloud.doSomething({id: 8, foo: ['bar', 'baz']});
 * ```
 * ---------------------------------------------------------------------------------------------
 */
(function(global, factory){
  var _;
  var io;
  var $;
  var SAILS_LOCALS;
  var location;
  var File;
  var FormData;

  // First, handle optional deps that are gleaned from the global state:
  // > Note: Instead of throwing, we ignore invalid globals.
  // > (Remember the bug w/ the File global that happened in Socket.io
  // > back in ~2015!)
  // =====================================================================
  if (global.location !== undefined) {
    if (global.location && typeof global.location === 'object' && (global.location.constructor.name === 'Location' || global.location.constructor.toString() === '[object Location]')) {
      location = global.location;
    }
  }//ﬁ
  if (global.File !== undefined) {
    if (global.File && typeof global.File === 'function' && global.File.name === 'File') {
      File = global.File;
    }
  }//ﬁ
  if (global.FormData !== undefined) {
    if (global.FormData && typeof global.FormData === 'function' && global.FormData.name === 'FormData') {
      FormData = global.FormData;
    }
  }//ﬁ

  // Then, load the rest of the deps:
  // =====================================================================

  //˙°˚°·.
  //‡CJS  ˚°˚°·˛
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var _require = require;// eslint-disable-line no-undef
    var _module = module;// eslint-disable-line no-undef
    // required deps:
    if (typeof _ === 'undefined') {
      try {
        _ = _require('@sailshq/lodash');
      } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    }//ﬁ
    if (typeof _ === 'undefined') {
      try {
        _ = _require('lodash');
      } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    }//ﬁ

    // optional deps:
    try { $ = _require('jquery'); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    try {

      io = _require('socket.io-client');
      var sailsIO = _require('sails.io.js');

      // Instantiate the library (and start auto-connecting)
      io = sailsIO(io);

      // Disable logging
      io.sails.environment = 'production';

      // Note that, if there is no location global, then after one tick,
      // if `io.sails.url` has still not been set, weird errors will emerge.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: figure out a way to provide a better err msg about this--
      // i.e. specifically the case where `.setup()` isn't called within one tick.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }

    SAILS_LOCALS = undefined;

    // export:
    _module.exports = factory(_, io, $, SAILS_LOCALS, location, File, FormData);
  }
  //˙°˚°·
  //‡AMD ˚¸
  else if(typeof define === 'function' && define.amd) {// eslint-disable-line no-undef
    throw new Error('Global `define()` function detected, but built-in AMD support in `cloud.js` is not currently recommended.  To resolve this, modify `cloud.js`.');
    // var _define = define;// eslint-disable-line no-undef
    // _define(['_', 'sails.io.js', '$', 'SAILS_LOCALS', 'location', 'file'], factory);
  }
  //˙°˚˙°·
  //‡NUDE ˚°·˛
  else {
    // required deps:
    if (!global._) { throw new Error('`_` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Lodash library is getting brought in before `cloud`.)'); }
    _ = global._;
    // optional deps:
    if (global.io !== undefined) {
      if (typeof global.io !== 'function') {
        throw new Error('Could not access `io.socket`: The `io` global is invalid at the moment:' + global.io + '\n(If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the sails.io.js library is getting brought in before `cloud`.)');
      }
      else if (typeof global.io.socket === 'undefined') {
        throw new Error('Could not access `io.socket`: `io` does not have a `socket` property.  Make sure `sails.io.js` is being injected in a <script> tag!');
      }
      else {
        io = global.io;
      }
    }//ﬁ
    if (global.$ !== undefined) {
      if (typeof global.$ !== 'function') {
        throw new Error('The `$` global is not valid at the moment:' + global.$ + '\n(If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the jQuery library is getting brought in before `cloud`.)');
      }
      else {
        $ = global.$;
      }
    }//ﬁ
    if (global.SAILS_LOCALS !== undefined) {
      if (!_.isObject(global.SAILS_LOCALS)) {
        throw new Error('The `SAILS_LOCALS` global is not valid at the moment:' + global.SAILS_LOCALS + '\n(Please check and make sure you are using `<%- exposeLocalsToBrowser() %>` in your server-side view *before* the rest of your scripts.)');
      }
      else {
        SAILS_LOCALS = global.SAILS_LOCALS;
      }
    }//ﬁ

    // export:
    if (global.Cloud) { throw new Error('Cannot expose global variable: Conflicting global (`cloud`) already exists!'); }
    global.Cloud = factory(_, io, $, SAILS_LOCALS, location, File, FormData);
  }
})(this, function (_, io, $, SAILS_LOCALS, location, File, FormData){



  /**
   * @param  {String} negotiationRule
   *
   * @throws {Error} If rule is invalid or absent
   */
  function _verifyErrorNegotiationRule(negotiationRule) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: add support for parley/flaverr/bluebird/lodash-style dictionary negotiation rules
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (_.isNumber(negotiationRule) && Math.floor(negotiationRule) === negotiationRule) {
      if (negotiationRule > 599 || negotiationRule < 0) {
        throw new Error('Invalid error negotiation rule: `'+negotiationRule+'`.  If a status code is provided, it must be between zero and 599.');
      }
    }
    else if (_.isString(negotiationRule) && negotiationRule) {
      // Ok, we'll assume it's fine
    }
    else {
      var suffix = '';
      if (negotiationRule === undefined || _.isFunction(negotiationRule)) {
        suffix = '  Looking to tolerate or intercept **EVERY** error?  This usually isn\'t a good idea, because, just like some try/catch usage patterns, it could mean swallowing errors unexpectedly, which can make debugging a nightmare.';
      }
      throw new Error('Invalid error negotiation rule: `'+negotiationRule+'`.  Please pass in a valid intercept rule string.  An intercept rule is either (A) the name of an exit or (B) a whole number representing the status code like `404` or `200`.'+suffix);
    }

  }









  /**
   * Cloud (SDK)
   *
   * After setup, this dictionary will have a method for each declared endpoint.
   * Each key will be a function which sends an HTTP or socket request to a
   * particular endpoint.
   *
   * ### Setup
   *
   * ```
   * Cloud.setup({
   *   apiBaseUrl: 'https://example.com',
   *   methods: {
   *     doSomething: 'PUT /api/v1/projects/:id',
   *     // ...
   *   }
   * });
   * ```
   *
   * > Note that you should avoid having an endpoint method named "setup", for obvious reasons.
   * > (Technically, it should work anyway though.  But yeah, no reason to tempt the fates.)
   *
   * ### Basic Usage
   * ```
   * Cloud.doSomething({
   *   someParam: ['things', 3235, null, true, false, {}, []]
   *   someOtherParam: 2523,
   *   etc: 'more things'
   * }).exec(function (err, responseBody, responseObjLikeJqXHR) {
   *   if (err) {
   *     // ...
   *     return;
   *   }
   *
   *   // ...
   * });
   * ```
   *
   * ### Negotiating Errors
   * ```
   * Cloud.signup(...)
   * .switch({
   *   error: function (err) { ... },
   *   usernameAlreadyInUse: function (recommendedAlternativeUsernames) { ... },
   *   emailAddressAlreadyInUse: function () { ... },
   *   success: function () { ... }
   * });
   * ```
   *
   * ### Using WebSockets
   * ```
   * Cloud.doSomething(...)
   * .protocol('jQuery')
   * .exec(...);
   * ```
   *
   * ```
   * Cloud.doSomething(...)
   * .protocol('io.socket')
   * .exec(...);
   * ```
   *
   * ##### Providing a particular jQuery or SailsSocket instance
   *
   * ```
   * Cloud.doSomething(...)
   * .protocol(io.socket)
   * .exec(...);
   * ```
   *
   * ```
   * Cloud.doSomething(...)
   * .protocol($)
   * .exec(...);
   * ```
   *
   * ### Using Custom Headers
   * ```
   * Cloud.doSomething(...)
   * .headers({
   *   'X-Auth': 'whatever'
   * })
   * .exec(...);
   * ```
   *
   * ### CSRF Protection
   *
   * It `SAILS_LOCALS._csrf` is defined, then it will be sent
   * as the "x-csrf-token" header for all Cloud.* requests, automatically.
   *
   */

  var Cloud = {};


  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: finish this when time allows   (would be better to have it work by attaching dedicated
  // nav methods rather than a generic nav method though)
  // ```
  // // A mapping of names of view actions to URL
  // // > provided to `.setup()`, for use in .navigate()
  // var _navigableUrlsByViewActionName;


  // /**
  //  * Cloud.navigate()
  //  *
  //  * Call this function to navigate to a different web page.
  //  * (Be sure and call it *before* trying to use any of the endpoint methods!)
  //  *
  //  * @param  {String} destination
  //  *         A URL or the name of a view action.
  //  */
  // Cloud.navigate = function(destination) {

  //   var doesBeginWithSlash = _.isString(destination) && destination.match(/^\//);
  //   var doesBeginWithHttp = _.isString(destination) && destination.match(/^http/);
  //   var isProbablyTheNameOfAViewAction = _.isString(destination) && destination.match(/^view/);
  //   if (!_.isString(destination) || !(doesBeginWithSlash || doesBeginWithHttp || isProbablyTheNameOfAViewAction)) {
  //     throw new Error('Bad usage: Cloud.navigate() should be called with a URL or the name of a view action.');
  //   }

  //   if (!_navigableUrlsByViewActionName) {
  //     throw new Error('Cannot navigate to a view action because Cloud.setup() has not been called yet-- please do that first (or if that\'s not possible, just navigate directly to the URL)');
  //   }

  // };
  // ```
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


  /**
   * Cloud.setup()
   *
   * Call this function once, when the page loads.
   * (Be sure and call it *before* trying to use any of the endpoint methods!)
   *
   * @param  {Dictionary} options
   *         @required {Dictionary} methods
   *         @optional {Dictionary} links
   *         @optional {Dictionary} apiBaseUrl
   */
  Cloud.setup = function(options) {

    options = options || {};

    if (!_.isObject(options.methods) || _.isArray(options.methods) || _.isFunction(options.methods)) {
      throw new Error('Cannot .setup() Cloud SDK: `methods` must be provided as a dictionary of addresses and definitions.');
    }//•

    // Determine the proper API base URL
    if (!options.apiBaseUrl) {
      if (location) {
        options.apiBaseUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      }
      else {
        throw new Error('Cannot .setup() Cloud SDK: Since a location cannot be determined, `apiBaseUrl` must be provided as a string (e.g. "https://example.com").');
      }
    }//ﬁ

    // Apply the base URL for the benefit of WebSockets (if relevant):
    if (io) {
      io.sails.url = options.apiBaseUrl;
    }//ﬁ

    // The name of the default protocol.
    var DEFAULT_PROTOCOL_NAME = 'jQuery';

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: finish this when time allows   (would be better to have it work by attaching dedicated
    // nav methods rather than a generic nav method though)
    // ```
    // // Save a reference to the mapping of navigable URLs by view action name (if provided).
    // _navigableUrlsByViewActionName = options.links || {};
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Interpret methods
    var methods = _.reduce(options.methods, function(memo, appLevelSdkEndpointDef, methodName) {

      if (methodName === 'setup') {
        console.warn('"setup" is a confusing name for a cloud action (it conflicts with a built-in feature of this SDK itself).  Would "initialize()" work instead?  (Continuing this time...)');
      }

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: finish this when time allows   (would be better to have it work by attaching dedicated
      // nav methods rather than a generic nav method though)
      // ```
      // if (methodName === 'navigate') {
      //   console.warn('"navigate" is a confusing name for a cloud action (it conflicts with a built-in feature of this SDK itself).  Would "travel()" work instead?  (Continuing this time...)');
      // }
      // ```
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // Validate the endpoint definition.
      ////////////////////////////////////////////////////////////////////////////////////////////////
      var _verbToCheck;
      var _urlToCheck;
      if (typeof appLevelSdkEndpointDef === 'function') {
        // We can't really check functions, so we just let it through.
      }
      else {
        if (appLevelSdkEndpointDef && typeof appLevelSdkEndpointDef === 'object') {
          // Must have `verb` and `url` properties.
          _verbToCheck = appLevelSdkEndpointDef.verb;
          _urlToCheck = appLevelSdkEndpointDef.url;
        }
        else if (typeof appLevelSdkEndpointDef === 'string') {
          // Must be able to parse `verb` and `url`.
          _verbToCheck = appLevelSdkEndpointDef.replace(/^\s*([^\/\s]+)\s*\/.*$/, '$1');
          _urlToCheck = appLevelSdkEndpointDef.replace(/^\s*[^\/\s]+\s*\/(.*)$/, '/$1');
        }
        else {
          throw new Error('CloudSDK endpoint (`'+methodName+'`) is invalid:  Endpoints should be defined as either (1) a string like "GET /foo", (2) a dictionary containing a `verb` and a `url`, or (3) a function that returns a dictionary like that.');
        }

        // --•

        // `verb` must be valid.
        if (typeof _verbToCheck !== 'string' || _verbToCheck === '') {
          throw new Error('CloudSDK endpoint (`'+methodName+'`) is invalid:  An endpoint\'s `verb` should be defined as a non-empty string.');
        }

        // `url` must be valid.
        if (typeof _urlToCheck !== 'string' || _urlToCheck === '') {
          throw new Error('CloudSDK endpoint (`'+methodName+'`) is invalid:  An endpoint\'s `url` should be defined as a non-empty string.');
        }
      }


      // Build the actual method that will be called at runtime:
      ////////////////////////////////////////////////////////////////////////
      memo[methodName] = function (argins) {

        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
        // There are 3 ways to define an SDK wrapper for a cloud endpoint.
        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
        var requestInfo = {
          // • the HTTP verb (aka HTTP "method" -- we're just using "verb" for clarity)
          verb: undefined,
          // • the path part of the URL
          url: undefined,
          // • a dictionary of request data
          //   (depending on the circumstances, these params will be encoded directly
          //   into either the url path, the querystring, or the request body)
          params: undefined,
          // • a dictionary of custom request headers
          headers: undefined,
          // • the protocol name (e.g. "jQuery" or "io.socket")
          protocolName: undefined,
          // • the protocol instance (e.g. actual reference to `$` or `io.socket`)
          protocolInstance: undefined,
          // • an array of conditional lifecycle instructions from userland .intercept() / .tolerate() calls, if any are configured
          lifecycleInstructions: [],
        };



        //  ██████╗ ██╗   ██╗██╗██╗     ██████╗     ██████╗ ███████╗███████╗███████╗██████╗ ██████╗ ███████╗██████╗
        //  ██╔══██╗██║   ██║██║██║     ██╔══██╗    ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
        //  ██████╔╝██║   ██║██║██║     ██║  ██║    ██║  ██║█████╗  █████╗  █████╗  ██████╔╝██████╔╝█████╗  ██║  ██║
        //  ██╔══██╗██║   ██║██║██║     ██║  ██║    ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗██╔══██╗██╔══╝  ██║  ██║
        //  ██████╔╝╚██████╔╝██║███████╗██████╔╝    ██████╔╝███████╗██║     ███████╗██║  ██║██║  ██║███████╗██████╔╝
        //  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝     ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝
        //
        //   ██████╗ ██████╗      ██╗███████╗ ██████╗████████╗
        //  ██╔═══██╗██╔══██╗     ██║██╔════╝██╔════╝╚══██╔══╝
        //  ██║   ██║██████╔╝     ██║█████╗  ██║        ██║
        //  ██║   ██║██╔══██╗██   ██║██╔══╝  ██║        ██║
        //  ╚██████╔╝██████╔╝╚█████╔╝███████╗╚██████╗   ██║
        //   ╚═════╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝
        //

        // Used for avoiding accidentally creating multiple promises when
        // using .then() or .catch().
        var _promise;

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: add support for omens so we get better stack traces, particularly
        // when running this in a Node.js environment.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // Return a dictionary of functions (to allow for "deferred object" usage.)
        var deferred = {

          // Allow request headers to be configured.
          /////////////////////////////////////////////////////////////////////////////
          headers: function (_customRequestHeaders){
            if (!_.isObject(_customRequestHeaders)) {
              throw new Error('Invalid request headers: Must be specified as a dictionary, where each key has a string value.');
            }
            requestInfo.headers = _.extend(requestInfo.headers||{}, _customRequestHeaders);

            return deferred;
          },

          // Allow the protocol to be configured on a per-request basis.
          /////////////////////////////////////////////////////////////////////////////
          protocol: function (_protocolNameOrInstance){
            if (typeof _protocolNameOrInstance === 'string') {
              switch (_protocolNameOrInstance) {
                case 'jQuery':
                  requestInfo.protocolName = 'jQuery';
                  if ($ === undefined) {
                    throw new Error('Could not access jQuery: `$` is undefined.');
                  }
                  else {
                    requestInfo.protocolInstance = $;
                  }
                  break;

                case 'io.socket':
                  requestInfo.protocolName = 'io.socket';
                  if (typeof io === 'undefined') {
                    throw new Error('Could not access `io.socket`: `io` is undefined.');
                  }
                  else if (typeof io !== 'function') {
                    throw new Error('Could not access `io.socket`: `io` is invalid:' + io);
                  }
                  else if (typeof io.socket === 'undefined') {
                    throw new Error('Could not access `io.socket`: `io` does not have a `socket` property.  Make sure `sails.io.js` is being injected in a <script> tag!');
                  }
                  else {
                    requestInfo.protocolInstance = io.socket;
                  }
                  break;

                default:
                  throw new Error('Unrecognized protocol: `'+_protocolNameOrInstance+'`. Use "jQuery" or "io.socket".');
              }
            }
            else if (_.isObject(_protocolNameOrInstance) || _.isFunction(_protocolNameOrInstance)) {
              if (_protocolNameOrInstance.name === 'jQuery') {
                requestInfo.protocolName = 'jQuery';
                requestInfo.protocolInstance = _protocolNameOrInstance;
              }
              else if (_protocolNameOrInstance.constructor.name === 'SailsSocket') {
                requestInfo.protocolName = 'io.socket';
                requestInfo.protocolInstance = _protocolNameOrInstance;
              }
              else if (_protocolNameOrInstance.toString() === '[Package: machinepack-http]') {
                requestInfo.protocolName = 'machinepack-http';
                requestInfo.protocolInstance = _protocolNameOrInstance;
              }
              // FUTURE: maybe "axios"?
              // FUTURE: maybe "fetch"?
              // FUTURE: maybe "request"?
              else {
                throw new Error('Unrecognized instance provided to `.protocol()`: `'+_protocolNameOrInstance+'`');
              }
            }
            else {
              throw new Error('Unrecognized protocol: `'+_protocolNameOrInstance+'`. Use "jQuery" or "io.socket".');
            }

            return deferred;

          },//</ implementation of `.protocol()`>


          // Allow intercepting the response before resolution/rejection occurs.
          // (This is basically an "after receiving response" lifecycle callback.)
          /////////////////////////////////////////////////////////////////////////////
          intercept: function (negotiationRule, handler) {

            _verifyErrorNegotiationRule(negotiationRule);

            if (!_.isFunction(handler)) {
              throw new Error('Invalid 2nd argument to `.intercept()`.  Expecting a handler function.');
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // FUTURE: Add a best-effort check to make sure there is no pre-existing rule
            // that matches this one (i.e. already previously registered using .tolerate()
            // or .intercept())
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            requestInfo.lifecycleInstructions.push({
              type: 'intercept',
              rule: negotiationRule,
              handler: handler
            });

            return deferred;

          },

          // Allow explicitly tolerating certain kinds of responses before resolution/rejection occurs.
          // (This causes control flow convergence by using `.intercept()` + throwing a special value)
          /////////////////////////////////////////////////////////////////////////////
          tolerate: function (_negotiationRuleMaybe, _handlerMaybe) {

            var handler;
            var negotiationRule;
            if (_handlerMaybe === undefined && _.isFunction(_negotiationRuleMaybe)) {
              handler = _negotiationRuleMaybe;
            }
            else {
              negotiationRule = _negotiationRuleMaybe;
              handler = _handlerMaybe;
            }

            if (negotiationRule !== undefined) {
              _verifyErrorNegotiationRule(negotiationRule);
            }

            if (handler !== undefined && !_.isFunction(handler)) {
              throw new Error('Invalid 2nd argument. to `.tolerate()`.  Expecting a handler function.');
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // FUTURE: Add a best-effort check to make sure there is no pre-existing rule
            // that matches this one (i.e. already previously registered using .tolerate()
            // or .intercept())
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            requestInfo.lifecycleInstructions.push({
              type: 'tolerate',
              rule: negotiationRule,
              handler: handler?
                handler
                :
                function(){ return; }
            });

            return deferred;

          },

          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // Looking for the EarlyReturnSignal stuff?
          //
          // See https://stackoverflow.com/a/43402123/486547 and specifically also
          // https://stackoverflow.com/questions/29499582/how-to-properly-break-out-of-a-promise-chain#comment80446341_43402123
          // (there may be a way to do this more elegantly without requiring the calling
          // code environment to be aware of our special Errors-- but it's not worth it
          // as-is.  Too much black magic!)
          //
          // > More notes & background leading up to this:
          // > https://gist.github.com/mikermcneil/c1bc2d57f5bedae810295e5ed8c5f935
          // >
          // > (Also check out the commit history of the original `caviar` repo.)
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

          then: function (){
            // console.log('in implementation of `then()`...');
            var promise = deferred.toPromise();
            // console.log('obj:',promise);
            return promise.then.apply(promise, arguments);
          },

          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // FUTURE: use parley for all this instead, if we can find a way to keep it
          // from being too enormous when browserified
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          toPromise: function (){
            if (typeof Promise === 'undefined') { throw new Error('Cannot use this approach: `Promise` constructor not available in current environment.'); }

            if (_promise) {
              // console.log('using catched promise...');
              return _promise;
            }
            // console.log('instantiating new promise!');

            _promise = new Promise(function(resolve, reject){// eslint-disable-line no-undef
              try {
                deferred.exec(function(err, resultMaybe) {
                  if (err){
                    // console.log('calling reject..');
                    return reject(err);
                  }
                  // console.log('calling resolve..');
                  return resolve(resultMaybe);
                });//_∏_
              } catch (err) {
                // console.log('EXEC THREW ERROR!',err);
                // console.log('CALLED REJECT IN NATIVE CATCH BLOCK!');
                reject(err);
              }
            });//_∏_

            return _promise;
          },


          // Allow the AJAX request to actually be sent.
          /////////////////////////////////////////////////////////////////////////////
          exec: function (exitCallbacks){

            if (exitCallbacks) {
              if (!_.isObject(exitCallbacks) && !_.isFunction(exitCallbacks)) {
                throw new Error('If specified, the argument passed to `.exec()` must be a dictionary containing a `success` and `error` callback.  Alternatively, you can use a Node.js-style callback.');
              }
              else if (_.isObject(exitCallbacks) && exitCallbacks.success && !_.isFunction(exitCallbacks.success)) {
                throw new Error('If specified, `success` callback must be a function.');
              }
              else if (_.isObject(exitCallbacks) && exitCallbacks.error && !_.isFunction(exitCallbacks.error)) {
                throw new Error('If specified, `error` callback must be a function.');
              }
            }

            // Just in case, build an error instance beforehand.
            // (This ensures it has a good stack trace.)
            var errorInstance = new Error('Endpoint (`'+methodName+'`) responded with an error (or the request failed).');

            // Give the error a special `name` property to ease negotiation
            // (vs. other unrelated things like typos in argins)
            errorInstance.name = 'CloudError';

            // If present, use CSRF token from `SAILS_LOCALS` as the `x-csrf-token`
            // request header for all non-GET requests.
            // (Unless of course there's another x-csrf-token header already specified.)
            if (_.isObject(SAILS_LOCALS) && typeof SAILS_LOCALS._csrf !== 'undefined') {
              if (_.isUndefined(requestInfo.headers)) {
                requestInfo.headers = {};
              }// >-
              if (!requestInfo.headers['x-csrf-token']) {
                requestInfo.headers['x-csrf-token'] = SAILS_LOCALS._csrf;
              }
            }//ﬁ

            // Finally, use the appropriate protocol to actually send the request and
            // send back the response to the code that called this `Cloud.*()` method.
            (function _makeAjaxCallWithAppropriateProtocol(proceed){

              // First, tease apart text params and file params.
              var textParamsByFieldName = requestInfo.params;

              // Check for file uploads.
              //
              // If `File`+`FormData` constructors are available, check to
              // see if any of the param values are File instances.  If
              // they are, then remove them from a shallow clone of the
              // params dictionary, and set them up separately.
              // (The files will be attached to the request _after_
              // the text parameters.)
              var filesByFieldName = {};
              if (File && FormData && textParamsByFieldName) {
                textParamsByFieldName = _.extend({}, textParamsByFieldName);
                _.each(textParamsByFieldName, function(value, fieldName){
                  if (_.isObject(value) && value instanceof File) {
                    filesByFieldName[fieldName] = value;
                    delete textParamsByFieldName[fieldName];
                  }
                });
              }//ﬁ

              // Don't allow file uploads for GET requests,
              // or if the FormData constructor is somehow missing.
              if (_.keys(filesByFieldName).length > 0) {
                if (requestInfo.verb.match(/get/i)) {
                  throw new Error(
                    'Detected File instance(s) provided for parameter(s):  '+
                    _.keys(filesByFieldName)+'\n'+
                    'But this is a nullipotent ('+requestInfo.verb.toUpperCase()+') '+
                    'request, which does not support file uploads.'
                  );
                }//•
                if (!FormData) {
                  throw new Error(
                    'Detected File instance(s) provided for parameter(s):  '+
                    _.keys(filesByFieldName)+'\n'+
                    'But the native FormData constructor does not exist!'
                  );
                }
              }//ﬁ

              switch (requestInfo.protocolName) {

                //  ▄▄███▄▄·    █████╗      ██╗ █████╗ ██╗  ██╗ ██╗██╗
                //  ██╔════╝   ██╔══██╗     ██║██╔══██╗╚██╗██╔╝██╔╝╚██╗
                //  ███████╗   ███████║     ██║███████║ ╚███╔╝ ██║  ██║
                //  ╚════██║   ██╔══██║██   ██║██╔══██║ ██╔██╗ ██║  ██║
                //  ███████║██╗██║  ██║╚█████╔╝██║  ██║██╔╝ ██╗╚██╗██╔╝
                //  ╚═▀▀▀══╝╚═╝╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═╝╚═╝
                case 'jQuery': return (function _doAjaxWithJQuery(){

                  var thisJQuery = requestInfo.protocolInstance;

                  // Build options for $.ajax().
                  var ajaxOpts = {
                    url: requestInfo.url,
                    method: requestInfo.verb
                  };
                  // If GET request, encode params in querystring.
                  if (requestInfo.verb.match(/get/i)) {
                    ajaxOpts.data = textParamsByFieldName;
                  }
                  // Else if there are files, attach them properly,
                  // alongside the other stuff in the form.
                  // > Note that we include text params **FIRST**,
                  // > in order to support order-aware body parsers
                  // > that rely on pessimistic upstream awareness
                  // > optimize uploads and prevent DDoS attacks.
                  else if (_.keys(filesByFieldName).length > 0){
                    ajaxOpts.processData = false;
                    ajaxOpts.contentType = false;
                    ajaxOpts.data = new FormData();
                    _.each(textParamsByFieldName, function(value, fieldName){
                      // Skip `undefined` values to more accurately mirror
                      // the behavior of JSON.stringify()
                      if (value === undefined) { return; }
                      ajaxOpts.data.append(fieldName, value);
                    });
                    _.each(filesByFieldName, function(file, fieldName){
                      // Skip `undefined` values for consistency.
                      if (file === undefined) { return; }
                      if (!_.isObject(file) || !_.isObject(file.constructor) || file.constructor.name !== 'File') {
                        throw new Error('Cannot upload as '+fieldName+' because the provided value is not a File instance.  Instead, got:'+file);
                      }
                      ajaxOpts.data.append(fieldName, file, file.name);
                    });
                  }
                  // Otherwise, attach params as a JSON-encoded request body.
                  else {
                    ajaxOpts.data = JSON.stringify(textParamsByFieldName);
                    ajaxOpts.processData = false;
                    ajaxOpts.contentType = 'application/json; charset=UTF-8';
                  }

                  if (typeof requestInfo.headers !== 'undefined') {
                    ajaxOpts.headers = requestInfo.headers;
                  }

                  // Dealing with jqXHR:
                  //
                  // To get status code:
                  // console.log(jqXHR.statusCode);
                  //
                  // To get header(s):
                  // console.log(jqXHR.getResponseHeader('foo'));
                  // - or -
                  // console.log(jqXHR.getAllResponseHeaders());
                  // ^^^ but this one gives it to you as a string.
                  // ^^
                  // WARNING: if using a cross-domain request w/ CORS, this (^^^^^)
                  // header grabbing may not work properly on some versions of firefox.  More details:
                  // http://stackoverflow.com/questions/5614735/jqxhr-getallresponseheaders-wont-return-all-headers

                  thisJQuery.ajax(_.extend(ajaxOpts, {
                    error: function (jqXHR) {

                      return proceed(undefined, {
                        body: jqXHR.responseJSON === undefined ? jqXHR.responseText : jqXHR.responseJSON,
                        statusCode: jqXHR.status,
                        headers: _.reduce(jqXHR.getAllResponseHeaders().split(/\n/), function (memo, pair) {
                          var splitPair = pair.split(/:/);
                          var headerName = splitPair[0];
                          if (headerName === '') { return memo; }

                          // Note that we trim leading AND trailing whitespace.
                          var headerVal = splitPair.slice(1).join('').replace(/^\s*/, '').replace(/\s*$/, '');
                          memo[headerName] = headerVal;
                          // Also add an alias using the all-lowercased version of the header name
                          // (if it's different)
                          var allLowercaseHeaderName = headerName.toLowerCase();
                          if (allLowercaseHeaderName !== headerName) {
                            memo[allLowercaseHeaderName] = headerVal;
                          }
                          return memo;
                        }, {})
                      });
                    },
                    success: function (unused0, unused1, jqXHR) {
                      return proceed(undefined, {
                        body: jqXHR.responseJSON === undefined ? jqXHR.responseText : jqXHR.responseJSON,
                        statusCode: jqXHR.status,
                        headers: _.reduce(jqXHR.getAllResponseHeaders().split(/\n/), function (memo, pair) {
                          var splitPair = pair.split(/:/);
                          var headerName = splitPair[0];
                          if (headerName === '') { return memo; }

                          // Note that we trim leading AND trailing whitespace.
                          var headerVal = splitPair.slice(1).join('').replace(/^\s*/, '').replace(/\s*$/, '');
                          memo[headerName] = headerVal;
                          // Also add an alias using the all-lowercased version of the header name
                          // (if it's different)
                          var allLowercaseHeaderName = headerName.toLowerCase();
                          if (allLowercaseHeaderName !== headerName) {
                            memo[allLowercaseHeaderName] = headerVal;
                          }
                          return memo;
                        }, {})
                      });
                    }
                  }));//</ thisJQuery.ajax + _.extend() >
                })();//</self-calling function :: _doAjaxWithJQuery>


                //  ██╗ ██████╗    ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗       ██╗██╗
                //  ██║██╔═══██╗   ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝▄ ██╗▄██╔╝╚██╗
                //  ██║██║   ██║   ███████╗██║   ██║██║     █████╔╝ █████╗     ██║    ████╗██║  ██║
                //  ██║██║   ██║   ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ▀╚██╔▀██║  ██║
                //  ██║╚██████╔╝██╗███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║██╗  ╚═╝ ╚██╗██╔╝
                //  ╚═╝ ╚═════╝ ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝╚═╝       ╚═╝╚═╝
                //
                case 'io.socket': return (function _doAjaxWithSocket(){

                  var socket = requestInfo.protocolInstance;

                  // If `File` constructor is available, check to be sure
                  // that none of the parameter values are File instances.
                  // > Note that if the File constructor is NOT available,
                  // > then we don't even bother checking (it's not like it
                  // > would work anyway!)
                  if (File && requestInfo.params) {
                    _.each(requestInfo.params, function(value, fieldName){
                      if (_.isObject(value) && value instanceof File) {
                        throw new Error('Detected File instance provided for the `'+fieldName+'` parameter -- but file uploads are not currently supported using WebSockets / Socket.io.  Please call this method using a different request protocol (e.g. `protocol: \'jQuery\'`)');
                      }
                    });
                  }//ﬁ

                  // Determine if the socket has been disconnected, or if it
                  // has NEVER BEEN connected and is not CURRENTLY TRYING to
                  // connect.
                  var disconnectedOrWasNeverConnectedAndUnlikelyToTry =
                    // =>
                    // If the socket is connected, cool, no problem.
                    !socket.isConnected() &&
                    // =>
                    // If the socket is at least _attempting_ to connect, we'll go ahead
                    // and let it try to do it's thing (i.e. queue and replay)
                    !socket.isConnecting() &&
                    // =>
                    // If the socket hasn't even had the _chance_ to begin connecting
                    // (because the one-tick auto-connect timer hasn't fired yet),
                    // then we'll give it that chance.
                    !socket.mightBeAboutToAutoConnect();


                  // If none of the above were true, then emulate a normal
                  // offline AJAX response from jQuery.
                  if (disconnectedOrWasNeverConnectedAndUnlikelyToTry) {
                    return proceed(undefined, {
                      body: null,
                      statusCode: 0,
                      headers: {}
                    });
                  }
                  // Otherwise the socket is either connected, in the process of connecting,
                  // or in an indeterminate state where it has _never_ connected but _might_
                  // still connect (see above for details).
                  //
                  // In any of these cases, thanks largely to queuing, it is safe to continue
                  // onwards, and to send the request!
                  socket.request({
                    method: requestInfo.verb,
                    url: requestInfo.url,
                    data: requestInfo.params,
                    headers: requestInfo.headers
                  }, function (unused, jwres) {
                    return proceed(undefined, {
                      body: jwres.body,
                      statusCode: jwres.statusCode,
                      headers: jwres.headers
                    });
                  });//</ socket.request() >
                })();//</self-calling function :: _doAjaxWithSocket>


                //  ███╗   ███╗██████╗       ██╗  ██╗████████╗████████╗██████╗
                //  ████╗ ████║██╔══██╗      ██║  ██║╚══██╔══╝╚══██╔══╝██╔══██╗
                //  ██╔████╔██║██████╔╝█████╗███████║   ██║      ██║   ██████╔╝
                //  ██║╚██╔╝██║██╔═══╝ ╚════╝██╔══██║   ██║      ██║   ██╔═══╝
                //  ██║ ╚═╝ ██║██║           ██║  ██║   ██║      ██║   ██║
                //  ╚═╝     ╚═╝╚═╝           ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝
                //
                case 'machinepack-http': return (function _doAjaxWithMpHttp(){

                  // If `File` constructor is available, check to be sure
                  // that none of the parameter values are File instances.
                  // > Note that if the File constructor is NOT available,
                  // > then we don't even bother checking (it's not like it
                  // > would work anyway!)
                  if (File && requestInfo.params) {
                    _.each(requestInfo.params, function(value, fieldName){
                      if (_.isObject(value) && value instanceof File) {
                        throw new Error('Detected File instance provided for the `'+fieldName+'` parameter -- but file uploads are not currently supported using machinepack-http.  Please call this method using a different request protocol.');
                      }
                    });
                  }//ﬁ

                  var mpHttpOpts = {
                    url: requestInfo.url,
                    method: requestInfo.verb
                  };
                  // If GET request, encode params in querystring.
                  if (requestInfo.verb.match(/get/i)) {
                    mpHttpOpts.qs = textParamsByFieldName;
                  }
                  // Otherwise, attach params as the request body.
                  // (it will be JSON-encoded automatically by default)
                  else {
                    mpHttpOpts.body = textParamsByFieldName;
                  }

                  if (typeof requestInfo.headers !== 'undefined') {
                    mpHttpOpts.headers = requestInfo.headers;
                  }

                  requestInfo.protocolInstance.sendHttpRequest(mpHttpOpts)
                  .switch({
                    error: function (err) {
                      return proceed(err);
                    },
                    requestFailed: function(err) {
                      return proceed(undefined, {
                        body: err.message,
                        statusCode: 0,
                        headers: {}
                      });
                    },
                    non200Response: function(serverResponse) {
                      return proceed(undefined, serverResponse);
                    },
                    success: function (serverResponse){

                      // If there is no response body (i.e. `body` is `""`),
                      // then we'll interpret that as `null` and return that as
                      // our response data.
                      if (serverResponse.body === '') {
                        serverResponse.body = null;
                      }

                      // --•
                      // Otherwise, attempt to parse the response body as JSON.
                      try {
                        serverResponse.body = JSON.parse(serverResponse.body);
                      } catch (err) {//eslint-disable-line no-unused-vars
                        // If the raw response body string cannot be parsed as JSON,
                        // then interpret it as a string by leaving the raw body as-is.
                      }

                      return proceed(undefined, serverResponse);
                    }
                  });//_∏_
                })();//</self-calling function :: _doAjaxWithMpHttp>

                default:
                  throw new Error('Consistency violation: Unexpected protocol name received (`'+requestInfo.protocolName+'`)-- but it should have already been checked!');

              }//</switch(protocol)>
            })(function afterwards(err, responseInfo){
              if (err) {
                throw new Error('Consistency violation: Unexpected error in CloudSDK. Details: '+err.stack);
              }


              // Note that the response info dictionary is intended to be
              // a transport-agnostic way of representing a server response.
              // (similar to jQuery AJAX response objects / jqXHR / jwRes):

              // --------------------------------------------------------------------
              // AVAILABLE AT THIS POINT:
              // • responseInfo.statusCode
              // • responseInfo.body
              // • responseInfo.headers
              // --------------------------------------------------------------------
              // ATTACHED BELOW:
              // • responseInfo.data        << for compatibility
              // • responseInfo.exit        << either `success`, `error`, or the code name of some other exit.
              // • responseInfo.code        << (alias for "exit")
              // --------------------------------------------------------------------

              // To get exit info:
              // console.log(responseInfo.headers['X-Exit']);
              // console.log(responseInfo.headers['X-Exit-FriendlyName']);
              // console.log(responseInfo.headers['X-Exit-Description']);
              // console.log(responseInfo.headers['X-Exit-Extended-Description']);
              // console.log(responseInfo.headers['X-Exit-Output-Friendly-Name']);
              // console.log(responseInfo.headers['X-Exit-Output-Description']);



              // COMPATIBILITY:
              // Stick `data` property on responseInfo so it feels familiar
              // e.g. like `res.data` in angular 1
              // (This is mainly for backwards compatibility, and can probably
              // be removed at some point.)
              if (!_.isUndefined(responseInfo.body)) {
                responseInfo.data = responseInfo.body;
              }

              // Determine the appropriate callback to call.
              //
              // We also stick on `exit` property for convenience
              // by sniffing the X-Exit header.  We default to `error`
              // or `success`, depending on whether an Error instance
              // was passed through as the `error` property.
              var xExitResponseHeaderValue = responseInfo.headers['x-exit'] || responseInfo.headers['X-Exit'];
              // ^This "either-or-ing" is likely necessary because of different jQuery versions.

              if (xExitResponseHeaderValue === '_offline') {
                console.warn('Unconventional exit detected:  `_offline` is a reserved exit name for use on the front-end, and should not be used willy nilly.  Instead, please come up with a different exit name for this scenario.');
              }//ﬁ


              // If the user's computer is offline or the server is down, etc...
              // > If `statusCode` is 0, then the user is probably offline.
              // > Or maybe our server is down omg.
              // > Or it could be that a cross-origin request was blocked.
              if (responseInfo.statusCode === 0) {
                responseInfo.exit = '_offline';
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE: Instead of "_offline", support more granular/accurate
                // built-in exits like:
                // • '_failedCrossOriginRequest'
                // • '_serverDown'
                // • '_clientOffline'
                //
                // ^^In the future, if we want to get really fancy,
                // we could try sending a ping to another CORS-enabled
                // endpoint to see whether it's us or them.  Not sure
                // how we'd figure out if it's a failed cross-origin
                // request though...
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              }
              // If the server responded with a specific error...
              else if (xExitResponseHeaderValue){
                responseInfo.exit = xExitResponseHeaderValue;
              }
              // If the server responded with some other misc. error...
              else if (responseInfo.statusCode < 200 || responseInfo.statusCode >= 300) {
                responseInfo.exit = 'error';
              }
              // Otherwise, we'll consider it a success!
              else {
                responseInfo.exit = 'success';
              }

              // Set up `code` as alias for `exit`, for consistency.
              responseInfo.code = responseInfo.exit;



              // Now before proceeding further, check lifecycleInstructions for a match (if there are any configured).
              // > NOTE: We only ever run one of these handlers for any given response!
              var matchingLifecycleInstruction = _.find(requestInfo.lifecycleInstructions, function(lifecycleInstruction) {

                if (lifecycleInstruction.rule === undefined) {
                  if (responseInfo.exit === 'success' || (responseInfo.statusCode >= 200 && responseInfo.statusCode < 300)) {
                    return false;
                  }
                  else {
                    return true;
                  }
                }
                else if (responseInfo.statusCode === lifecycleInstruction.rule) {
                  return true;
                }
                else if (responseInfo.exit === lifecycleInstruction.rule) {
                  return true;
                }
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE: add support for bluebird style dictionary rules
                // (see flaverr.taste at https://npmjs.com/package/flaverr)
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

              });//∞


              // If there was a match, then run this intercept/toleration's handler function.
              (function _runInterceptOrTolerationMaybe(proceed){

                if (!matchingLifecycleInstruction) {
                  return proceed();
                }//•

                var resultFromHandler;

                if (matchingLifecycleInstruction.handler.constructor.name === 'AsyncFunction') {
                  return proceed(new Error('`async` functions are not *yet* fully supported in intercept/tolerate'));
                  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                  // FUTURE: add support for this, beginning with something like the
                  // following incomplete implementation:
                  //
                  // ```
                  // var interceptPromise;
                  // try {
                  //   interceptPromise = matchingLifecycleInstruction.handler();
                  // } catch (err) {
                  //   if (err === false) { return proceed(undefined, true); }//« special case (`throw false`)
                  //   else { return proceed(err); }
                  // }
                  //
                  // interceptPromise.then(function(_resultFromHandler){
                  //   resultFromHandler = _resultFromHandler;
                  //   proceed(undefined, resultFromHandler);
                  // });
                  // interceptPromise.catch(function(err) {
                  //   /* eslint-disable callback-return */
                  //   if (err === false) { proceed(undefined, true); }//« special case (`throw false`)
                  //   else { proceed(err); }
                  //   /* eslint-enable callback-return */
                  // });
                  // ```
                  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                }
                else {
                  try {
                    // FUTURE: do this addition of properties earlier:
                    errorInstance.exit = responseInfo.exit;
                    errorInstance.code = responseInfo.exit;
                    errorInstance.responseInfo = responseInfo;

                    resultFromHandler = matchingLifecycleInstruction.handler(errorInstance);
                  } catch (err) {
                    if (err === false) { return proceed(undefined, true); }//« special case (`throw false`)
                    else { return proceed(err); }
                  }

                  return proceed(undefined, resultFromHandler);
                }

              })(function(err, resultFromInterceptOrTolerate) {

                if (err) {
                  throw new Error('The provided custom intercept/tolerate logic threw an unexpected, uncaught error: '+err.stack);
                  // FUTURE: better error handling for this case ^^
                }//•


                if (matchingLifecycleInstruction) {
                  if (responseInfo.exit === 'success' || (responseInfo.statusCode >= 200 && responseInfo.statusCode < 300)) {
                    throw new Error('Unexpected intercept/tolerate logic matched a 2xx/success response, but these methods should only be used for exceptions!');
                    // FUTURE: better error handling for this case ^^
                  }
                }

                // If a matching `.tolerate()` was encountered, then consider this successful no matter what.
                var tolerateAsIfSuccess = (matchingLifecycleInstruction && matchingLifecycleInstruction.type === 'tolerate');


                // If a matching `.intercept()` was encountered, then consider whatever the intercept handler
                // returned to be our new Error.
                if (matchingLifecycleInstruction && matchingLifecycleInstruction.type === 'intercept') {
                  if (!_.isError(resultFromInterceptOrTolerate)) {
                    throw new Error('Unexpected value returned from .intercept() handler.  Expected an Error instance but instead, got: '+resultFromInterceptOrTolerate);
                    // FUTURE: better error handling for this case ^^
                  }
                  errorInstance = resultFromInterceptOrTolerate;
                }


                // If no custom error callback was specified, but we don't know
                // how to handle an error below, then we'll simply throw a fatal
                // error (this can be caught by `window.onerror` et. al. in order
                // to trigger a fatal error message, e.g. using a devoted user
                // interface component as a global error bus.)
                //
                // This string is used as a prefix for the various error messages
                // that can occur this way throughout the code below.
                var UNHANDLED_ERR_PREFIX_MSG =
                (
                  (responseInfo.statusCode===0)?
                  'Unable to send request... are the client and server both online?'
                  :'Received unhandled '+responseInfo.statusCode+' error from server.'
                )+'  '+
                '(See `responseInfo` property of this error for details).  '+
                'Note that you can negotiate any error using its `exit` or `responseInfo.statusCode` properties.\n'+
                '--\n';

                //  ┌─┐┌─┐┌┐┌┌─┐┬─┐┬┌─┐   ┌─┐─┐ ┬┌─┐┌─┐  ┌─┐┌─┐┬  ┬  ┌┐ ┌─┐┌─┐┬┌─  ┌─┐┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌
                //  │ ┬├┤ │││├┤ ├┬┘││     ├┤ ┌┴┬┘├┤ │    │  ├─┤│  │  ├┴┐├─┤│  ├┴┐  ├┤ │ │││││   │ ││ ││││
                //  └─┘└─┘┘└┘└─┘┴└─┴└─┘  o└─┘┴ └─└─┘└─┘  └─┘┴ ┴┴─┘┴─┘└─┘┴ ┴└─┘┴ ┴  └  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘
                // If a generic callback was provided...
                if (_.isFunction(exitCallbacks)) {
                  if (tolerateAsIfSuccess) {
                    return exitCallbacks(undefined, resultFromInterceptOrTolerate, responseInfo);
                  }
                  else if (responseInfo.exit === 'success' || (responseInfo.statusCode >= 200 && responseInfo.statusCode < 300)) {
                    return exitCallbacks(undefined, responseInfo.body, responseInfo);
                  }
                  else {
                    errorInstance.stack += '\n'+
                    '\n'+
                    'Error Summary:\n'+
                    '(see `.responseInfo` for more details)\n'+
                    '·-------------·----------------------------------------·\n'+
                    '|    Protocol | '+(requestInfo.protocolName==='jQuery'?'http(s)://   (jQuery)':requestInfo.protocolName==='io.socket'?'ws(s)://   (io.socket)':requestInfo.protocolName)+'\n'+
                    '|     Address | '+requestInfo.verb.toUpperCase()+' '+requestInfo.url+'\n'+
                    '|        Exit | '+responseInfo.exit+'\n'+
                    '| Status Code | '+responseInfo.statusCode+'\n'+
                    '·-------------·----------------------------------------·';
                    if (responseInfo.body !== undefined) {
                      errorInstance.stack += '\n\nResponse Body:\n'+responseInfo.body;
                    }
                    errorInstance.responseInfo = responseInfo;
                    errorInstance.exit = responseInfo.exit;
                    errorInstance.code = responseInfo.exit;
                    return exitCallbacks(errorInstance, responseInfo.body!==undefined?responseInfo.body:errorInstance, responseInfo);
                  }
                }//‡
                //  ┌─┐┬ ┬┬┌┬┐┌─┐┬ ┬┌┐ ┌─┐┌─┐┬┌─  ┌┬┐┬┌─┐┌┬┐┬┌─┐┌┐┌┌─┐┬─┐┬ ┬
                //  └─┐││││ │ │  ├─┤├┴┐├─┤│  ├┴┐   ││││   │ ││ ││││├─┤├┬┘└┬┘
                //  └─┘└┴┘┴ ┴ └─┘┴ ┴└─┘┴ ┴└─┘┴ ┴  ─┴┘┴└─┘ ┴ ┴└─┘┘└┘┴ ┴┴└─ ┴
                // If a dictionary of callbacks was provided...
                else if (_.isObject(exitCallbacks)) {

                  // If this isn't the error exit, and a callback exists for it...
                  if (responseInfo.exit !== 'error' && exitCallbacks[responseInfo.exit]) {

                    // If there's a response body, pass it to the callback.
                    if (responseInfo.body !== undefined) {
                      return exitCallbacks[responseInfo.exit](tolerateAsIfSuccess ? resultFromInterceptOrTolerate : responseInfo.body, responseInfo);
                    }
                    // Otherwise, there's no response body.
                    // So if this is a "success" response, or any 2xx response,
                    // then don't pass a first arg to the callback.
                    else if (tolerateAsIfSuccess || responseInfo.exit === 'success' || (responseInfo.statusCode >= 200 && responseInfo.statusCode < 300)) {
                      return exitCallbacks['success'](tolerateAsIfSuccess ? resultFromInterceptOrTolerate : undefined, responseInfo);
                    }
                    // Otherwise, pass an error instance as the first arg of the callback.
                    else {
                      errorInstance.stack += '\n'+
                      '\n'+
                      'Error Summary:\n'+
                      '(see `.responseInfo` for more details)\n'+
                      '·-------------·----------------------------------------·\n'+
                      '|    Protocol | '+(requestInfo.protocolName==='jQuery'?'http(s)://   (jQuery)':requestInfo.protocolName==='io.socket'?'ws(s)://   (io.socket)':requestInfo.protocolName)+'\n'+
                      '|     Address | '+requestInfo.verb.toUpperCase()+' '+requestInfo.url+'\n'+
                      '|        Exit | '+responseInfo.exit+'\n'+
                      '| Status Code | '+responseInfo.statusCode+'\n'+
                      '·-------------·----------------------------------------·';
                      if (responseInfo.body !== undefined) {
                        errorInstance.stack += '\n\nResponse Body:\n'+responseInfo.body;
                      }
                      errorInstance.responseInfo = responseInfo;
                      errorInstance.exit = responseInfo.exit;
                      errorInstance.code = responseInfo.exit;
                      return exitCallbacks[responseInfo.exit](errorInstance, responseInfo);
                    }
                  }
                  // Otherwise, if this is a "success" response, or any 2xx response, then...
                  else if (tolerateAsIfSuccess || responseInfo.exit === 'success' || (responseInfo.statusCode >= 200 && responseInfo.statusCode < 300)) {
                    if (exitCallbacks['success']) {
                      // Either forward to the "success" callback (if there is one)
                      return exitCallbacks['success'](tolerateAsIfSuccess ? resultFromInterceptOrTolerate : responseInfo.body, responseInfo);
                    }
                    else {
                      // or otherwise do nothing.
                    }
                  }
                  // Otherwise call the error callback.
                  else if (exitCallbacks['error']) {
                    errorInstance.stack += '\n'+
                    '\n'+
                    'Error Summary:\n'+
                    '(see `.responseInfo` for more details)\n'+
                    '·-------------·----------------------------------------·\n'+
                    '|    Protocol | '+(requestInfo.protocolName==='jQuery'?'http(s)://   (jQuery)':requestInfo.protocolName==='io.socket'?'ws(s)://   (io.socket)':requestInfo.protocolName)+'\n'+
                    '|     Address | '+requestInfo.verb.toUpperCase()+' '+requestInfo.url+'\n'+
                    '|        Exit | '+responseInfo.exit+'\n'+
                    '| Status Code | '+responseInfo.statusCode+'\n'+
                    '·-------------·----------------------------------------·';
                    if (responseInfo.body !== undefined) {
                      errorInstance.stack += '\n\nResponse Body:\n'+responseInfo.body;
                    }
                    errorInstance.responseInfo = responseInfo;
                    errorInstance.exit = responseInfo.exit;
                    errorInstance.code = responseInfo.code;
                    return exitCallbacks['error'](errorInstance, responseInfo);
                  }
                  // Or if there isn't an error callback, just throw.
                  else {
                    errorInstance.stack += '\n'+
                    '\n'+
                    'Error Summary:\n'+
                    '(see `.responseInfo` for more details)\n'+
                    '·-------------·----------------------------------------·\n'+
                    '|    Protocol | '+(requestInfo.protocolName==='jQuery'?'http(s)://   (jQuery)':requestInfo.protocolName==='io.socket'?'ws(s)://   (io.socket)':requestInfo.protocolName)+'\n'+
                    '|     Address | '+requestInfo.verb.toUpperCase()+' '+requestInfo.url+'\n'+
                    '|        Exit | '+responseInfo.exit+'\n'+
                    '| Status Code | '+responseInfo.statusCode+'\n'+
                    '·-------------·----------------------------------------·';
                    if (responseInfo.body !== undefined) {
                      errorInstance.stack += '\n\nResponse Body:\n'+responseInfo.body;
                    }
                    errorInstance.stack = UNHANDLED_ERR_PREFIX_MSG + errorInstance.stack;
                    errorInstance.responseInfo = responseInfo;
                    throw errorInstance;
                  }
                }//‡
                //  ┌┐┌┌─┐  ┌─┐┌─┐┬  ┬  ┌┐ ┌─┐┌─┐┬┌─  ┌─┐┌─┐  ┌─┐┌┐┌┬ ┬  ┬┌─┬┌┐┌┌┬┐
                //  ││││ │  │  ├─┤│  │  ├┴┐├─┤│  ├┴┐  │ │├┤   ├─┤│││└┬┘  ├┴┐││││ ││
                //  ┘└┘└─┘  └─┘┴ ┴┴─┘┴─┘└─┘┴ ┴└─┘┴ ┴  └─┘└    ┴ ┴┘└┘ ┴   ┴ ┴┴┘└┘─┴┘
                // If _no callbacks of any kind_ were provided...
                else if (_.isUndefined(exitCallbacks)) {

                  // If this was successful, then do nothing.
                  if (tolerateAsIfSuccess || responseInfo.exit === 'success' || (responseInfo.statusCode >= 200 && responseInfo.statusCode < 300)) {
                    return;
                  }
                  // Otherwise, throw.
                  else {
                    errorInstance.stack += '\n'+
                    '\n'+
                    'Error Summary:\n'+
                    '(see `.responseInfo` for more details)\n'+
                    '·-------------·----------------------------------------·\n'+
                    '|    Protocol | '+(requestInfo.protocolName==='jQuery'?'http(s)://   (jQuery)':requestInfo.protocolName==='io.socket'?'ws(s)://   (io.socket)':requestInfo.protocolName)+'\n'+
                    '|     Address | '+requestInfo.verb.toUpperCase()+' '+requestInfo.url+'\n'+
                    '|        Exit | '+responseInfo.exit+'\n'+
                    '| Status Code | '+responseInfo.statusCode+'\n'+
                    '·-------------·----------------------------------------·';
                    if (responseInfo.body !== undefined) {
                      errorInstance.stack += '\n\nResponse Body:\n'+responseInfo.body;
                    }
                    errorInstance.stack = UNHANDLED_ERR_PREFIX_MSG + errorInstance.stack;
                    errorInstance.responseInfo = responseInfo;
                    throw errorInstance;
                  }
                }//‡
                else {
                  throw new Error('Invalid usage of Cloud.*() method.  Provide either a dictionary of callbacks, a single callback function, or NOTHING to `.exec()`.');
                }

              });//_∏_  </cb from † _runInterceptOrTolerationMaybe()>

            });//_∏_  </cb from † _makeAjaxCallWithAppropriateProtocol()>

            // --
            // > Note that we don't return anything at all here.
            // > (That's to ensure userland code doesn't attempt any further chaining or `await`ing.)

          },//</definition of `.exec()` >

          switch: function (){
            deferred.exec.apply(deferred, arguments);
            // --
            // > Note that we don't return anything at all here.
            // > (That's to ensure userland code doesn't attempt any further chaining or `await`ing.)
          },

          // FUTURE: use parley for this instead, if available
          log: function (){

            console.log('Running with `.log()`...');

            this.exec(function(err, result) {
              if (err) {
                console.error();
                console.error('- - - - - - - - - - - - - - - - - - - - - - - -');
                console.error('An error occurred:');
                console.error();
                console.error(err);
                console.error('- - - - - - - - - - - - - - - - - - - - - - - -');
                console.error();
                return;
              }//-•

              console.log();
              if (_.isUndefined(result)) {
                console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
                console.log('Finished successfully.');
                console.log();
                console.log('(There was no result.)');
                console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
              }
              else {
                console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
                console.log('Finished successfully.');
                console.log();
                console.log('Result:');
                console.log();
                console.log(result);
                console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
              }
              console.log();

            });//_∏_

            // --
            // > Note that we don't return anything at all here.
            // > (That's to ensure userland code doesn't attempt any further chaining or `await`ing.)
          }

        };// </define deferred object>



        //  ███╗   ███╗███████╗██████╗  ██████╗ ███████╗    ██████╗ ███████╗███████╗ █████╗ ██╗   ██╗██╗  ████████╗███████╗
        //  ████╗ ████║██╔════╝██╔══██╗██╔════╝ ██╔════╝    ██╔══██╗██╔════╝██╔════╝██╔══██╗██║   ██║██║  ╚══██╔══╝██╔════╝
        //  ██╔████╔██║█████╗  ██████╔╝██║  ███╗█████╗      ██║  ██║█████╗  █████╗  ███████║██║   ██║██║     ██║   ███████╗
        //  ██║╚██╔╝██║██╔══╝  ██╔══██╗██║   ██║██╔══╝      ██║  ██║██╔══╝  ██╔══╝  ██╔══██║██║   ██║██║     ██║   ╚════██║
        //  ██║ ╚═╝ ██║███████╗██║  ██║╚██████╔╝███████╗    ██████╔╝███████╗██║     ██║  ██║╚██████╔╝███████╗██║   ███████║
        //  ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═════╝ ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚══════╝
        //
        //  ███████╗██████╗  ██████╗ ███╗   ███╗    ███████╗███╗   ██╗██████╗ ██████╗  ██████╗ ██╗███╗   ██╗████████╗
        //  ██╔════╝██╔══██╗██╔═══██╗████╗ ████║    ██╔════╝████╗  ██║██╔══██╗██╔══██╗██╔═══██╗██║████╗  ██║╚══██╔══╝
        //  █████╗  ██████╔╝██║   ██║██╔████╔██║    █████╗  ██╔██╗ ██║██║  ██║██████╔╝██║   ██║██║██╔██╗ ██║   ██║
        //  ██╔══╝  ██╔══██╗██║   ██║██║╚██╔╝██║    ██╔══╝  ██║╚██╗██║██║  ██║██╔═══╝ ██║   ██║██║██║╚██╗██║   ██║
        //  ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║    ███████╗██║ ╚████║██████╔╝██║     ╚██████╔╝██║██║ ╚████║   ██║
        //  ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝    ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝      ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝
        //
        //  ██████╗ ███████╗███████╗██╗███╗   ██╗██╗████████╗██╗ ██████╗ ███╗   ██╗
        //  ██╔══██╗██╔════╝██╔════╝██║████╗  ██║██║╚══██╔══╝██║██╔═══██╗████╗  ██║
        //  ██║  ██║█████╗  █████╗  ██║██╔██╗ ██║██║   ██║   ██║██║   ██║██╔██╗ ██║
        //  ██║  ██║██╔══╝  ██╔══╝  ██║██║╚██╗██║██║   ██║   ██║██║   ██║██║╚██╗██║
        //  ██████╔╝███████╗██║     ██║██║ ╚████║██║   ██║   ██║╚██████╔╝██║ ╚████║
        //  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
        //
        // Now set up the endpoint definition.
        //////////////////////////////////////////////////////////////////////


        // If a function was supplied, call it and use the dictionary
        // it returns as our request info.
        //////////////////////////////////////////////////////////////////////
        // e.g. function (argins){
        //   return {
        //     verb: 'post',
        //     url: '/foo/bar',
        //     params: {
        //       whatever: 'you want' + ' in here maybe using '+argins.whatever
        //     },
        //     headers: {}
        //   }
        // }
        if (typeof appLevelSdkEndpointDef === 'function') {
          var returnedFromEndpointDefFn = appLevelSdkEndpointDef.apply(this, argins);
          if (typeof returnedFromEndpointDefFn !== 'object') {
            throw new Error('Consistency violation: Function for CloudSDK endpoint (`'+methodName+'`) returned an invalid result.  The return value of the specified function is not a dictionary!  If a function is supplied for an endpoint definition, it must return a dictionary containing a `verb` and a `url`.  The returned dictionary may also contain dynamic, per-request header & parameter values.');
          }

          if (!_.isUndefined(returnedFromEndpointDefFn.headers)) {
            deferred = deferred.headers(returnedFromEndpointDefFn.headers);
          }
          else if (options.headers) {
            deferred = deferred.headers(options.headers);
          }

          if (!_.isUndefined(returnedFromEndpointDefFn.protocol)) {
            deferred = deferred.protocol(returnedFromEndpointDefFn.protocol);
          }
          else if (options.protocol) {
            deferred.protocol(options.protocol);
          }
          else { deferred.protocol(DEFAULT_PROTOCOL_NAME); }

          requestInfo.verb = returnedFromEndpointDefFn.verb;
          requestInfo.url = returnedFromEndpointDefFn.url;
          requestInfo.params = argins;
        }

        // If a dictionary was supplied, use that as our request info.
        //////////////////////////////////////////////////////////////////////
        // e.g. {
        //   verb: 'post',
        //   url: '/foo/bar',
        //   protocol: 'io.socket',//optional, defaults to 'jQuery'
        //   headers: {'x-auth': 'foo'},//optional, defaults to undefined
        // }
        else if (typeof appLevelSdkEndpointDef === 'object') {
          if (!_.isUndefined(appLevelSdkEndpointDef.headers)) {
            deferred.headers(appLevelSdkEndpointDef.headers);
          }
          else if (options.headers) {
            deferred = deferred.headers(options.headers);
          }

          if (!_.isUndefined(appLevelSdkEndpointDef.protocol)) {
            deferred.protocol(appLevelSdkEndpointDef.protocol);
          }
          else if (options.protocol) {
            deferred.protocol(options.protocol);
          }
          else { deferred.protocol(DEFAULT_PROTOCOL_NAME); }

          requestInfo.verb = appLevelSdkEndpointDef.verb;
          requestInfo.url = appLevelSdkEndpointDef.url;
          requestInfo.params = argins;
        }

        // If a string was supplied, expand and use that as our request info.
        //////////////////////////////////////////////////////////////////////
        // e.g. "POST /api/v1/lawnmowers/foo/inputs/bar"
        else if (typeof appLevelSdkEndpointDef === 'string') {

          if (options.headers) {
            deferred = deferred.headers(options.headers);
          }

          // Set up default protocol.
          if (options.protocol) {
            deferred.protocol(options.protocol);
          }
          else { deferred.protocol(DEFAULT_PROTOCOL_NAME); }

          // And then fold in the other pieces of request info.
          requestInfo.verb = appLevelSdkEndpointDef.replace(/^\s*([^\/\s]+)\s*\/.*$/, '$1');
          requestInfo.url = appLevelSdkEndpointDef.replace(/^\s*[^\/\s]+\s*\/(.*)$/, '/$1');
          requestInfo.params = argins;
        }

        else {
          throw new Error('Consistency violation: Something happened to CloudSDK endpoint (`'+methodName+'`).  This was not noticed initially when building up CloudSDK endpoints, but this endpoint is now invalid.  Endpoints should be defined as either (1) a string like "GET /foo", (2) a dictionary containing a `verb` and a `url`, or (3) a function that returns a dictionary like that.');
        }


        // Now template in URL pattern vars from the runtime request args.
        /////////////////////////////////////////////////////////////////////////////

        // Find keys in `params` which are route parameters
        // (e.g. referenced by the endpoint URL)
        // > Note that we're not actually interested in the return value
        // > from this first `.replace()` here.
        var routeParameters = {};
        requestInfo.url.replace(/(\:[^\/\:\.\?]+\??)/g, function ($all, $1){
          var routeParamName = $1.replace(/^\:/, '').replace(/\??$/, '');

          // Optional:
          if ($1.match(/\?$/)) {
            if (requestInfo.params && requestInfo.params[routeParamName]) {
              routeParameters[routeParamName] = requestInfo.params[routeParamName];
            }
          }
          // Mandatory:
          else {
            if (!requestInfo.params || requestInfo.params[routeParamName] === undefined) {
              throw new Error('Missing required param: `'+routeParamName+'`');
            }
            routeParameters[routeParamName] = requestInfo.params[routeParamName];
          }
        });//∞

        // Then delete them from the `params` object
        Object.keys(routeParameters).forEach(function (paramName){
          delete requestInfo.params[paramName];
        });

        // Now stick the route parameters into the destination url
        requestInfo.url = requestInfo.url.replace(/(\:[^\/\:\.\?]+\??)/g, function ($all, $1){
          var routeParamName = $1.replace(/^\:/, '').replace(/\??$/, '');
          if (routeParameters[routeParamName] === undefined) { return ''; }
          return routeParameters[routeParamName];
        });



        // Prepend the API base URL to `requestInfo.url`.
        /////////////////////////////////////////////////////////////////////////////
        requestInfo.url = options.apiBaseUrl + requestInfo.url;


        // Ensure verb exists, and then lower-case it.
        /////////////////////////////////////////////////////////////////////////////
        if (!requestInfo.verb) { throw new Error('CloudSDK endpoint (`'+methodName+'`) is invalid: No HTTP verb specified.  Please specify an HTTP verb (e.g. `GET`, `POST`, etc.)'); }
        requestInfo.verb = (requestInfo.verb || 'get').toLowerCase();


        // Attach the `requestInfo` as a property on the Deferred object itself, for easier integration
        // with 3rd-party tools (e.g. autocomplete)
        deferred.requestInfo = requestInfo;

        // Return the deferred object.
        return deferred;

      };//</ definition of this Cloud.* method()>

      // Escape hatch that always allows using named parameters.
      // (TODO: replace this temporary hack with the new version of cloud.js)
      memo[methodName].with = function (argins) {
        return memo[methodName](argins);
      };//ƒ

      return memo;
    }, {});//</ _.reduce() :: each defined endpoint method >

    // Remove the `.setup()` method, now that it's been called.
    delete Cloud.setup;

    // Now attach the methods
    _.extend(Cloud, methods);

  };

  return Cloud;

});
