module.exports = {


  friendlyName: 'View available things',


  description: 'Display "Things" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/things/available-things'
    }

  },


  fn: async function (inputs, exits) {

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
    });

    // Respond with view.
    return exits.success({
      currentSection: 'things',
      things: things,
    });

  }


};
