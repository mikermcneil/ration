/**
 * Module dependencies
 */

var util = require('util');
var path = require('path');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('parley');
var verifyUpstream = require('./private/verify-upstream');


/**
 * uploads hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineUploadsHook(sails) {

  return {

    defaults: {
      uploads: {
        adapter: undefined,
        dirpath: '.tmp/uploads',
      }
    },

    configure: function(){
      if (process.env.NODE_ENV === 'production' && !sails.config.uploads.adapter) {
        throw new Error('In production, `sails.config.uploads.adapter` must be set explicitly!');
      }
    },

    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
    initialize: function (done) {

      sails.log.debug('Initializing custom hook (`uploads`)');

      // Load up the default filesystem adapter, if appropriate.
      var defaultFilesystemAdapter;
      if (process.env.NODE_ENV !== 'production'){
        defaultFilesystemAdapter = require('skipper-disk');
      }//ﬁ


      /**
       * .upload()
       *
       * Upload all of the incoming files in the specified upstream.
       *
       * @param {Ref} upstream
       * @param {Dictionary?} moreOptions
       * @param {Function?} _explicitCbMaybe
       *
       * @returns {Deferred}
       *          @returns {Array}
       *              @of {Dictionary}
       *                  @property {String} fd
       *                  @property {String} type
       */
      sails.upload = function (upstream, moreOptions, _explicitCbMaybe){

        var explicitCb = _.isFunction(moreOptions) ? moreOptions : _explicitCbMaybe;

        var omen = process.env.NODE_ENV !== 'production' || process.env.DEBUG ? flaverr({}, new Error('omen'), sails.upload) : undefined;
        //^In development and when debugging, we use an omen for better stack traces.

        return parley(
          function (done){
            verifyUpstream(upstream, omen);
            var skipperOpts = _.extend({}, sails.config.uploads, moreOptions);
            upstream.upload(skipperOpts, done);//_∏_
          },
          explicitCb||undefined,
          undefined,
          undefined,
          omen
        );
      };

      /**
       * .uploadOne()
       *
       * @param {Ref} upstreamOrFileStream
       * @param {Dictionary?} moreOptions
       * @param {Function?} _explicitCbMaybe
       *
       * @returns {Deferred}
       *          @returns {Dictionary}
       *              @property {String} fd
       *              @property {String} type
       */
      sails.uploadOne = function (upstreamOrFileStream, moreOptions, _explicitCbMaybe){

        var explicitCb = _.isFunction(moreOptions) ? moreOptions : _explicitCbMaybe;

        var omen = process.env.NODE_ENV !== 'production' || process.env.DEBUG ? flaverr({}, new Error('omen'), sails.uploadOne) : undefined;
        //^In development and when debugging, we use an omen for better stack traces.

        return parley(
          function (done){

            var skipperOpts = _.extend({}, sails.config.uploads, moreOptions);

            if (skipperOpts.filename !== undefined) {
              return done(new Error('The `filename` option is not supported.  Please use `saveAs()` or `extname`.'));
            }

            // Verify `extname`, if specified.
            if (skipperOpts.extname !== undefined) {
              if (!_.isString(skipperOpts.extname) || !skipperOpts.extname) {
                return done(new Error('Invalid `extname`: If specified, must be a non-empty string.'));
              }//•
            }

            // Verify `dirname`, if specified.
            if (skipperOpts.dirname !== undefined) {
              if (!_.isString(skipperOpts.dirname) || !skipperOpts.dirname) {
                return done(new Error('Invalid `dirname`: If specified, must be a non-empty string.'));
              }//•
            }

            // Detect if "upstreamOrFileStream" is an upstream or just an incoming binary Readable.
            try {
              verifyUpstream(upstreamOrFileStream, omen);
            } catch (err) {
              switch (err.code) {
                case 'E_NOT_AN_UPSTREAM':

                  var isProbablyUsableReadableStream = _.isObject(upstreamOrFileStream) && upstreamOrFileStream.readable === true && _.isFunction(upstreamOrFileStream.pipe) && (upstreamOrFileStream._readableState ? upstreamOrFileStream._readableState.objectMode !== true : true);
                  if (!isProbablyUsableReadableStream) {
                    return done(new Error('Invalid stream: Must be either an upstream or a usable Node.js binary Readable stream (e.g. from `fs.createReadStream(…)` or `require(\'request\').get(…)`)'));
                  }//•

                  // If this is probably a usable readable stream, try to use it.
                  // But first attach the `fd` property. (Otherwise, the adapter will choke.)
                  // And to do that, we need to determine the unique file descriptor (`fd`).
                  // (This represents the location where file should be written in the remote fs.)
                  //
                  // > Here we mirror the normal behavior of saveAs from Skipper:
                  // > • https://github.com/balderdashy/skipper/tree/aee21055fcada07527ef3f5a18dd50c4b56ee696#options
                  // > • https://github.com/balderdashy/skipper/blob/7a24f0c88942cef56224204450fa7c6b2cc414c4/standalone/Upstream/build-renamer-stream.js#L24-L59
                  ((proceed)=>{
                    // Use the `saveAs` string verbatim
                    if (_.isString(skipperOpts.saveAs)) {
                      return proceed(undefined, skipperOpts.saveAs);
                    }
                    // Run the `saveAs` fn to determine the basename
                    else if (_.isFunction(skipperOpts.saveAs)) {
                      skipperOpts.saveAs(upstreamOrFileStream, function (err, fdFromUserland){
                        if (err) { return proceed(err); }

                        if (!_.isString(fdFromUserland)) {
                          return proceed(new Error('The `saveAs` function triggered its callback, but did not send back a valid string as the 2nd argument.  Instead, got: '+util.inspect(fdFromUserland, {depth:null})+''));
                        }

                        return proceed(undefined, fdFromUserland);
                      });//</saveAs>
                    }
                    // The default `saveAs` implements a unique fd by combining:
                    //  • a generated UUID  (like "4d5f444-38b4-4dc3-b9c3-74cb7fbbc932")
                    //  • the file's original extension (like ".jpg") if `extname` option was provided
                    //    (or otherwise falling back to ".upload")
                    else if (skipperOpts.saveAs === undefined) {
                      return proceed(undefined, sails.stdlib('strings').uuid().execSync()+(skipperOpts.extname?skipperOpts.extname:'.upload'));
                    }
                    else {
                      throw new Error('Invalid `saveAs`:  If specified, must be a string or a function.');
                    }
                  })(function (err, basename) {
                    if (err) { return done(err); }

                    if (_.isString(skipperOpts.dirname)) {
                      upstreamOrFileStream.fd = path.join(skipperOpts.dirname, basename);
                    }
                    else {
                      upstreamOrFileStream.fd = basename;
                    }

                    // Also set `filename`, for advisory purposes.
                    // (can affect logs in adapter)
                    upstreamOrFileStream.filename = upstreamOrFileStream.fd;

                    // Now use a little pocket function to load up the appropriate adapter.
                    var adapter = (()=>{
                      let _adapter = skipperOpts.adapter || defaultFilesystemAdapter;
                      if (_.isFunction(_adapter)) {
                        _adapter = _adapter(skipperOpts);
                      }
                      return _adapter;
                    })();

                    // Note that these listeners are handled with inline functions
                    // only because there is no other way to unbind _only_ them
                    // (i.e. otherwise we risk unbinding other important listeners
                    // that are in use by the receiver stream's internal implementation.)
                    //
                    // Still, to mitigate the complexity of this code, we use a self-calling
                    // function to wrap it all up.
                    ((proceed)=>{
                      var receiver = adapter.receive(skipperOpts);

                      var onReceiverError = (err)=>{
                        receiver.removeListener('error', onReceiverError);
                        receiver.removeListener('finish', onReceiverFinish);
                        return proceed(err);
                      };//ƒ
                      receiver.once('error', onReceiverError);

                      var onReceiverFinish = ()=>{
                        receiver.removeListener('error', onReceiverError);
                        receiver.removeListener('finish', onReceiverFinish);
                        return proceed();
                      };//ƒ
                      receiver.once('finish', onReceiverFinish);

                      receiver.write(upstreamOrFileStream);
                      receiver.end();

                    })((err)=>{
                      if (err) { return done(err); }
                      return done(undefined, {
                        fd: upstreamOrFileStream.fd,
                        type: ''
                        // (FUTURE: ^^Maybe attempt to sniff this `type` based on extname,
                        // if one was provided.  And/or look for the MIME in the actual stream
                        // ref-- there's only a few different common kinds of streams from
                        // Node core libraries and other popular npm packages like `request`)
                      });
                    });//_∏_  (†)

                  });//_∏_  (†)

                  return;//•

                default:
                  throw err;
              }//•
            }

            // Otherwise IWMIH, this is an upstream:
            upstreamOrFileStream.upload(skipperOpts, function(err, uploadedFiles) {
              if (err) { return done(err); }
              if (uploadedFiles.length > 1) {
                return done(flaverr({
                  message: 'Too many files!  .uploadOne() expected the upstream to contain exactly one file upload, but instead it contained '+uploadedFiles.length+'.'
                }, omen));
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE: Support automatically cleaning up after these files.
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              }//•
              return done(undefined, uploadedFiles[0]);
            });//_∏_

          },
          explicitCb||undefined,
          undefined,
          undefined,
          omen
        );
      };


      /**
       * .download()
       *
       * (just an alias to help avoid typos/confusion)
       *
       * @throws {Error}
       *
       * > https://trello.com/c/r86sweSs/159-sailsdownload
       */
      sails.download = function (){
        throw new Error(
          'Did you mean `sails.startDownload()`?\n'+
          '\n'+
          'Example usage:\n'+
          '\n'+
          '    var downloading = await sails.startDownload();\n'+
          '    return exits.success(downloading);\n'
        );
      };//ƒ



      /**
       * .startDownload()
       *
       * Create a download stream for a particular file descriptor.
       *
       * (A no-op error listener is automatically attached to prevent crashing the process,
       * but note that errors should be _actually handled_ in userland code via another 'error'
       * listener.  This method is primarily designed for more advanced use, such as moving
       * a file from one place to another.  Use the higher-level `.download()` method for
       * performing basic file downloads.)
       *
       * @param {String} fd
       * @param {Dictionary?} moreOptions
       * @param {Function?} _explicitCbMaybe
       *
       * @returns {Deferred}
       *          @returns {Stream} [readable stream]
       */
      sails.startDownload = function (fd, moreOptions, _explicitCbMaybe){

        var explicitCb = _.isFunction(moreOptions) ? moreOptions : _explicitCbMaybe;

        var omen = process.env.NODE_ENV !== 'production' || process.env.DEBUG ? flaverr({}, new Error('omen'), sails.startDownload) : undefined;
        //^In development and when debugging, we use an omen for better stack traces.

        return parley(
          function (done){

            var downloadOpts = _.extend({}, sails.config.uploads, moreOptions);

            // Use a little pocket function to load up the appropriate adapter.
            // (During uploads, we just rely on Skipper for this part. But here, for this
            // use case, we have to do it ourselves.)
            var adapter = (()=>{
              let _adapter = downloadOpts.adapter || defaultFilesystemAdapter;
              if (_.isFunction(_adapter)) {
                _adapter = _adapter(downloadOpts);
              }
              return _adapter;
            })();

            var stream = adapter.read(fd);

            // Bind a no-op handler for the `error` event to prevent it from crashing the process if it fires.
            // (userland code can still bind and use its own error events).
            stream.on('error', ()=>{ /* … */ });//æ
            // ^ Since event handlers are garbage collected when the event emitter is itself gc()'d, it is safe
            // for us to bind this event handler here without necessarily removing it.

            // Also bind a one-time error handler specifically to catch the first error that occurs,
            // IF one occurs before the first "readable" event fires.  (In other words, this allows us
            // to more gracefully handle errors that might occur before a file even BEGINS to download.)
            var onDownloadError = (err)=>{
              stream.removeListener('readable', onFirstReadable);
              return done(flaverr({
                message: 'Download failed.  '+err.message,
                raw: err
              }, omen));
            };//ƒ
            stream.once('error', onDownloadError);//æ

            var onFirstReadable =  ()=>{
              stream.removeListener('error', onDownloadError);
              return done(undefined, stream);
            };
            stream.once('readable', onFirstReadable);//æ

          },
          explicitCb||undefined,
          undefined,
          undefined,
          omen
        );

      };//ƒ



      /**
       * .rm()
       *
       * Remove an uploaded file.
       *
       * @param {String} fd
       * @param {Dictionary?} moreOptions
       * @param {Function?} _explicitCbMaybe
       *
       * @returns {Deferred}
       */
      sails.rm = function (fd, moreOptions, _explicitCbMaybe){
        var explicitCb = _.isFunction(moreOptions) ? moreOptions : _explicitCbMaybe;

        var omen = process.env.NODE_ENV !== 'production' || process.env.DEBUG ? flaverr({}, new Error('omen'), sails.rm) : undefined;
        //^In development and when debugging, we use an omen for better stack traces.

        return parley(
          function (done){
            var adapterOpts = _.extend({}, sails.config.uploads, moreOptions);

            // Use a little pocket function to load up the appropriate adapter.
            // (During uploads, we just rely on Skipper for this part. But here, for this
            // use case, we have to do it ourselves.)
            var adapter = (()=>{
              let _adapter = adapterOpts.adapter || defaultFilesystemAdapter;
              if (_.isFunction(_adapter)) {
                _adapter = _adapter(adapterOpts);
              }
              return _adapter;
            })();

            adapter.rm(fd, function (err){
              if (err) { return done(err); }
              return done();
            });//_∏_
          },
          explicitCb||undefined,
          undefined,
          undefined,
          omen
        );
      };


      /**
       * .ls()
       *
       * List all uploaded files.
       *
       * @param {Function?} _explicitCbMaybe
       *
       * @returns {Deferred}
       *          @returns {Array}
       */
      sails.ls = function (_explicitCbMaybe){
        var explicitCb = _.isFunction(_explicitCbMaybe) ? _explicitCbMaybe : undefined;

        var omen = process.env.NODE_ENV !== 'production' || process.env.DEBUG ? flaverr({}, new Error('omen'), sails.ls) : undefined;
        //^In development and when debugging, we use an omen for better stack traces.

        return parley(
          function (done){
            var adapterOpts = _.extend({}, sails.config.uploads);

            // Use a little pocket function to load up the appropriate adapter.
            // (During uploads, we just rely on Skipper for this part. But here, for this
            // use case, we have to do it ourselves.)
            var adapter = (()=>{
              let _adapter = adapterOpts.adapter || defaultFilesystemAdapter;
              if (_.isFunction(_adapter)) {
                _adapter = _adapter(adapterOpts);
              }
              return _adapter;
            })();

            // Determine appropriate dirpath to search
            var dirpath = path.resolve(
              process.cwd(),
              sails.config.appPath,
              adapterOpts.dirpath||'./'
            );

            adapter.ls(dirpath, function (err, previouslyUploadedFiles){
              if (err) { return done(err); }
              return done(undefined, previouslyUploadedFiles);
            });//_∏_
          },
          explicitCb||undefined,
          undefined,
          undefined,
          omen
        );
      };


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: `await sails.mv(fd, destWritable, moreOptions)`
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: `await sails.cp(fd, destWritable, moreOptions)`
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


      return done();

    }

  };

};
