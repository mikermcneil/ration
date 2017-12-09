module.exports = {


  friendlyName: 'View things',


  description: 'Display "Things" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/things/things'
    }

  },


  fn: async function (inputs, exits) {

    var url = require('url');

    // Get the list of things this user can see.
    var friendThings = await Thing.find({
      owner: { 'in': _.pluck(this.req.me.friends, 'id')}
    })
    .populate('owner')
    .populate('borrowedBy');

    var things = await Thing.find({ owner: this.req.me.id })
    .populate('owner')
    .populate('borrowedBy');

    things = things.concat(friendThings);

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
