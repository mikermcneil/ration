/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');


/**
 * verifyUpstream()
 *
 * @param  {Ref} supposedUpstream
 * @param  {Error?} omen
 * @throws {UsageError} [if not a valid upstream]
 *         @code E_NOT_AN_UPSTREAM
 */
module.exports = function verifyUpstream(supposedUpstream, omen) {

  if (!_.isObject(supposedUpstream) || !_.isObject(supposedUpstream.constructor) || supposedUpstream.constructor.name !== 'Upstream') {
    throw flaverr({
      name: 'UsageError',
      code: 'E_NOT_AN_UPSTREAM',
      message: 'Invalid stream: Must be an upstream.  (For help: https://sailsjs.com/support)'
    }, omen);
  }//•

};
