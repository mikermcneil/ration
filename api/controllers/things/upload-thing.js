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

    noFileAttached: {
      description: 'No file was attached.',
      responseType: 'badRequest'
    },

    tooBig: {
      description: 'The file is too big.',
      responseType: 'badRequest'
    },

  },


  fn: async function ({photo, label}, exits) {

    var url = require('url');
    var util = require('util');

    // Upload the image.
    var info = await sails.uploadOne(photo, {
      maxBytes: 500000
    })
    // Note: E_EXCEEDS_UPLOAD_LIMIT is the error code for exceeding
    // `maxBytes` for both skipper-disk and skipper-s3.
    .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
    .intercept((err)=>new Error('The photo upload failed: '+util.inspect(err)));

    if(!info) {
      throw 'noFileAttached';
    }

    // Create a new "thing" record.
    var newThing = await Thing.create({
      imageUploadFd: info.fd,
      imageUploadMime: info.type,
      label,
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
