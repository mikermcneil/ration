'use strict';

/**
 * <modal>
 * -----------------------------------------------------------------------------
 * A modal dialog pop-up.
 *
 * @type {Component}
 *
 * @event close   [emitted when the closing process begins]
 * @event opened  [emitted when the opening process is completely done]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('modal', {

  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: ['large'],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {
      // Spinlock used for preventing trying to close the bootstrap modal more than once.
      // (in practice it doesn't seem to hurt anything if it tries to close more than once,
      // but still.... better safe than sorry!)
      _bsModalIsAnimatingOut: false
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: '\n  <transition name="modal" v-on:leave="leave" v-bind:css="false">\n    <div class="modal fade clog-modal" tabindex="-1" role="dialog">\n      <div class="petticoat"></div>\n      <div class="modal-dialog custom-width" :class="large ? \'modal-lg\' : \'\'" role="document">\n        <div class="modal-content">\n          <slot></slot>\n        </div><!-- /.modal-content -->\n      </div><!-- /.modal-dialog -->\n    </div><!-- /.modal -->\n  </transition>\n  ',

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  mounted: function mounted() {
    var _this = this;

    // Immediately call out to the Bootstrap modal and tell it to show itself.
    $(this.$el).modal({
      // Set the modal backdrop to the 'static' option, which means it doesn't close the modal
      // when clicked.
      backdrop: 'static',
      show: true
    });

    // Attach listener for underlying custom modal closing event,
    // and when that happens, have Vue emit a custom "close" event.
    // (Note: This isn't just for convenience-- it's crucial that
    // the parent logic can use this event to update its scope.)
    $(this.$el).on('hide.bs.modal', function () {
      _this._bsModalIsAnimatingOut = true;
      _this.$emit('close');
    }); //ƒ

    // Attach listener for underlying custom modal "opened" event,
    // and when that happens, have Vue emit our own custom "opened" event.
    // This is so we know when the entry animation has completed, allows
    // us to do cool things like auto-focus the first input in a form modal.
    $(this.$el).on('shown.bs.modal', function () {
      _this.$emit('opened');
      $(_this.$el).off('shown.bs.modal');
    }); //ƒ
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    leave: function leave(el, done) {
      var _this2 = this;

      // If this shutting down was spawned by the bootstrap modal's built-in logic,
      // then we'll have already begun animating the modal shut.  So we check our
      // spinlock to make sure.  If it turns out that we HAVEN'T started that process
      // yet, then we go ahead and start it now.
      if (!this._bsModalIsAnimatingOut) {
        $(this.$el).modal('hide');
      } //ﬁ

      // When the bootstrap modal finishes animating into nothingness, unbind all
      // the DOM events used by bootstrap, and then call `done()`, which passes
      // control back to Vue and lets it finish the job (i.e. afterLeave).
      //
      // > Note that the other lifecycle events like `destroyed` were actually
      // > already fired at this point.
      // >
      // > Also note that, since we're potentially long past the `destroyed` point
      // > of the lifecycle here, we can't call `.$emit()` anymore either.  So,
      // > for example, we wouldn't be able to emit a "fullyClosed" event --
      // > because by the time it'd be appropriate to emit the Vue event, our
      // > context for triggering it (i.e. the relevant instance of this component)
      // > will no longer be capable of emitting custom Vue events (because by then,
      // > it is no longer "reactive").
      // >
      // > For more info, see:
      // > https://github.com/vuejs/vue-router/issues/1302#issuecomment-291207073
      $(this.$el).on('hidden.bs.modal', function () {
        $(_this2.$el).off('hide.bs.modal');
        $(_this2.$el).off('hidden.bs.modal');
        $(_this2.$el).off('shown.bs.modal');
        done();
      }); //_∏_
    }

  }

});
