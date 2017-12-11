module.exports = {


  friendlyName: 'Schedule return',


  description: '',


  inputs: {

    id: {
      description: 'The id of the thing being borrowed',
      type: 'number',
      required: true
    },

    dropoffInfo: {
      type: 'string',
      description: 'The dropoff time information to use in the message sent to the owner.',
      example: 'Tomorrow or thursday',
      required: true
    }
  },


  exits: {
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' }
  },


  fn: async function (inputs, exits) {

    var borrowing = await Thing.findOne({ id: inputs.id }).populate('owner');
    if(!borrowing) {
      throw 'notFound';
    }

    // If we're not borrowing this item, we can't return it.
    if(borrowedBy !== this.req.me.id) {
      throw 'forbidden';
    }

    // Format our text for the notification email.
    var itemLabel = borrowing.label || 'item';
    var formatteddropoffInfoText = inputs.dropoffInfo.charAt(0).toLowerCase() + inputs.dropoffInfo.slice(1);
    formattedDropoffInfoText = formattedDropoffInfoText.replace(/\.$/, '');

    // Send the owner a notification email.
    await sails.helpers.sendTemplateEmail({
      to: borrowing.owner.emailAddress,
      subject: this.req.me.fullName+' wants to return your '+itemLabel,
      template: 'email-schedule-return',
      templateData: {
        borrowerName: this.req.me.fullName,
        borrowerEmail: this.req.me.emailAddress,
        itemLabel: itemLabel,
        fullName: borrowing.owner.fullName,
        dropoffInfo: formattedDropoffInfoText
      }
    });

    return exits.success();

  }

};
