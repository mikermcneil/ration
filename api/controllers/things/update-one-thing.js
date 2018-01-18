module.exports = {


  friendlyName: 'Update one thing',


  description: '',


  inputs: {

    id: {
      description: 'The id of the member to update.',
      type: 'number',
      required: true
    },

    borrowedBy: {
      description: 'The ID of the user borrowing this item, or `null` if no one is borrowing this item.',
      type: 'number',
      allowNull: true
    },

    expectedReturnAt: {
      description: 'A JS timestamp (epoch ms) representing the expected return time of this item.',
      example: 1502844074211,
      type: 'number'
    },
  },


  exits: {

    notFound: {
      responseType: 'notFound'
    },

    forbidden: {
      responseType: 'forbidden'
    },

  },


  fn: async function (inputs, exits) {

    var thingToUpdate = await Thing.findOne({ id: inputs.id });
    // Ensure the thing still exists.
    if(!thingToUpdate) {
      throw 'notFound';
    }
    // Verify permissions.
    if(thingToUpdate.owner !== this.req.me.id) {
      throw 'forbidden';
    }

    // Update the `thing` record.
    await Thing.update({ id: inputs.id })
    .set({
      borrowedBy: inputs.borrowedBy,
      expectedReturnAt: inputs.expectedReturnAt
    });

    return exits.success();

  }


};
