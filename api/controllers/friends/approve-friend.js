module.exports = {


  friendlyName: 'Approve friend',


  description: '',


  inputs: {

    id: {
      description: 'The ID of the user to approve as a friend.',
      type: 'number',
      example: 123
    }

  },


  exits: {

  },


  fn: async function (inputs, exits) {

    return exits.success();

  }


};
