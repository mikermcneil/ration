// Inject global `before` for our Mocha tests.
before((done)=>{
  try {

    // Grab the Sails singleton.
    // (It'll be exposed as a global momentarily, assuming this app hasn't
    // customized away that behavior.)
    var sails = require('sails');

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Test runner is refusing to proceed (for safety\'s sake, since NODE_ENV=production)');
    }//•

    // Note that we mix in env vars, CLI opts, and the .sailsrc file using
    // the `.getRc()` method, if possible.  But also note that we mix in
    // a few additional overrides to remove clutter from test output, ensure
    // we are working with a clean database, etc.
    var configOverrides = sails.getRc === undefined ? {} : sails.getRc();

    configOverrides = Object.assign({}, configOverrides, {
      hooks: Object.assign({}, configOverrides.hooks, {
        apianalytics: false
      }),
      models: Object.assign({}, configOverrides.models, {
        migrate: 'drop'
      }),
      log: Object.assign({}, configOverrides.log, {
        level: 'error'
        // level: 'silent'
      }),
      routes: Object.assign({}, configOverrides.routes, {
        // Provide a way to get a CSRF token:
        'GET /.temporary/csrf/token/for/tests': { action: 'security/grant-csrf-token' }
      }),
      policies: Object.assign({}, configOverrides.policies, {
        // Poke a hole in any global policies to ensure the test runner can
        // actually get access to a CSRF token.
        'security/grant-csrf-token': true,
      }),
      datastores: Object.assign({}, configOverrides.datastores, {
        default: Object.assign({}, (configOverrides.datastores||{}).default, {
          // To have the tests run against a local mysql database, for example,
          // add configuration here:  (e.g. uncomment the two lines below)
          // adapter: 'sails-mysql',
          // url: 'mysql://root@127.0.0.1:3306/pba',
        })
      }),
    });


    // Lift app
    sails.lift(configOverrides, (err)=>{
      if (err) { return done(err); }

      // First, get a cookie and a CSRF token.
      sails.helpers.http.sendHttpRequest.with({
        method: 'GET',
        url: '/.temporary/csrf/token/for/tests',
        baseUrl: sails.config.custom.baseUrl
      }).exec((err, serverResponse)=>{
        if (err) { return done(new Error('Test runner could not fetch CSRF token.\nDetails:\n'+err.stack)); }

        // console.log(serverResponse);

        var csrfToken;
        try {
          csrfToken = JSON.parse(serverResponse.body)._csrf;
        } catch (err) { return done(new Error('Test runner could not parse CSRF token from the Sails server.\nDetails:\n'+err.stack)); }
        // ^^This `csrfToken` ends up looking something like:
        // ```
        // 5ofSzSuk-82tc94zdjZJX9n9y10VUBtecXPY
        // ```


        var sailsSidCookie;
        try {
          var cookieString = serverResponse.headers['set-cookie'][0];
          // FUTURE: improve the quality of this parse:
          sailsSidCookie = _.trim(cookieString.split(';')[0]);
        } catch (err) { return done(new Error('Test runner could not parse the `set-cookie` response header from the Sails server.\nDetails:\n'+err.stack)); }
        // ^^This `sailsSidCookie` ends up looking something like:
        // ```
        // sails.sid=s%3AUgb8X3P10fc28PSKetgqu9LxOwd875SV.EHurMYDWRYBFK0uhOwIqZZYnDnmHLDOG0YM4LGgkSGE
        // ```


        // Set up Cloud SDK for use in tests (and expose "Cloud" global).
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: deal with cookies.  This probably means doing something
        // different from just calling `.setup()` -- i.e. calling a different
        // thing, or having `.setup()` return a new thing that you then have
        // to save to your Cloud global when you call it in client-side code.
        // Best solution is probably to have Cloud.setup() return the new thing,
        // but also provide a way to grab a fresh "session" (i.e. get a copy of
        // "Cloud" with a fresh cookie jar).  Without a global cookie header,
        // Cloud ALWAYS has a fresh cookie jar, because it doesn't store any cookies.
        // So below, we pass in the cookie we got from fetching our CSRF token.
        //
        // FUTURE: pull this into a nicer Node.js-centric API
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var Cloud;
        try {
          Cloud = require('../../assets/dependencies/cloud');
          Cloud.setup({
            apiBaseUrl: sails.config.custom.baseUrl,
            headers: {
              'x-csrf-token': csrfToken,
              'cookie': sailsSidCookie
            },
            protocol: sails.helpers.http,
            methods: require('../private/CLOUD_SDK_METHODS')
          });

          if (global.Cloud) { throw new Error('Test runner cannot expose `Cloud` -- that global already exists!'); }
          global.Cloud = Cloud;

          // Expose a few other globals, for convenience.
          if (global.assert) { throw new Error('Test runner cannot expose `assert` -- that global already exists!'); }
          if (global.util) { throw new Error('Test runner cannot expose `util` -- that global already exists!'); }
          global.assert = require('assert');
          global.util = require('util');

        } catch (err) { return done(err); }

        return done();

      });//_∏_
    });//_∏_
  } catch (err) { return done(err); }
});
