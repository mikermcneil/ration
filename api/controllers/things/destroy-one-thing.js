module.exports = {


  friendlyName: 'Destroy one thing',


  description: '',


  inputs: {

    id: {
      description: 'The id of the thing to destroy',
      type: 'number',
      required: true
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

    var thingToDestroy = await Thing.findOne({ id: inputs.id });
    // Ensure the thing still exists.
    if(!thingToDestroy) {
      throw 'notFound';
    }
    // Verify permissions.
    if(thingToDestroy.owner !== this.req.me.id) {
      throw 'forbidden';
    }

    // Destroy the record.
    await Thing.destroy({ id: inputs.id });

    return exits.success();

  }

};
