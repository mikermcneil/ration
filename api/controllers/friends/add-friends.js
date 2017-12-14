module.exports = {


  friendlyName: 'Add friends',


  description: 'Add one or more friends.',


  inputs: {
    friends: {
      description: 'An array of users to add as friends.',
      example: [{
        fullName: 'Rory Milliard',
        email: 'rory@example.com'
      }],
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    return exits.success();

  }


};
