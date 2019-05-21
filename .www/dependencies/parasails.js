/**
 * parasails.js
 * v0.4.0
 *
 * Copyright 2017, Mike McNeil (@mikermcneil)
 * MIT License
 * https://www.npmjs.com/package/parasails
 * https://sailsjs.com/support
 */
(function(global, factory){
  var Vue;
  var _;
  var VueRouter;
  var $;

  //˙°˚°·.
  //‡CJS  ˚°˚°·˛
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var _require = require;// eslint-disable-line no-undef
    var _module = module;// eslint-disable-line no-undef
    // required deps:
    Vue = _require('vue');
    _ = _require('lodash');
    // optional deps:
    try { VueRouter = _require('vue-router'); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    try { $ = _require('jquery'); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    // export:
    _module.exports = factory(Vue, _, VueRouter, $);
  }
  //˙°˚°·
  //‡AMD ˚¸
  else if(typeof define === 'function' && define.amd) {// eslint-disable-line no-undef
    // Register as an anonymous module.
    define([], function () {// eslint-disable-line no-undef
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: maybe use optional dep. loading here instead?
      // e.g.  `function('vue', 'lodash', 'vue-router', 'jquery')`
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // required deps:
      if (!global.Vue) { throw new Error('`Vue` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Vue.js library is getting brought in before `parasails`.)'); }
      Vue = global.Vue;
      if (!global._) { throw new Error('`_` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Lodash library is getting brought in before `parasails`.)'); }
      _ = global._;
      // optional deps:
      VueRouter = global.VueRouter || undefined;
      $ = global.$ || global.jQuery || undefined;

      // So... there's not really a huge point to supporting AMD here--
      // except that if you're using it in your project, it makes this
      // module fit nicely with the others you're using.  And if you
      // really hate globals, I guess there's that.
      // ¯\_(ツ)_/¯
      return factory(Vue, _, VueRouter, $);
    });//ƒ
  }
  //˙°˚˙°·
  //‡NUDE ˚°·˛
  else {
    // required deps:
    if (!global.Vue) { throw new Error('`Vue` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Vue.js library is getting brought in before `parasails`.)'); }
    Vue = global.Vue;
    if (!global._) { throw new Error('`_` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Lodash library is getting brought in before `parasails`.)'); }
    _ = global._;
    // optional deps:
    VueRouter = global.VueRouter || undefined;
    $ = global.$ || global.jQuery || undefined;
    // export:
    if (global.parasails) { throw new Error('Conflicting global (`parasails`) already exists!'); }
    global.parasails = factory(Vue, _, VueRouter, $);
  }
})(this, function (Vue, _, VueRouter, $){


  //  ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
  //  ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
  //  ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗
  //  ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝
  //  ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
  //  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //
  //  ███████╗████████╗ █████╗ ████████╗███████╗
  //  ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
  //  ███████╗   ██║   ███████║   ██║   █████╗
  //  ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
  //  ███████║   ██║   ██║  ██║   ██║   ███████╗
  //  ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //

  /**
   * Module state
   */

  // Keep track of whether or not a page script has already been loaded in the DOM.
  var didAlreadyLoadPageScript;

  // The variable we'll be exporting.
  var parasails;


  //  ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
  //  ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
  //  ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗
  //  ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝
  //  ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
  //  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //
  //  ██╗   ██╗████████╗██╗██╗     ███████╗
  //  ██║   ██║╚══██╔══╝██║██║     ██╔════╝
  //  ██║   ██║   ██║   ██║██║     ███████╗
  //  ██║   ██║   ██║   ██║██║     ╚════██║
  //  ╚██████╔╝   ██║   ██║███████╗███████║
  //   ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
  //

  /**
   * Module utilities (private)
   */

  function _ensureGlobalCache(){
    parasails._cache = parasails._cache || {};
  }

  function _exportOnGlobalCache(moduleName, moduleDefinition){
    _ensureGlobalCache();
    if (parasails._cache[moduleName]) { throw new Error('Something else (e.g. a utility or constant) has already been registered under that name (`'+moduleName+'`)'); }
    parasails._cache[moduleName] = moduleDefinition;
  }

  function _exposeJQueryPoweredMethods(def, currentModuleEntityNoun){
    if (!currentModuleEntityNoun) { throw new Error('Consistency violation: Bad internal usage. '); }
    if (def.methods && def.methods.$get) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$get` key, but you\'re not allowed to override that'); }
    if (def.methods && def.methods.$find) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$find` key, but you\'re not allowed to override that'); }
    if (def.methods && def.methods.$focus) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$focus` key, but you\'re not allowed to override that'); }
    def.methods = def.methods || {};
    if ($) {
      def.methods.$get = function (){ return $(this.$el); };
      def.methods.$find = function (subSelector){ return $(this.$el).find(subSelector); };
      def.methods.$focus = function (subSelector){
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: If the current Vue thing hasn't mounted yet, throw an error.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var $fieldToAutoFocus = $(this.$el).find(subSelector);
        if ($fieldToAutoFocus.length === 0) { throw new Error('Could not autofocus-- no such element exists within this '+currentModuleEntityNoun+'.'); }
        if ($fieldToAutoFocus.length > 1) { throw new Error('Could not autofocus `'+subSelector+'`-- too many elements matched!'); }
        $fieldToAutoFocus.focus();
      };
    }
    else {
      def.methods.$get = function (){ throw new Error('Cannot use .$get() method because, at the time when this '+currentModuleEntityNoun+' was registered, jQuery (`$`) did not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure jQuery is getting brought in before `parasails`.)'); };
      def.methods.$find = function (){ throw new Error('Cannot use .$find() method because, at the time when this '+currentModuleEntityNoun+' was registered, jQuery (`$`) did not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure jQuery is getting brought in before `parasails`.)'); };
      def.methods.$focus = function (){ throw new Error('Cannot use .$focus() method because, at the time when this '+currentModuleEntityNoun+' was registered, jQuery (`$`) did not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure jQuery is getting brought in before `parasails`.)'); };
    }
  }

  function _wrapMethodsAndVerifyNoArrowFunctions(def){
    def.methods = def.methods || {};
    _.each(_.keys(def.methods), function (methodName) {
      if (!_.isFunction(def.methods[methodName])) {
        throw new Error('Unexpected definition for Vue method `'+methodName+'`.  Expecting a function, but got "'+def.methods[methodName]+'"');
      }

      var isArrowFunction;
      try {
        var asString = def.methods[methodName].toString();
        isArrowFunction = asString.match(/^\s*\(\s*/) || asString.match(/^\s*async\s*\(\s*/);
      } catch (err) {
        console.warn('Consistency violation: Encountered unexpected error when attempting to verify that Vue method `'+methodName+'` is not an arrow function.  (What browser is this?!)  Anyway, error details:', err);
      }

      if (isArrowFunction) {
        throw new Error('Unexpected definition for Vue method `'+methodName+'`.  Vue methods cannot be specified as arrow functions, because then you wouldn\'t have access to `this` (i.e. the Vue vm instance).  Please use a function like `function(){…}` instead.');
      }

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE:
      // Inject a wrapper function in order to provide more advanced / cleaner error handling.
      // (especially for AsyncFunctions)
      // ```
      // var _originalMethod = def.methods[methodName];
      // def.methods[methodName] = function(){
      //
      //   var rawResult;
      //   var originalCtx = this;
      //   (function(proceed){
      //     if (_originalMethod.constructor.name === 'AsyncFunction') {
      //       rawResult = _originalMethod.apply(originalCtx, arguments);
      //       // The result of an AsyncFunction is always a promise:
      //       rawResult.catch(function(err) {
      //         proceed(err);
      //       });//_∏_
      //       rawResult.then(function(actualResult){
      //         return proceed(undefined, actualResult);
      //       });
      //     }
      //     else {
      //       try {
      //         rawResult = _originalMethod.apply(originalCtx, arguments);
      //       } catch (err) { return proceed(err); }
      //       return proceed(undefined, rawResult);
      //     }
      //   })(function(err, actualResult){//eslint-disable-line no-unused-vars
      //     if (err) {
      //       // FUTURE: perform more advanced error handling here
      //       throw err;
      //     }
      //
      //     // Otherwise do nothing.
      //
      //   });//_∏_  (†)
      //
      //   // For compatibility, return the raw result.
      //   return rawResult;
      //
      // };//ƒ
      // ```
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    });//∞
  }


  //  ███████╗██╗  ██╗██████╗  ██████╗ ██████╗ ████████╗███████╗
  //  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝
  //  █████╗   ╚███╔╝ ██████╔╝██║   ██║██████╔╝   ██║   ███████╗
  //  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║██╔══██╗   ██║   ╚════██║
  //  ███████╗██╔╝ ██╗██║     ╚██████╔╝██║  ██║   ██║   ███████║
  //  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //

  /**
   * Module exports
   */

  parasails = {};


  /**
   * registerUtility()
   *
   * Build a callable utility function, then attach it to the global namespace
   * so that it can be accessed later via `.require()`.
   *
   * @param {String} utilityName
   * @param {Function} def
   */

  parasails.registerUtility = function(utilityName, def){

    // Usage
    if (!utilityName) { throw new Error('1st argument (utility name) is required'); }
    if (!def) { throw new Error('2nd argument (utility function definition) is required'); }
    if (!_.isFunction(def)) { throw new Error('2nd argument (utility function definition) should be a function'); }

    // Build callable utility
    // > FUTURE: also support machine defs?
    var callableUtility = def;
    callableUtility.name = utilityName;

    // Attach to global cache
    _exportOnGlobalCache(utilityName, callableUtility);

  };


  /**
   * registerConstant()
   *
   * Attach a constant to the global namespace so that it can be accessed
   * later via `.require()`.
   *
   * @param {String} constantName
   * @param {Ref} value
   */

  parasails.registerConstant = function(constantName, value){

    // Usage
    if (!constantName) { throw new Error('1st argument (constant name) is required'); }
    if (value === undefined) { throw new Error('2nd argument (the constant value) is required'); }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: deep-freeze constant, if supported
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Attach to global cache
    _exportOnGlobalCache(constantName, value);

  };



  /**
   * registerComponent()
   *
   * Define a Vue component.
   *
   * @param {String} componentName
   * @param {Dictionary} def
   *
   * @returns {Ref}  [new vue component for this page]
   */

  parasails.registerComponent = function(componentName, def){

    // Expose extra methods on component def, if jQuery is available.
    _exposeJQueryPoweredMethods(def, 'component');

    // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
    _wrapMethodsAndVerifyNoArrowFunctions(def);

    Vue.component(componentName, def);

  };


  /**
   * require()
   *
   * Require a utility function or constant from the global namespace.
   *
   * @param {String} moduleName
   * @returns {Ref}  [e.g. the callable utility function, or the value of the constant]
   * @throws {Error} if no such module has been registered
   */

  parasails.require = function(moduleName) {

    // Usage
    if (!moduleName) { throw new Error('1st argument (module name -- i.e. the name of a utility or constant) is required'); }

    // Fetch from global cache
    _ensureGlobalCache();
    if (parasails._cache[moduleName] === undefined) {
      var err = new Error('No utility or constant is registered under that name (`'+moduleName+'`)');
      err.name = 'RequireError';
      err.code = 'MODULE_NOT_FOUND';
      throw err;
    }
    return parasails._cache[moduleName];

  };


  /**
   * registerPage()
   *
   * Define a page script, if applicable for the current contents of the DOM.
   *
   * @param {String} pageName
   * @param {Dictionary} def
   *
   * @returns {Ref}  [new vue app thing for this page]
   */

  parasails.registerPage = function(pageName, def){

    // Usage
    if (!pageName) { throw new Error('1st argument (page name) is required'); }
    if (!def) { throw new Error('2nd argument (page script definition) is required'); }

    // Only actually build+load this page script if it is relevant for the current contents of the DOM.
    if (!document.getElementById(pageName)) { return; }//eslint-disable-line no-undef

    // Spinlock
    if (didAlreadyLoadPageScript) { throw new Error('Cannot load page script (`'+pageName+') because a page script has already been loaded on this page.'); }
    didAlreadyLoadPageScript = true;

    // Automatically set `el`
    if (def.el) { throw new Error('Page script definition contains `el`, but you\'re not allowed to override that'); }
    def.el = '#'+pageName;

    // Expose extra methods, if jQuery is available.
    _exposeJQueryPoweredMethods(def, 'page script');

    // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
    _wrapMethodsAndVerifyNoArrowFunctions(def);

    // Automatically attach `pageName` to `data`, for convenience.
    if (def.data && def.data.pageName) { throw new Error('Page script definition contains `data` with a `pageName` key, but you\'re not allowed to override that'); }
    def.data = _.extend({
      pageName: pageName
    }, def.data||{});

    // Attach `goto` method, for convenience.
    if (def.methods && def.methods.goto) { throw new Error('Page script definition contains `methods` with a `goto` key-- but you\'re not allowed to override that'); }
    def.methods = def.methods || {};
    if (VueRouter) {
      def.methods.goto = function (rootRelativeUrlOrOpts){
        return this.$router.push(rootRelativeUrlOrOpts);
      };
    }
    else {
      def.methods.goto = function (){ throw new Error('Cannot use .goto() method because, at the time when this page script was registered, VueRouter did not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure VueRouter is getting brought in before `parasails`.)'); };
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Make sure we didn't type "beforeMounted" or "beforeDestroyed" because those aren't real things
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    // If virtualPages was specified, check usage and then...
    if (def.virtualPages && def.router) { throw new Error('Cannot specify both `virtualPages` AND an actual Vue `router`!  Use one or the other.'); }
    if (def.router && !VueRouter) { throw new Error('Cannot use `router`, because that depends on the Vue Router.  But `VueRouter` does not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the VueRouter plugin is getting brought in before `parasails`.)'); }
    if (!def.virtualPages && def.html5HistoryMode !== undefined) { throw new Error('Cannot specify `html5HistoryMode` without also specifying `virtualPages`!'); }
    if (!def.virtualPages && def.beforeEach !== undefined) { throw new Error('Cannot specify `beforeEach` without also specifying `virtualPages`!'); }
    if ((def.beforeNavigate || def.afterNavigate) && def.virtualPages !== true) { throw new Error('Cannot specify `beforeNavigate` or `afterNavigate` unless you set `virtualPages: true`!'); }
    if (def.virtualPages) {
      if (!VueRouter) { throw new Error('Cannot use `virtualPages`, because it depends on the Vue Router.  But `VueRouter` does not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the VueRouter plugin is getting brought in before `parasails`.)'); }

      // Now we'll replace `virtualPages` in our def with the thing that VueRouter actually expects:

      // If `virtualPages: true` was specified, then use reasonable defaults:
      //
      // > Note: This assumes that, somewhere within the parent page's template, there is:
      // > ```
      // > <router-view></router-view>
      // > ```
      if (def.virtualPages === true) {
        if (def.beforeEach !== undefined) { throw new Error('Cannot specify `virtualPages: true` AND `beforeEach` at the same time!'); }
        if (!def.virtualPagesRegExp && def.html5HistoryMode === 'history') { throw new Error('If `html5HistoryMode: \'history\'` is specified, then virtualPagesRegExp must also be specified!'); }
        if (def.virtualPagesRegExp && !_.isRegExp(def.virtualPagesRegExp)) { throw new Error('Invalid `virtualPagesRegExp`: If specified, this must be a regular expression -- e.g. `/^\/manage\/access\/?([^\/]+)?/`'); }

        // Check for <router-view> element
        // (to provide a better error msg if it was omitted)
        var customBeforeMountLC;
        if (def.beforeMount) {
          customBeforeMountLC = def.beforeMount;
        }//ﬁ
        def.beforeMount = function(){

          // Inject additional code to check for <router-view> element:
          // console.log('this.$find(\'router-view\').length', this.$find('router-view').length);
          if (this.$find('router-view').length === 0) {
            throw new Error(
              'Cannot mount this page with `virtualPages: true` because no '+
              '<router-view> element exists in this page\'s HTML.\n'+
              'Please be sure the HTML includes:\n'+
              '\n'+
              '```\n'+
              '<router-view></router-view>\n'+
              '```\n'
            );
          }//•

          // Then call the original, custom "beforeMount" function, if there was one.
          if (customBeforeMountLC) {
            customBeforeMountLC.apply(this, []);
          }
        };//ƒ

        if (def.methods._navigate) {
          throw new Error('Could not use `virtualPages: true`, because a conflicting `_navigate` method is defined.  Please remove it, or do something else.');
        }

        // Set up local variables to refer to things in `def`, since it will be changing below.
        var pathMatchingRegExp;
        if (def.html5HistoryMode === 'history') {
          pathMatchingRegExp = def.virtualPagesRegExp;
        } else {
          pathMatchingRegExp = /.*/;
        }

        var beforeNavigate = def.beforeNavigate;
        var afterNavigate = def.afterNavigate;

        // Now modify the definition's methods and remove all relevant top-level props understood
        // by parasails (but not by Vue.js) to avoid creating any weird additional dependence on
        // parasails features beyond the expected usage.

        def.methods = _.extend(def.methods||{}, {
          _navigate: function(virtualPageSlug){

            if (beforeNavigate) {
              var doCancelNavigate = beforeNavigate.apply(this, [ virtualPageSlug ]);
              if (doCancelNavigate === false) {
                return;
              }//•
            }

            this.virtualPageSlug = virtualPageSlug;

            // console.log('navigate!  Got:', arguments);
            // console.log('Navigated. (Set `this.virtualPageSlug=\''+virtualPageSlug+'\'`)');

            if (afterNavigate) {
              afterNavigate.apply(this, [ virtualPageSlug ]);
            }

          }
        });

        def = _.extend({
          router: new VueRouter({
            mode: def.html5HistoryMode || 'hash',
            routes: [
              {
                path: '*',
                component: (function(){
                  var vueComponentDef = {
                    render: function(){},
                    beforeRouteUpdate: function (to,from,next){
                      // this.$emit('navigate', to.path); <<old way
                      var path = to.path;
                      var matches = path.match(pathMatchingRegExp);
                      if (!matches) { throw new Error('Could not match current URL path (`'+path+'`) as a virtual page.  Please check the `virtualPagesRegExp` -- e.g. `/^\/foo\/bar\/?([^\/]+)?/`'); }
                      // console.log('this.$parent', this.$parent);
                      this.$parent._navigate(matches[1]||'');
                      // this.$emit('navigate', {
                      //   rawPath: path,
                      //   virtualPageSlug: matches[1]||''
                      // });
                      return next();
                    },
                    mounted: function(){
                      // this.$emit('navigate', this.$route.path); <<old way
                      var path = this.$route.path;
                      var matches = path.match(pathMatchingRegExp);
                      if (!matches) { throw new Error('Could not match current URL path (`'+path+'`) as a virtual page.  Please check the `virtualPagesRegExp` -- e.g. `/^\/foo\/bar\/?([^\/]+)?/`'); }
                      this.$parent._navigate(matches[1]||'');
                      // this.$emit('navigate', {
                      //   rawPath: path,
                      //   virtualPageSlug: matches[1]||''
                      // });
                    }
                  };
                  // Expose extra methods on virtual page script, if jQuery is available.
                  _exposeJQueryPoweredMethods(vueComponentDef, 'virtual page');

                  // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
                  _wrapMethodsAndVerifyNoArrowFunctions(vueComponentDef);

                  return vueComponentDef;
                })()
              }
            ],
          })
        }, _.omit(def, ['virtualPages', 'virtualPagesRegExp', 'html5HistoryMode', 'beforeNavigate', 'afterNavigate']));
      }
      // Otherwise, if a dictionary of `virtualPages` was specified, use those client-side
      // routes to configure VueRouter.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: Re-evaluate this.  This usage will probably change!
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      else if (_.isObject(def.virtualPages) && !_.isArray(def.virtualPages) && !_.isFunction(def.virtualPages)) {
        if (def.virtualPagesRegExp) { throw new Error('Cannot use `virtualPagesRegExp` with current `virtualPages` setting.  To use the regexp, you must use `virtualPages: true`.'); }

        def = _.extend(
          {
            // Pass in `router`
            router: (function(){
              var newRouter = new VueRouter({

                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE: Consider binding popstate handler in order to intercept
                // back/fwd button navigation / typing in the URL bar that would send
                // the user to another URL under the same domain.  This would provide
                // a slightly better user experience for certain cases.
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                mode: def.html5HistoryMode || 'hash',

                routes: _.reduce(def.virtualPages, function(memo, vueComponentDef, urlPattern) {

                  // Expose extra methods on virtual page script, if jQuery is available.
                  _exposeJQueryPoweredMethods(vueComponentDef, 'virtual page');

                  // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
                  _wrapMethodsAndVerifyNoArrowFunctions(vueComponentDef);

                  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                  // FUTURE: If urlPattern contains a url pattern variable (e.g. `:id`)
                  // or wildcard "splat" (e.g. `*`), then log a warning reminding whoever
                  // did it to be careful because of this:
                  // https://router.vuejs.org/en/essentials/dynamic-matching.html#reacting-to-params-changes
                  //
                  // In other words, going between `/foo/3` and `/foo/4` doesn't work as expected.
                  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                  memo.push({
                    path: urlPattern,
                    component: vueComponentDef
                  });

                  return memo;
                }, [])
              });

              if (def.beforeEach) {
                newRouter.beforeEach(def.beforeEach);
              }//ﬁ

              return newRouter;
            })(),


          },
          _.omit(def, ['virtualPages', 'html5HistoryMode', 'beforeEach'])
        );
      }
      else {
        throw new Error('Cannot use `virtualPages` because the specified value doesn\'t match any recognized meaning.  Please specify either `true` (for the default handling) or a dictionary of client-side routing rules.');
      }


    }//ﬁ

    // Construct Vue instance for this page script.
    var vm = new Vue(def);

    return vm;

  };//ƒ




  return parasails;

});//…)
