module.exports = {


  friendlyName: 'Download photo',


  description: 'Download a photo of a borrowable thing.',


  inputs: {
    id: {
      description: 'The id of the item whose photo we\'re downloading.',
      type: 'number',
      required: true
    }
  },


  exits: {
    success: {
      outputDescription: 'The streaming bytes of the specified thing\'s photo.',
      outputType: 'ref'
    },
    forbidden: { responseType: 'forbidden' },
    notFound: { responseType: 'notFound' }
  },


  fn: async function (inputs, exits) {

    var thing = await Thing.findOne({id: inputs.id});
    if (!thing) { throw 'notFound'; }

    // Check permissions.
    // (So people can't see images of stuff that isn't from their friends or themselves.)
    var itemBelongsToFriend = _.any(this.req.me.friends, {id: thing.owner});
    if (this.req.me.id !== thing.owner && !itemBelongsToFriend) {
      throw 'forbidden';
    }

    this.res.type(thing.imageUploadMime);


    var downloading = await sails.startDownload(thing.imageUploadFd);

    return exits.success(downloading);

  }


};
