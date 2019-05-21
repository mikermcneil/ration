'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * <ajax-form>
 * -----------------------------------------------------------------------------
 * A form that talks to the backend using AJAX.
 *
 * @type {Component}
 *
 * @event submitted          [emitted after the server responds with a 2xx status code]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('ajaxForm', {

  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Note:
  // Some of these props rely on the `.sync` modifier re-introduced in Vue 2.3.x.
  // For more info, see: https://vuejs.org/v2/guide/components.html#sync-Modifier
  //
  // Specifically, these special props are:
  // • syncing
  // • cloudError
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  props: ['syncing', // « 2-way bound (.sync)
  'action', 'handleParsing', 'cloudError' // « 2-way bound (.sync)
  ],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {};
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: '\n  <form class="ajax-form" @submit.prevent="submit()">\n    <slot name="default"></slot>\n  </form>\n  ',

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {},

  mounted: function mounted() {},

  beforeDestroy: function beforeDestroy() {},

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    submit: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var argins, didResponseIndicateFailure, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(!this.action || !_.isString(this.action) || !_.isFunction(Cloud[_.camelCase(this.action)]))) {
                  _context.next = 4;
                  break;
                }

                throw new Error('Missing or invalid `action` in <ajax-form>.  `action` should be the name of a method on the `Cloud` global.  For example: `action="login"` would make this form communicate using `Cloud.login()`, which corresponds to the "login" action on the server.');

              case 4:
                if (_.isFunction(Cloud[this.action])) {
                  _context.next = 6;
                  break;
                }

                throw new Error('Unrecognized `action` in <ajax-form>.  Did you mean to type `action="' + _.camelCase(this.action) + '"`?  (<ajax-form> expects `action` to be provided in camlCase format.  In other words, to reference the action at "api/controllers/foo/bar/do-something", use `action="doSomething"`.)');

              case 6:
                if (_.isFunction(this.handleParsing)) {
                  _context.next = 8;
                  break;
                }

                throw new Error('Missing or invalid `handle-parsing` in <ajax-form>.  For example: `:handle-parsing="handleParsingSomeForm"`.  This function should return a dictionary (plain JavaScript object like `{}`) of parsed form data, ready to be sent in a request to the server.');

              case 8:
                if (!this.syncing) {
                  _context.next = 10;
                  break;
                }

                return _context.abrupt('return');

              case 10:

                // Clear the userland "cloudError" prop.
                this.$emit('update:cloudError', '');

                // Run the provided "handle-parsing" logic.
                // > This should clear out any pre-existing error messages, perform any additional
                // > client-side form validation checks, and do any necessary data transformations
                // > to munge the form data into the format expected by the server.
                argins = this.handleParsing();

                // If argins came back undefined, then avast.
                // (This means that parsing the form failed.)

                if (!(argins === undefined)) {
                  _context.next = 16;
                  break;
                }

                return _context.abrupt('return');

              case 16:
                if (!(!_.isObject(argins) || _.isArray(argins) || _.isFunction(argins))) {
                  _context.next = 18;
                  break;
                }

                throw new Error('Invalid data returned from custom form parsing logic.  (Should return a dictionary of argins, like `{}`.)');

              case 18:

                // Set syncing state to `true` on userland "syncing" prop.
                this.$emit('update:syncing', true);

                _context.next = 21;
                return Cloud[this.action].with(argins).tolerate(function (err) {
                  // When a cloud error occurs, tolerate it, but set the userland "cloudError" prop accordingly.
                  _this.$emit('update:cloudError', err.exit || 'error');
                  didResponseIndicateFailure = true;
                });

              case 21:
                result = _context.sent;


                // Set syncing state to `false` on userland "syncing" prop.
                this.$emit('update:syncing', false);

                // If the server says we were successful, then emit the "submitted" event.
                if (!didResponseIndicateFailure) {
                  this.$emit('submitted', result);
                }

              case 24:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function submit() {
        return _ref.apply(this, arguments);
      }

      return submit;
    }()

  }

});
