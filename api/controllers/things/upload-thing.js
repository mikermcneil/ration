module.exports = {


  friendlyName: 'Upload thing',


  description: 'Upload info about an item that will be visible for friends to borrow.',


  files: ['photo'],


  inputs: {

    photo: {
      description: 'Upstream for an incoming file upload.',
      type: 'ref',
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

    imageUploadFailed: {
      description: 'The provided photo failed to upload.'
    },

  },


  fn: async function (inputs, exits) {

    var url = require('url');

    // Upload the image.
    var uploadedFile = await sails.uploadOne(inputs.photo)
    .intercept((err)=>{
      sails.log.error('Upload failed:',err);
      return 'imageUploadFailed';
    });

    // Create a new "thing" record.
    var newThing = await Thing.create({
      imageUploadFd: uploadedFile.fd,
      imageUploadMime: uploadedFile.type,
      label: inputs.label,
      owner: this.req.me.id
    }).fetch();

    newThing.imageSrc = url.resolve(sails.config.custom.baseUrl, '/api/v1/things/'+newThing.id+'/photo');

    // Return the newly-created thing, with its `imageSrc`
    return exits.success(newThing);

  }


};
