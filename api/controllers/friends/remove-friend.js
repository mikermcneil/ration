module.exports = {


  friendlyName: 'Remove friend',


  description: 'Remove a user from the logged-in user\'s friends list, and vice-versa.',


  inputs: {

    id: {
      description: 'The id of the friend to remove',
      type: 'number',
      required: true
    },

  },


  exits: {

    notFound: {
      responseType: 'notFound'
    },

  },


  fn: async function ({id}) {

    var friendToRemove = await User.findOne({ id })
    .populate('friends');

    // Ensure the friend is in our `friends`.
    if(!_.find(this.req.me.friends, {id: id})) {
      throw 'notFound';
    }
    // Remove the friend from the logged-in user's friends.
    await User.removeFromCollection(this.req.me.id, 'friends')
    .members([ id ]);


    // Ensure the logged-in user is in this person's `friends`
    if(!_.find(friendToRemove.friends, {id: this.req.me.id})) {
      throw 'notFound';
    }
    // Remove the logged-in user from the other user's friends.
    await User.removeFromCollection(id, 'friends')
    .members([ this.req.me.id ]);

  }


};
