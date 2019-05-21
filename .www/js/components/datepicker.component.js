'use strict';

/**
 * <datepicker>
 * -----------------------------------------------------------------------------
 * A wrapper for the jQuery UI datepicker
 *
 * @type {Component}
 *
 * @event input   [emitted when the value changes]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('datepicker', {

  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
  // The v-model
  'value',
  // Flag telling us whether the datepicker should be a popup (if truthy)
  // or always visible (if falsy)
  'popup',
  // The following are only relevant if using the popup style of datepicker:
  'invalid', 'validationErrorMessage', 'placeholderText'],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {
      //...
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: '\n  <div class="datepicker-wrapper">\n    <div datepicker-el v-if="!popup"></div>\n    <input class="form-control" v-else :value="value" type="text" :class="[invalid ? \'is-invalid\' : \'\']"  :placeholder="placeholderText || \'Choose return date\'" datepicker-el/>\n    <div class="invalid-feedback" v-if="invalid">{{validationErrorMessage}}</div>\n  </div>\n  ',

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  mounted: function mounted() {
    var _this = this;

    this.$find('[datepicker-el]').datepicker({
      onSelect: function onSelect(dateText, datepicker) {
        //eslint-disable-line no-unused-vars
        _this.$emit('input', dateText);
      }
    });
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    doParseDate: function doParseDate() {
      return $.datepicker.parseDate('mm/dd/yy', this.value);
    }

  }

});
