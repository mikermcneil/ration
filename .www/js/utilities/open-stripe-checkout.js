'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * openStripeCheckout()
 *
 * Open the Stripe Checkout modal dialog and resolve when it is closed.
 *
 * -----------------------------------------------------------------
 * @param {String} stripePublishableKey
 * @param {String} billingEmailAddress
 * -----------------------------------------------------------------
 * @returns {Dictionary?}  (or undefined if the form was cancelled)
 *          e.g.
 *          {
 *            stripeToken: '…',
 *            billingCardLast4: '…',
 *            billingCardBrand: '…',
 *            billingCardExpMonth: '…',
 *            billingCardExpYear: '…'
 *          }
 */

parasails.registerUtility('openStripeCheckout', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(stripePublishableKey, billingEmailAddress) {
    var CACHE_KEY, checkoutHandler, hasTriggeredTokenCallback;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            // Cache (& use cached) "checkout handler" globally on the page so that we
            // don't end up configuring it more than once (i.e. so Stripe.js doesn't
            // complain).
            CACHE_KEY = '_cachedStripeCheckoutHandler';

            if (!window[CACHE_KEY]) {
              window[CACHE_KEY] = StripeCheckout.configure({
                key: stripePublishableKey
              });
            }
            checkoutHandler = window[CACHE_KEY];

            // Track whether the "token" callback was triggered.
            // (If it has NOT at the time the "closed" callback is triggered, then we
            // know the checkout form was cancelled.)

            return _context.abrupt('return', new Promise(function (resolve, reject) {
              try {
                // Open Stripe checkout.
                // (https://stripe.com/docs/checkout#integration-custom)
                checkoutHandler.open({
                  name: 'Ration',
                  description: 'Link your credit card.',
                  panelLabel: 'Save card',
                  email: billingEmailAddress,
                  locale: 'auto',
                  zipCode: false,
                  allowRememberMe: false,
                  closed: function closed() {
                    // If the Checkout dialog was cancelled, resolve undefined.
                    if (!hasTriggeredTokenCallback) {
                      resolve();
                    }
                  },
                  token: function token(stripeData) {

                    // After payment info has been successfully added, and a token
                    // was obtained...
                    hasTriggeredTokenCallback = true;

                    // Normalize token and billing card info from Stripe and resolve
                    // with that.
                    var stripeToken = stripeData.id;
                    var billingCardLast4 = stripeData.card.last4;
                    var billingCardBrand = stripeData.card.brand;
                    var billingCardExpMonth = String(stripeData.card.exp_month);
                    var billingCardExpYear = String(stripeData.card.exp_year);

                    resolve({
                      stripeToken: stripeToken,
                      billingCardLast4: billingCardLast4,
                      billingCardBrand: billingCardBrand,
                      billingCardExpMonth: billingCardExpMonth,
                      billingCardExpYear: billingCardExpYear
                    });
                  } //Œ
                }); //_∏_
              } catch (err) {
                reject(err);
              }
            }));

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function openStripeCheckout(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return openStripeCheckout;
}() //_∏_

);
