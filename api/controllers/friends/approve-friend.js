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

    // Add the logged-in user to this person's friends, and remove from their outbound requests.
    await User.addToCollection(inputs.id, 'friends')
    .members([this.req.me.id]);
    await User.removeFromCollection(inputs.id, 'outboundFriendRequests')
    .members([this.req.me.id]);

    // Add this user to the logged-in user's friends.
    await User.addToCollection(this.req.me.id, 'friends')
    .members([inputs.id]);

    return exits.success();

  }


};
