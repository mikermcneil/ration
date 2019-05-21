'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('account-overview', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    me: {/* ... */},

    isBillingEnabled: false,

    hasBillingCard: false,

    // Syncing/loading states for this page.
    syncingUpdateCard: false,
    syncingRemoveCard: false,

    // Form data
    formData: {/* … */},

    // Server error state for the form
    cloudError: '',

    // For the Stripe checkout window
    checkoutHandler: undefined,

    // For the confirmation modal:
    removeCardModalVisible: false
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    _.extend(this, window.SAILS_LOCALS);

    this.isBillingEnabled = !!this.stripePublishableKey;

    // Determine whether there is billing info for this user.
    this.hasBillingCard = this.me.billingCardBrand && this.me.billingCardLast4 && this.me.billingCardExpMonth && this.me.billingCardExpYear;
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    clickStripeCheckoutButton: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var openStripeCheckout, billingCardInfo;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:

                // Import utilities.
                openStripeCheckout = parasails.require('openStripeCheckout');

                // Prevent double-posting if it's still loading.

                if (!this.syncingUpdateCard) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return');

              case 3:

                // Clear out error states.
                this.cloudError = false;

                // Open Stripe Checkout.
                _context.next = 6;
                return openStripeCheckout(this.stripePublishableKey, this.me.emailAddress);

              case 6:
                billingCardInfo = _context.sent;

                if (billingCardInfo) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt('return');

              case 9:

                // Now that payment info has been successfully added, update the billing
                // info for this user in our backend.
                this.syncingUpdateCard = true;
                _context.next = 12;
                return Cloud.updateBillingCard.with(billingCardInfo).tolerate(function () {
                  _this.cloudError = true;
                });

              case 12:
                this.syncingUpdateCard = false;

                // Upon success, update billing info in the UI.
                if (!this.cloudError) {
                  Object.assign(this.me, _.pick(billingCardInfo, ['billingCardLast4', 'billingCardBrand', 'billingCardExpMonth', 'billingCardExpYear']));
                  this.hasBillingCard = true;
                }

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function clickStripeCheckoutButton() {
        return _ref.apply(this, arguments);
      }

      return clickStripeCheckoutButton;
    }(),

    clickRemoveCardButton: function clickRemoveCardButton() {
      this.removeCardModalVisible = true;
    },

    closeRemoveCardModal: function closeRemoveCardModal() {
      this.removeCardModalVisible = false;
      this.cloudError = false;
    },

    submittedRemoveCardForm: function submittedRemoveCardForm() {

      // Update billing info on success.
      this.me.billingCardLast4 = undefined;
      this.me.billingCardBrand = undefined;
      this.me.billingCardExpMonth = undefined;
      this.me.billingCardExpYear = undefined;
      this.hasBillingCard = false;

      // Close the modal and clear it out.
      this.closeRemoveCardModal();
    },

    handleParsingRemoveCardForm: function handleParsingRemoveCardForm() {
      return {
        // Set to empty string to indicate the default payment source
        // for this customer is being completely removed.
        stripeToken: ''
      };
    }

  }
});
