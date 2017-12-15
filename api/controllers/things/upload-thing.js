module.exports = {


  friendlyName: 'Upload thing',


  description: 'Upload info about an item that will be visible for friends to borrow.',


  files: ['photo'],


  inputs: {

    photo: {
      description: 'Upstream for an incoming file upload.',
      type: 'ref'
    },

    label: {
      type: 'string',
      description: 'A (very) brief description of the item.'
    },

  },


  exits: {

    success: {
      outputDescription: 'The newly created `Thing`.',
      outputExample: {}
    },

    badRequest: {
      description: 'No photo upload was attached'
    },

  },


  fn: async function (inputs, exits) {

    var url = require('url');

    // Upload the image.
    var info = await sails.uploadOne(inputs.photo)
    .intercept((err)=>{
      sails.log.error('Upload failed:',err);
      return 'badRequest';
    });

    // Create a new "thing" record.
    var newThing = await Thing.create({
      imageUploadFd: info.fd,
      imageUploadMime: info.type,
      label: inputs.label,
      owner: this.req.me.id
    }).fetch();

    var imageSrc = url.resolve(sails.config.custom.baseUrl, '/api/v1/things/'+newThing.id+'/photo');

    // Return the newly-created thing, with its `imageSrc`
    return exits.success({
      id: newThing.id,
      imageSrc
    });

  }


};
