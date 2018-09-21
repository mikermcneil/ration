module.exports = {


  friendlyName: 'Get available things',


  description: '',


  inputs: {

  },


  exits: {
    success: {
      outputDescription: 'An array of things available to the logged in user.',
      outputType: [{}]
    }
  },


  fn: async function () {

    var url = require('url');

    // Get the list of things this user can see.
    var things = await Thing.find({
      or: [
        // Friend things:
        { owner: { 'in': _.pluck(this.req.me.friends, 'id') } },
        // My things:
        { owner: this.req.me.id }
      ]
    })
    .populate('owner')
    .populate('borrowedBy');

    _.each(things, (thing)=> {
      thing.imageSrc = url.resolve(sails.config.custom.baseUrl, '/api/v1/things/'+thing.id+'/photo');
      delete thing.imageUploadFd;
      delete thing.imageUploadMime;
      delete thing.owner.password;
    });

    // Respond with view.
    return things;

  }


};
