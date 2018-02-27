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
    'invalid',
    'validationErrorMessage',
    'placeholderText'
  ],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      //...
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: `
  <div class="datepicker-wrapper">
    <div v-else datepicker-el v-if="!popup"></div>
    <input class="form-control" v-else :value="value" type="text" :class="[invalid ? 'is-invalid' : '']"  :placeholder="placeholderText || 'Choose return date'" datepicker-el/>
    <div class="invalid-feedback" v-if="invalid">{{validationErrorMessage}}</div>
  </div>
  `,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  mounted: function (){

    this.$find('[datepicker-el]').datepicker({
      onSelect: (dateText, datepicker)=> {//eslint-disable-line no-unused-vars
        this.$emit('input', dateText);
      }
    });

  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    doParseDate: function() {
      return $.datepicker.parseDate('mm/dd/yy', this.value);
    }

  }

});
