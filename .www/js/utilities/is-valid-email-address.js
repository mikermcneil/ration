'use strict';

/**
 * isValidEmailAddress()
 *
 * Determine whether a string is a valid email address.
 *
 * This checks that:
 *
 * • The string starts with an alphanumeric
 * • The string contains an @ symbol
 * • The character preceding the @ symbol is an alphanumeric
 * • Has a string of alphanumeric characters following the @ symbol
 * • Has a '.' after those alphanumeric characters
 * • Has alphanumeric characters after the '.'
 *   (More '.' characters are allowed, e.g. for '.co.uk', but must start and end with alphanumerics.)
 *
 * -----------------------------------------------------------------
 * @param {Ref} supposedEmailAddress
 * -----------------------------------------------------------------
 * @returns {Boolean}
 *
 */

parasails.registerUtility('isValidEmailAddress', function isValidEmailAddress(supposedEmailAddress) {

  if (!_.isString(supposedEmailAddress)) {
    return false;
  }

  // Lowercase the string.
  supposedEmailAddress = supposedEmailAddress.toLowerCase();

  // Create a couple handy regular expressions for use below.
  // To validate whether a string starts with an alphanumeric character:
  var doesntStartWithAlphanumericRX = new RegExp(/^[^a-z0-9]/);
  // To validate whether a string ends with an alphanumeric character:
  var doesntEndWithAlphanumericRX = new RegExp(/[^a-z0-9]$/);

  // If the provided string doesn't start and end with an alphanumeric,
  // it has room for improvement as far as being an email address goes.
  if (supposedEmailAddress.match(doesntStartWithAlphanumericRX) || supposedEmailAddress.match(doesntEndWithAlphanumericRX)) {
    return false;
  }

  // Otherwise, the beginning and end are valid.


  // An email must contain an '@' symbol, so grab the chunks of the string on either side of that.
  var chunksOnEitherSideOfAtSymbol = supposedEmailAddress.split('@');

  // If there are not EXACTLY two chunks, that means the string has either no '@' symbols, or more than one.
  // In either case, the string fails validation because only one '@' is allowed.
  if (chunksOnEitherSideOfAtSymbol.length !== 2) {
    return false;
  }

  // Otherwise, it passes the '@' check.


  // Now, let's validate the first chunk (aka the part before the '@').
  // If it doesn't start and end with an alphanumeric, this isn't a valid email.
  if (chunksOnEitherSideOfAtSymbol[0].match(doesntStartWithAlphanumericRX) || chunksOnEitherSideOfAtSymbol[0].match(doesntEndWithAlphanumericRX)) {
    return false;
  }
  // Otherwise, make sure it doesn't contain any naughty special characters
  // (i.e. anything that isn't '.', '-', '_', or '+').
  var notAllowedInFirstPartOfEmailRX = new RegExp(/[^a-z0-9\.\-\_\+]/);
  if (chunksOnEitherSideOfAtSymbol[0].match(notAllowedInFirstPartOfEmailRX)) {
    return false;
  }

  // Otherwise, the first chunk is 100% valid.

  // Now, we'll validate the chunk after the '@'.
  // If it doesn't start and end with an alphanumeric, this isn't a valid email.
  if (chunksOnEitherSideOfAtSymbol[1].match(doesntStartWithAlphanumericRX) || chunksOnEitherSideOfAtSymbol[1].match(doesntEndWithAlphanumericRX)) {
    return false;
  }
  // Otherwise, validate that the chunk has an appropriate number of '.' characters.
  var chunksOnEitherSideOfPeriods = chunksOnEitherSideOfAtSymbol[1].split('.');
  // If there is one chunk, the '.' is missing, so the string isn't a valid email.
  if (chunksOnEitherSideOfPeriods.length === 1) {
    return false;
  }
  // We'll let there be more than one chunk, because of tlds with multiple dots like '.co.uk',
  // but if there are more than 3 dots (aka if there are 4+ chunks), we'll say this isn't legit.
  if (chunksOnEitherSideOfPeriods.length >= 4) {
    return false;
  }

  // Otherwise, we have a reasonable number of dots, so we'll evaluate the strings in between them.
  _.each(chunksOnEitherSideOfPeriods, function (chunk) {
    // Validate that the characters at the beginning and end of this individual chunk are alphanumeric.
    if (chunk.match(doesntStartWithAlphanumericRX) || chunk.match(doesntEndWithAlphanumericRX)) {
      return false;
    }
    // Validate that the chunk does not contain any naughty characters.
    var notAllowedInChunksThatNeighborDotsRX = new RegExp(/[^a-z0-9\-]/);
    if (chunk.match(notAllowedInChunksThatNeighborDotsRX)) {
      return false;
    }
  });

  // Otherwise we've made it past all the checks. Overall, this string can really battle with the best of them.
  // Its best quality is its emaily-ness. Its stats are the best I've ever seen! No doubt about it!
  return true;
});
