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
  props: [
    'syncing',// « 2-way bound (.sync)
    'action',
    'handleParsing',
    'cloudError'// « 2-way bound (.sync)
  ],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: `
  <form class="ajax-form" @submit.prevent="submit()">
    <slot name="default"></slot>
  </form>
  `,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {

  },

  mounted: function (){

  },

  beforeDestroy: function() {

  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    submit: async function () {
      if (!this.action || !_.isString(this.action) || !_.isFunction(Cloud[_.camelCase(this.action)])) {
        throw new Error('Missing or invalid `action` in <ajax-form>.  `action` should be the name of a method on the `Cloud` global.  For example: `action="login"` would make this form communicate using `Cloud.login()`, which corresponds to the "login" action on the server.');
      }
      else if (!_.isFunction(Cloud[this.action])) {
        throw new Error('Unrecognized `action` in <ajax-form>.  Did you mean to type `action="'+_.camelCase(this.action)+'"`?  (<ajax-form> expects `action` to be provided in camlCase format.  In other words, to reference the action at "api/controllers/foo/bar/do-something", use `action="doSomething"`.)');
      }

      if (!_.isFunction(this.handleParsing)) {
        throw new Error('Missing or invalid `handle-parsing` in <ajax-form>.  For example: `:handle-parsing="handleParsingSomeForm"`.  This function should return a dictionary (plain JavaScript object like `{}`) of parsed form data, ready to be sent in a request to the server.');
      }

      // Prevent double-posting.
      if (this.syncing) {
        return;
      }

      // Clear the userland "cloudError" prop.
      this.$emit('update:cloudError', '');

      // Run the provided "handle-parsing" logic.
      // > This should clear out any pre-existing error messages, perform any additional
      // > client-side form validation checks, and do any necessary data transformations
      // > to munge the form data into the format expected by the server.
      var argins = this.handleParsing();

      // If argins came back undefined, then avast.
      // (This means that parsing the form failed.)
      if (argins === undefined) {
        return;
      } else if (!_.isObject(argins) || _.isArray(argins) || _.isFunction(argins)) {
        throw new Error('Invalid data returned from custom form parsing logic.  (Should return a dictionary of argins, like `{}`.)');
      }

      // Set syncing state to `true` on userland "syncing" prop.
      this.$emit('update:syncing', true);

      var didResponseIndicateFailure;
      var result = await Cloud[this.action].with(argins)
      .tolerate((err)=>{
        // When a cloud error occurs, tolerate it, but set the userland "cloudError" prop accordingly.
        this.$emit('update:cloudError', err.exit || 'error');
        didResponseIndicateFailure = true;
      });

      // Set syncing state to `false` on userland "syncing" prop.
      this.$emit('update:syncing', false);

      // If the server says we were successful, then emit the "submitted" event.
      if (!didResponseIndicateFailure) {
        this.$emit('submitted', result);
      }

    },

  }

});
