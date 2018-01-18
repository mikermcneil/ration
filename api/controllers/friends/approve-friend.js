module.exports = {


  friendlyName: 'Approve friend',


  description: 'Approve the pending friend request from the user with the specified ID.',


  inputs: {

    id: {
      description: 'The ID of the user to approve as a friend.',
      type: 'number',
      example: 8381,
      required: true
    }

  },


  exits: {

    notFound: {
      description: 'There is no pending friend request from a user with that ID.',
      responseType: 'notFound'
    },

  },


  fn: async function (inputs, exits) {

    var otherUser = await User.findOne({
      id: inputs.id
    })
    .populate('outboundFriendRequests', { id: this.req.me.id });

    if (!otherUser || otherUser.outboundFriendRequests.length === 0) {
      throw 'notFound';
    }

    // Add the logged-in user to this person's friends, and add this person
    // to the logged-in user's friends.
    await User.addToCollection(inputs.id, 'friends')
    .members([this.req.me.id]);
    await User.addToCollection(this.req.me.id, 'friends')
    .members([inputs.id]);

    // Now remove from this person's outbound requests (which also automatically
    // removes from the logged-in user's inbound requests.)
    await User.removeFromCollection(inputs.id, 'outboundFriendRequests')
    .members([this.req.me.id]);

    return exits.success();

  }


};
