module.exports = {


  friendlyName: 'Update one thing',


  description:
  `Update a thing, either adding information about a borrower and expected return time,
  or clearing out that information if the item has been returned.`,


  inputs: {

    id: {
      description: 'The id of the thing to update.',
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


  fn: async function ({id, borrowedBy, expectedReturnAt}) {

    var thingToUpdate = await Thing.findOne({ id });
    // Ensure the thing still exists.
    if(!thingToUpdate) {
      throw 'notFound';
    }
    // Verify permissions.
    if(thingToUpdate.owner !== this.req.me.id) {
      throw 'forbidden';
    }

    // Update the `thing` record.
    await Thing.update({ id })
    .set({
      borrowedBy: borrowedBy,
      expectedReturnAt: expectedReturnAt
    });

  }


};
